from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

import asyncio
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import fitz  # PyMuPDF for PDF parsing
import spacy
import os
import io
import json
import boto3  # type: ignore
from urllib.parse import urlparse
from sklearn.feature_extraction.text import TfidfVectorizer  # type: ignore
from sklearn.metrics.pairwise import cosine_similarity  # type: ignore
from datetime import datetime
from bson import ObjectId  # Import ObjectId from bson
from fastapi import FastAPI, Form, HTTPException, status

# Utility to get current time as string
def now():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# Helper function to convert ObjectId's to strings recursively
def convert_object_ids(obj):
    if isinstance(obj, list):
        return [convert_object_ids(item) for item in obj]
    elif isinstance(obj, dict):
        new_obj = {}
        for k, v in obj.items():
            if isinstance(v, ObjectId):
                new_obj[k] = str(v)
            else:
                new_obj[k] = convert_object_ids(v)
        return new_obj
    else:
        return obj

# Load NLP Model
print(f"[{now()}] Loading spaCy model...")
nlp = spacy.load('en_core_web_sm')

# Setup AWS credentials and initialize Bedrock client
aws_access_key_id     = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
aws_region            = os.getenv("AWS_REGION")
if not all([aws_access_key_id, aws_secret_access_key, aws_region]):
    raise ValueError("Missing AWS credentials or region in .env file!")
bedrock_client = boto3.client(
    service_name="bedrock-runtime",
    region_name=aws_region,
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key
)

# MongoDB Connection (use database from URI)
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("Missing MONGO_URI in .env file!")
client = MongoClient(MONGO_URI)
db     = client.get_default_database()  # uses database specified in URI
print(f"[{now()}] Connected to MongoDB database: {db.name}")
shortlist_collection    = db["shortlisted_candidates"]
applications_collection = db["applications"]

# Initialize FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Function to invoke Amazon Bedrock
def invoke_bedrock(prompt_text):
    try:
        body = {
            "prompt": prompt_text,
            "max_gen_len": 2048,
            "temperature": 0.5,
            "top_p": 0.9
        }
        response = bedrock_client.invoke_model(
            modelId="meta.llama3-8b-instruct-v1:0",
            body=json.dumps(body),
            contentType="application/json",
            accept="application/json"
        )
        response_body = json.loads(response['body'].read())
        return response_body.get("generation", "")
    except Exception as e:
        print(f"[{now()}] Bedrock Error: {e}")
        return ""

# Download resume from S3
def download_resume_from_s3(resume_url: str):
    start = datetime.now()
    try:
        parsed = urlparse(resume_url)
        bucket = parsed.netloc.split('.')[0]
        key    = parsed.path.lstrip('/')
        s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv("Resume_AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("Resume_AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("Resume_AWS_REGION")
        )
        file_stream = io.BytesIO()
        s3_client.download_fileobj(bucket, key, file_stream)
        file_stream.seek(0)
        print(f"[{now()}] Downloaded resume from S3: bucket={bucket}, key={key} in {(datetime.now()-start).total_seconds()} sec")
        return file_stream
    except Exception as e:
        print(f"[{now()}] Error downloading resume from S3: {e}")
        return None

# Extract text from PDF
def extract_text_from_pdf(pdf_file):
    start = datetime.now()
    text = ""
    try:
        with fitz.open(stream=pdf_file.read(), filetype="pdf") as doc:
            for page in doc:
                text += page.get_text("text")
        print(f"[{now()}] PDF text extracted in {(datetime.now()-start).total_seconds()} sec.")
    except Exception as e:
        print(f"[{now()}] Error extracting text from PDF: {e}")
    return text

# Extract resume info with spaCy
def extract_resume_info(text):
    start = datetime.now()
    skills = []
    try:
        doc    = nlp(text)
        skills = [ent.text for ent in doc.ents if ent.label_ in ["ORG", "GPE"]]
        print(f"[{now()}] Skills extracted: {skills} in {(datetime.now()-start).total_seconds()} sec.")
    except Exception as e:
        print(f"[{now()}] Error extracting skills: {e}")
    return {"text": text, "skills": skills}

# Readiness score via Bedrock
def get_readiness_score(resume_text, job_description, job_skills):
    start = datetime.now()
    try:
        prompt = (
            f"Evaluate this resume against job details and provide a readiness score out of 100.\n\n"
            f"Resume: {resume_text}\n\nJob Description: {job_description}\n\nRequired Skills: {job_skills}"
        )
        score_text = invoke_bedrock(prompt)
        print(f"[{now()}] Bedrock response: {score_text} (took {(datetime.now()-start).total_seconds()} sec)")
        import re
        score_match = re.search(r'\d+', score_text)
        return int(score_match.group()) if score_match else 0
    except Exception as e:
        print(f"[{now()}] Error generating readiness score: {e}")
        return 0

# TF-IDF similarity
def calculate_similarity(resume_texts, job_description, job_skills):
    start = datetime.now()
    try:
        if not resume_texts:
            return []
        job_details = job_description + " " + " ".join(job_skills)
        documents  = [job_details] + resume_texts
        vectorizer = TfidfVectorizer()
        tfidf_matrix= vectorizer.fit_transform(documents)
        similarity_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        print(f"[{now()}] Similarity scores: {similarity_scores} (took {(datetime.now()-start).total_seconds()} sec)")
        return similarity_scores.tolist()
    except Exception as e:
        print(f"[{now()}] Error calculating similarity: {e}")
        return [0] * len(resume_texts)

# Process a single resume
async def process_resume(resume_url, job_description, job_skills_list):
    loop = asyncio.get_event_loop()
    resume_start = datetime.now()
    print(f"[{now()}] Processing resume URL: {resume_url}")

    # Fetch application document
    application = await loop.run_in_executor(
        None,
        lambda: applications_collection.find_one({"resumeUrl": resume_url})
    )
    print(f"[{now()}] Raw application doc for {resume_url}: {application!r}")

    # Map fields with fallbacks
    if application:
        name        = application.get("userName")    or application.get("name")       or "N/A"
        email       = application.get("userEmail")   or application.get("email")      or "N/A"
        appliedDate = (
            application.get("appliedDate")
            or application.get("applied_date")       
            or application.get("appliedOn")          
            or "N/A"
        )
        print(f"[{now()}] Mapped → name={name}, email={email}, appliedDate={appliedDate}")
    else:
        name = email = appliedDate = "N/A"
        print(f"[{now()}] No application record for URL: {resume_url}")

    # Download, extract, score
    file_stream = await loop.run_in_executor(None, download_resume_from_s3, resume_url)
    if file_stream is None:
        return None
    text            = await loop.run_in_executor(None, extract_text_from_pdf, file_stream)
    extracted_info  = await loop.run_in_executor(None, extract_resume_info, text)
    readiness_score = await loop.run_in_executor(None, get_readiness_score, text, job_description, job_skills_list)
    print(f"[{now()}] Readiness score: {readiness_score} (took {(datetime.now()-resume_start).total_seconds()} sec)")

    if readiness_score > 60:
        return {
            "name": name,
            "email": email,
            "appliedDate": appliedDate,
            "resumeUrl": resume_url,
            "readiness_score": readiness_score,
            "text": extracted_info["text"],
            "skills": extracted_info["skills"]
        }
    return None

# Shortlist endpoint
@app.post("/partner/shortlist")
async def shortlist_candidates(
    internship_id: str       = Form(...),
    job_description: str     = Form(...),
    job_skills: str          = Form(...),
    resumes: list[str]       = Form(...)
):
    overall_start = datetime.now()
    print(f"[{now()}] Request to shortlist for internship ID: {internship_id}")

    # 1) Convert internship_id → ObjectId (400 if invalid)
    try:
        internship_obj_id = ObjectId(internship_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid internship_id '{internship_id}': {e}"
        )

    # 2) Parse skills JSON
    try:
        job_skills_list = json.loads(job_skills)
    except Exception:
        print(f"[{now()}] Invalid job_skills JSON, defaulting to []")
        job_skills_list = []

    # 3) Process all resumes
    tasks     = [process_resume(url, job_description, job_skills_list) for url in resumes]
    results   = await asyncio.gather(*tasks)
    # always define candidates
    candidates = [c for c in results if c]

    # 4) Enrich with similarity + the real ObjectId
    if candidates:
        scores = calculate_similarity(
            [c["text"] for c in candidates],
            job_description,
            job_skills_list
        )
        for i, cand in enumerate(candidates):
            cand["similarity_score"] = scores[i] if i < len(scores) else 0
            cand["internship_id"]    = internship_obj_id  # store as ObjectId

    print(f"[{now()}] Shortlisted candidates (before sort): {candidates}")
    # 5) Sort & persist
    candidates = sorted(
        candidates,
        key=lambda x: (x["readiness_score"], x.get("similarity_score", 0)),
        reverse=True
    )
    print(f"[{now()}] Shortlisted candidates (after sort): {candidates}")
    print(f"[{now()}] Total processing time: {(datetime.now() - overall_start).total_seconds()} sec")

    if candidates:
        try:
            shortlist_collection.insert_many(candidates)
            print(f"[{now()}] Stored shortlisted candidates.")
        except Exception as e:
            print(f"[{now()}] Error storing candidates: {e}")

    return {"shortlisted_candidates": convert_object_ids(candidates)}
# Retrieve shortlisted by internship_id
@app.get("/partner/shortlisted/{internship_id}")
async def get_shortlisted_candidates(internship_id: str):
    # Convert path param to ObjectId
    try:
        internship_obj_id = ObjectId(internship_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid internship_id '{internship_id}': {e}"
        )

    try:
        docs = list(shortlist_collection.find(
            {"internship_id": internship_obj_id}
        ))
        print(f"[{now()}] Retrieved shortlisted for {internship_obj_id}: {docs}")
        return {"shortlisted_candidates": convert_object_ids(docs)}
    except Exception as e:
        print(f"[{now()}] Error retrieving shortlisted: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
# Fetch applications for a job
@app.get("/partner/fetch-applications/{job_id}")
async def fetch_applications(job_id: str):
    try:
        apps = list(db["applications"].find({"job_id": job_id}, {"_id": 0}))
        print(f"[{now()}] Applications for job {job_id}: {apps}")
        return {"applications": convert_object_ids(apps)}
    except Exception as e:
        print(f"[{now()}] Error fetching applications: {e}")
        return {"error": str(e)}
