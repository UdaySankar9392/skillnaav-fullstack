from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

from fastapi import FastAPI, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import fitz  # PyMuPDF for PDF parsing
import spacy
import openai
import os
import io
import json
import boto3 # type: ignore
import numpy as np
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

# OpenAI API Key
openai.api_key = os.getenv("OPENAI_API_KEY")
print(f"[{now()}] OPENAI_API_KEY: {os.getenv('OPENAI_API_KEY')}")

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
        # Explicitly pass AWS credentials from environment variables
        s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_DEFAULT_REGION")
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
    """Use OpenAI GPT to generate a readiness score."""
    start = datetime.now()
    try:
        # Create a client instance (or reuse a global one if available)
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a recruitment AI assessing candidate resumes."},
                {"role": "user", "content": (
                    f"Evaluate this resume against job details and provide a readiness score out of 100.\n\n"
                    f"Resume: {resume_text}\n\nJob Description: {job_description}\n\nRequired Skills: {job_skills}"
                )}
            ]
        )
        score_text = response.choices[0].message.content
        print(f"[{now()}] OpenAI response: {score_text} (took {(datetime.now()-start).total_seconds()} sec)")
        
        # Extract the first number found in the response
        import re
        score_match = re.search(r'\d+', score_text)
        return int(score_match.group()) if score_match else 0
        
    except Exception as e:
        print(f"[{now()}] Error generating readiness score with OpenAI: {e}")
        return 0
 
def calculate_similarity(resume_texts, job_description, job_skills):
    """Calculate TF-IDF similarity between resumes and job description + skills."""
    start = datetime.now()
    try:
        job_details = job_description + " " + " ".join(job_skills)
        documents = [job_details] + resume_texts
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(documents)
        similarity_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        print(f"[{now()}] Similarity scores calculated: {similarity_scores} (took {(datetime.now()-start).total_seconds()} sec)")
        return similarity_scores
    except Exception as e:
        print(f"[{now()}] Error calculating similarity scores: {e}")
        return [0] * len(resume_texts)

@app.post("/partner/shortlist")
async def shortlist_candidates(
    job_description: str = Form(...),
    job_skills: str = Form(...),  # Expecting a JSON string, e.g. '["skill1", "skill2"]'
    resumes: list[str] = Form(...)  # List of resume URLs
):
    """
    Shortlist candidates by downloading resumes from S3, extracting text,
    calculating readiness score using OpenAI, and then performing ATS filtering.
    """
    overall_start = datetime.now()
    candidates = []
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

    try:
        for resume_url in resumes:
            resume_start = datetime.now()
            print(f"[{now()}] Processing resume from URL: {resume_url}")

            # Fetch application data from MongoDB
            application = db.applications.find_one(
                {"resumeUrl": resume_url},
                {"userName": 1, "userEmail": 1, "appliedDate": 1, "_id": 0}
            )
            print(f"[{now()}] Found application for {resume_url}: {application}")

            # Download and process resume
            file_stream = download_resume_from_s3(resume_url)
            if file_stream is None:
                continue
            text = extract_text_from_pdf(file_stream)
            extracted_info = extract_resume_info(text)
            readiness_score = get_readiness_score(text, job_description, job_skills_list)
            print(f"[{now()}] Readiness score for resume ({resume_url}): {readiness_score} (Processed in {(datetime.now()-resume_start).total_seconds()} sec)")

            if readiness_score > 70:
                candidates.append({
                    "name": application.get("userName", "N/A") if application else "N/A",
                    "email": application.get("userEmail", "N/A") if application else "N/A",
                    "appliedDate": application.get("appliedDate", "N/A") if application else "N/A",
                    "resumeUrl": resume_url,
                    "readiness_score": readiness_score,
                    "text": extracted_info["text"],
                    "skills": extracted_info["skills"]
                })

        # Calculate similarity scores across all shortlisted candidates
        similarity_scores = calculate_similarity([c["text"] for c in candidates], job_description, job_skills_list)
        for i, candidate in enumerate(candidates):
            candidate["similarity_score"] = similarity_scores[i]

        candidates = sorted(candidates, key=lambda x: (x["readiness_score"], x["similarity_score"]), reverse=True)
        print(f"[{now()}] Shortlisted candidates: {candidates}")
        print(f"[{now()}] Total processing time: {(datetime.now()-overall_start).total_seconds()} sec")

        # Store in MongoDB if there are candidates
        if candidates:
            shortlist_collection.insert_many(candidates)
            print(f"[{now()}] Shortlisted candidates stored in MongoDB.")
        else:
            print(f"[{now()}] No candidates met the readiness score threshold.")

        # Convert any remaining ObjectId's to strings (if present) before returning
        return {"shortlisted_candidates": convert_object_ids(candidates)}
    except Exception as e:
        print(f"[{now()}] Error in shortlist_candidates endpoint: {e}")
        return {"error": str(e)}

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