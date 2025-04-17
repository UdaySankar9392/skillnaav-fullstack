from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

import asyncio
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import fitz  # PyMuPDF for PDF parsing
import spacy
# import openai   # Removed: using Amazon Bedrock instead of OpenAI
import os
import io
import json
import boto3  # type: ignore
from urllib.parse import urlparse
from sklearn.feature_extraction.text import TfidfVectorizer  # type: ignore
from sklearn.metrics.pairwise import cosine_similarity  # type: ignore
from datetime import datetime
from bson import ObjectId  # Import ObjectId from bson

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
aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
aws_region = os.getenv("AWS_REGION")
if not all([aws_access_key_id, aws_secret_access_key, aws_region]):
    raise ValueError("Missing AWS credentials or region in .env file!")
bedrock_client = boto3.client(
    service_name="bedrock-runtime",
    region_name=aws_region,
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key
)

# For backward compatibility, printing the OPENAI_API_KEY variable (not used anymore)
# print(f"[{now()}] OPENAI_API_KEY: {os.getenv('OPENAI_API_KEY')}")

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["ai_backend"]
shortlist_collection = db["shortlisted_candidates"]
print(f"[{now()}] MONGO_URI: {os.getenv('MONGO_URI')}")

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
            "max_gen_len": 2048,  # Change to 2048 if desired
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

def download_resume_from_s3(resume_url: str):
    """
    Download a resume file from S3 using its URL.
    Assumes URL is in a format like: https://{bucket}.s3.amazonaws.com/{key}
    """
    start = datetime.now()
    try:
        parsed = urlparse(resume_url)
        bucket = parsed.netloc.split('.')[0]
        key = parsed.path.lstrip('/')
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

def extract_text_from_pdf(pdf_file):
    """Extract text from a PDF file-like object."""
    start = datetime.now()
    text = ""
    try:
        with fitz.open(stream=pdf_file.read(), filetype="pdf") as doc:
            for page in doc:
                text += page.get_text("text")
        print(f"[{now()}] PDF text extracted successfully in {(datetime.now()-start).total_seconds()} sec.")
    except Exception as e:
        print(f"[{now()}] Error extracting text from PDF: {e}")
    return text

def extract_resume_info(text):
    """Extract skills, experience, and education using spaCy."""
    start = datetime.now()
    skills = []
    try:
        doc = nlp(text)
        skills = [ent.text for ent in doc.ents if ent.label_ in ["ORG", "GPE"]]
        print(f"[{now()}] Skills extracted from resume: {skills} in {(datetime.now()-start).total_seconds()} sec.")
    except Exception as e:
        print(f"[{now()}] Error extracting skills from resume: {e}")
    return {"text": text, "skills": skills}

def get_readiness_score(resume_text, job_description, job_skills):
    """Use Amazon Bedrock to generate a readiness score."""
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
        print(f"[{now()}] Error generating readiness score with Bedrock: {e}")
        return 0

def calculate_similarity(resume_texts, job_description, job_skills):
    """Calculate TF-IDF similarity between resumes and job description + skills."""
    start = datetime.now()
    try:
        if not resume_texts:
            return []
        job_details = job_description + " " + " ".join(job_skills)
        documents = [job_details] + resume_texts
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(documents)
        similarity_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        print(f"[{now()}] Similarity scores calculated: {similarity_scores} (took {(datetime.now()-start).total_seconds()} sec)")
        return similarity_scores.tolist()
    except Exception as e:
        print(f"[{now()}] Error calculating similarity scores: {e}")
        return [0] * len(resume_texts)

# Asynchronous helper function to process each resume concurrently
async def process_resume(resume_url, job_description, job_skills_list):
    loop = asyncio.get_event_loop()
    resume_start = datetime.now()
    print(f"[{now()}] Processing resume from URL: {resume_url}")

    # Fetch application data (synchronously, assumed fast)
    application = db.applications.find_one(
        {"resumeUrl": resume_url},
        {"userName": 1, "userEmail": 1, "appliedDate": 1, "_id": 0}
    )
    print(f"[{now()}] Found application for {resume_url}: {application}")

    # Download resume (blocking I/O offloaded to executor)
    file_stream = await loop.run_in_executor(None, download_resume_from_s3, resume_url)
    if file_stream is None:
        return None

    # Extract text from PDF (blocking CPU-bound task)
    text = await loop.run_in_executor(None, extract_text_from_pdf, file_stream)
    # Process resume info with spaCy
    extracted_info = await loop.run_in_executor(None, extract_resume_info, text)
    # Get readiness score via Bedrock API (blocking network call)
    readiness_score = await loop.run_in_executor(None, get_readiness_score, text, job_description, job_skills_list)
    print(f"[{now()}] Readiness score for {resume_url}: {readiness_score} (Processed in {(datetime.now()-resume_start).total_seconds()} sec)")

    if readiness_score > 60:
        return {
            "name": application.get("userName", "N/A") if application else "N/A",
            "email": application.get("userEmail", "N/A") if application else "N/A",
            "appliedDate": application.get("appliedDate", "N/A") if application else "N/A",
            "resumeUrl": resume_url,
            "readiness_score": readiness_score,
            "text": extracted_info["text"],
            "skills": extracted_info["skills"]
        }
    return None 

@app.post("/partner/shortlist")
async def shortlist_candidates(
    job_description: str = Form(...),
    job_skills: str = Form(...),  # Expecting a JSON string, e.g. '["skill1", "skill2"]'
    resumes: list[str] = Form(...)  # List of resume URLs
):
    """
    Shortlist candidates by downloading resumes from S3, extracting text,
    calculating readiness score using Bedrock, and then performing ATS filtering.
    Processing is done concurrently to reduce overall latency.
    """
    overall_start = datetime.now()
    print(f"[{now()}] Received request to shortlist candidates.")
    print(f"[{now()}] Job Description: {job_description}")
    print(f"[{now()}] Job Skills (raw): {job_skills}")
    print(f"[{now()}] Number of Resume URLs: {len(resumes)}")

    # Parse job_skills JSON string into a list
    try:
        job_skills_list = json.loads(job_skills)
    except Exception as e:
        print(f"[{now()}] Error parsing job_skills: {e}")
        job_skills_list = []

    # Create concurrent tasks for processing each resume
    tasks = [process_resume(url, job_description, job_skills_list) for url in resumes]
    results = await asyncio.gather(*tasks)
    candidates = [res for res in results if res is not None]

    # Calculate similarity scores if we have any shortlisted candidates
    if candidates:
        similarity_scores = calculate_similarity([c["text"] for c in candidates], job_description, job_skills_list)
        for i, candidate in enumerate(candidates):
            candidate["similarity_score"] = similarity_scores[i] if i < len(similarity_scores) else 0
    else:
        print(f"[{now()}] No candidates met the readiness score threshold.")

    candidates = sorted(candidates, key=lambda x: (x["readiness_score"], x.get("similarity_score", 0)), reverse=True)
    print(f"[{now()}] Shortlisted candidates: {candidates}")
    print(f"[{now()}] Total processing time: {(datetime.now()-overall_start).total_seconds()} sec")

    # Store in MongoDB if there are candidates
    if candidates:
        shortlist_collection.insert_many(candidates)
        print(f"[{now()}] Shortlisted candidates stored in MongoDB.")
    else:
        print(f"[{now()}] No candidates met the readiness score threshold.")

    return {"shortlisted_candidates": convert_object_ids(candidates)}

@app.get("/partner/shortlisted")
async def get_shortlisted_candidates():
    """Retrieve all shortlisted candidates from MongoDB."""
    try:
        candidates = list(shortlist_collection.find({}, {"_id": 0}))
        print(f"[{now()}] Retrieved shortlisted candidates from MongoDB.")
        return {"shortlisted_candidates": convert_object_ids(candidates)}
    except Exception as e:
        print(f"[{now()}] Error retrieving shortlisted candidates: {e}")
        return {"error": str(e)}

@app.get("/partner/fetch-applications/{job_id}")
async def fetch_applications(job_id: str):
    """Fetch applications and resumes for a given job ID."""
    try:
        applications = list(db["applications"].find({"job_id": job_id}, {"_id": 0}))
        print(f"[{now()}] Retrieved applications for job ID {job_id}.")
        return {"applications": convert_object_ids(applications)}
    except Exception as e:
        print(f"[{now()}] Error fetching applications: {e}")
        return {"error": str(e)}
