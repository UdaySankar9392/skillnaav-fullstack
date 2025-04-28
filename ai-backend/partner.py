from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

import asyncio
from fastapi import FastAPI, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import fitz  # PyMuPDF for PDF parsing
import spacy
import os
import io
import json
import boto3  # type: ignore
from botocore.exceptions import ClientError # type: ignore
from urllib.parse import urlparse
from sklearn.feature_extraction.text import TfidfVectorizer  # type: ignore
from sklearn.metrics.pairwise import cosine_similarity  # type: ignore
from datetime import datetime
from bson import ObjectId
import time

# Utility to get current time as string
def now():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# Helper to convert ObjectId to string
def convert_object_ids(obj):
    if isinstance(obj, list):
        return [convert_object_ids(item) for item in obj]
    elif isinstance(obj, dict):
        return {k: (str(v) if isinstance(v, ObjectId) else convert_object_ids(v)) for k, v in obj.items()}
    else:
        return obj

# Load spaCy model
print(f"[{now()}] Loading spaCy model...")
nlp = spacy.load('en_core_web_sm')

# AWS Bedrock client setup
aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
aws_region = os.getenv("AWS_REGION")
if not all([aws_access_key_id, aws_secret_access_key, aws_region]):
    raise ValueError("Missing AWS credentials or region in .env!")
bedrock_client = boto3.client(
    service_name="bedrock-runtime",
    region_name=aws_region,
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key
)

# MongoDB connection
db = MongoClient(os.getenv("MONGO_URI")).get_default_database()
print(f"[{now()}] Connected to MongoDB: {db.name}")
shortlist_collection = db["shortlisted_candidates"]
applications_collection = db["applications"]

# FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bedrock invocation with improved backoff and dynamic truncation
def invoke_bedrock(prompt_text: str) -> str:
    # dynamically adjust prompt size to avoid token limits
    max_prompt_length = 2000
    safe_prompt = prompt_text[:max_prompt_length]
    body = {"prompt": safe_prompt, "max_gen_len": 1000, "temperature": 0.5, "top_p": 0.9}
    retries = 4
    for attempt in range(1, retries + 1):
        try:
            resp = bedrock_client.invoke_model(
                modelId="meta.llama3-8b-instruct-v1:0",
                body=json.dumps(body),
                contentType="application/json",
                accept="application/json"
            )
            out = json.loads(resp['body'].read())
            return out.get("generation", "")
        except ClientError as e:
            code = e.response.get('Error', {}).get('Code', '')
            print(f"[{now()}] Bedrock ClientError (attempt {attempt}): {code} - {e}")
            if code == 'ThrottlingException' and attempt < retries:
                backoff = 2 ** attempt
                print(f"[{now()}] Throttled. Sleeping for {backoff}s before retrying...")
                time.sleep(backoff)
                continue
            # for other errors or last attempt, break
            break
        except Exception as e:
            print(f"[{now()}] Bedrock Unexpected Error: {e}")
            break

    print(f"[{now()}] Bedrock invocation failed after {retries} attempts.")
    return ""

# Download resume from S3 with logging
def download_resume_from_s3(resume_url: str):
    print(f"[{now()}] Downloading resume from: {resume_url}")
    try:
        parsed = urlparse(resume_url)
        bucket = parsed.netloc.split('.')[0]
        key = parsed.path.lstrip('/')
        s3 = boto3.client(
            's3',
            aws_access_key_id=os.getenv("Resume_AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("Resume_AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("Resume_AWS_REGION")
        )
        buf = io.BytesIO()
        s3.download_fileobj(bucket, key, buf)
        buf.seek(0)
        return buf
    except Exception as e:
        print(f"[{now()}] S3 Download Error for {resume_url}: {e}")
        return None

# Extract text from PDF
def extract_text_from_pdf(pdf_file):
    text = ""
    try:
        pdf_file.seek(0)
        with fitz.open(stream=pdf_file.read(), filetype="pdf") as doc:
            for page in doc:
                text += page.get_text("text")
    except Exception as e:
        print(f"[{now()}] PDF Extract Error: {e}")
    return text

# Extract resume info using spaCy
def extract_resume_info(text):
    skills = []
    try:
        doc = nlp(text)
        skills = [ent.text for ent in doc.ents if ent.label_ in ["ORG", "GPE"]]
    except Exception as e:
        print(f"[{now()}] NLP Extract Error: {e}")
    return {"text": text, "skills": skills}

# Get readiness score with prompt truncation
def get_readiness_score(resume_text: str, job_description: str, job_skills: list) -> int:
    try:
        prompt = (
            f"Evaluate this resume out of 100.\nResume snippet:\n{resume_text[:500]}\n"
            f"Job Description snippet:\n{job_description[:500]}\nSkills:{job_skills}"
        )
        score_txt = invoke_bedrock(prompt)
        import re
        m = re.search(r"\d+", score_txt)
        return int(m.group()) if m else 0
    except Exception as e:
        print(f"[{now()}] Score Error: {e}")
        return 0

# TF-IDF similarity
def calculate_similarity(resume_texts, job_description, job_skills):
    if not resume_texts:
        return []
    job_details = job_description + " " + " ".join(job_skills)
    docs = [job_details] + resume_texts
    vec = TfidfVectorizer()
    tfidf_matrix = vec.fit_transform(docs)
    sims = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    return sims.tolist()

# Process a single resume
async def process_resume(resume_url, job_description, job_skills_list):
    application = await asyncio.get_event_loop().run_in_executor(
        None, lambda: applications_collection.find_one({"resumeUrl": resume_url})
    )
    if application:
        name = application.get("userName") or application.get("name") or "N/A"
        email = application.get("userEmail") or application.get("email") or "N/A"
        applied_date = (application.get("appliedDate") or application.get("applied_date")
                        or application.get("appliedOn") or "N/A")
        student_id = (application.get("studentId") or application.get("student_id")
                      or application.get("studentID") or "N/A")
    else:
        name = email = applied_date = student_id = "N/A"

    file_stream = await asyncio.get_event_loop().run_in_executor(None, download_resume_from_s3, resume_url)
    if not file_stream:
        return None
    text = await asyncio.get_event_loop().run_in_executor(None, extract_text_from_pdf, file_stream)
    info = await asyncio.get_event_loop().run_in_executor(None, extract_resume_info, text)
    readiness = await asyncio.get_event_loop().run_in_executor(None, get_readiness_score, text, job_description, job_skills_list)

    if readiness > 60:
        return {
            "student_id": student_id,
            "name": name,
            "email": email,
            "appliedDate": applied_date,
            "resumeUrl": resume_url,
            "readiness_score": readiness,
            "text": info["text"],
            "skills": info["skills"]
        }
    return None

# Remaining endpoints
@app.post("/partner/shortlist")
async def shortlist_candidates(
    internship_id: str = Form(...),
    job_description: str = Form(...),
    job_skills: str = Form(...),
    resumes: list[str] = Form(...)
):
    try:
        internship_obj_id = ObjectId(internship_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid internship_id: {e}")

    try:
        job_skills_list = json.loads(job_skills)
    except Exception:
        job_skills_list = []

    tasks = [process_resume(url, job_description, job_skills_list) for url in resumes]
    results = await asyncio.gather(*tasks)
    candidates = [c for c in results if c]

    if candidates:
        sims = calculate_similarity([c['text'] for c in candidates], job_description, job_skills_list)
        for i, cand in enumerate(candidates):
            cand['similarity_score'] = sims[i] if i < len(sims) else 0
            cand['internship_id'] = ObjectId(internship_id)

    candidates = sorted(candidates, key=lambda x: (x['readiness_score'], x.get('similarity_score', 0)), reverse=True)
    if candidates:
        shortlist_collection.insert_many(candidates)

    return {"shortlisted_candidates": convert_object_ids(candidates)}

@app.get("/partner/shortlisted/{internship_id}")
async def get_shortlisted_candidates(internship_id: str):
    try:
        internship_obj_id = ObjectId(internship_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid internship_id '{internship_id}': {e}"
        )
    try:
        docs = list(shortlist_collection.find({"internship_id": internship_obj_id}))
        return {"shortlisted_candidates": convert_object_ids(docs)}
    except Exception as e:
        print(f"[{now()}] Error retrieving shortlisted: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get("/partner/fetch-applications/{job_id}")
async def fetch_applications(job_id: str):
    try:
        apps = list(db["applications"].find({"job_id": job_id}, {"_id": 0}))
        return {"applications": convert_object_ids(apps)}
    except Exception as e:
        print(f"[{now()}] Error fetching applications: {e}")
        return {"error": str(e)}
