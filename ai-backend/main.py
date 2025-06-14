from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import fitz  # PyMuPDF for PDFs
import docx  # python-docx for DOCX files
import logging
import spacy
import boto3 # type: ignore
from dotenv import load_dotenv
import time
import json
import re
import traceback  # For error logging
from datetime import datetime  # For timestamp utility

# Load environment variables
load_dotenv()
aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
aws_region = os.getenv("AWS_REGION")
if not all([aws_access_key_id, aws_secret_access_key, aws_region]):
    raise ValueError("Missing AWS credentials or region. Check your .env file!")

# Initialize Bedrock client
bedrock_client = boto3.client(
    service_name="bedrock-runtime",
    region_name=aws_region,
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load NLP model
nlp = spacy.load("en_core_web_sm")

# Utility function for current timestamp
def now():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# Extract text from PDF
def extract_text_from_pdf(pdf_file):
    pdf_file.file.seek(0)  # Reset file pointer before reading
    doc = fitz.open(stream=pdf_file.file.read(), filetype="pdf")
    return "\n".join(page.get_text() for page in doc)

# Extract text from DOCX
def extract_text_from_docx(docx_file):
    doc = docx.Document(docx_file.file)
    return "\n".join([para.text for para in doc.paragraphs])

# Predefined technical skills to improve extraction
TECH_SKILLS = {
    "python", "java", "javascript", "react", "node.js", "django", "flask", 
    "c++", "c#", "sql", "postgresql", "mongodb", "html", "css", "aws", 
    "azure", "docker", "kubernetes", "tensorflow", "pandas", "numpy", "git", 
    "agile", "scrum", "jira", "rest api", "graphql", "machine learning",
    "express.js", "expressjs", "react.js", "reactjs", "nodejs"
}

# Normalize skill names for comparison
def normalize_skill_name(skill):
    skill = skill.lower().strip()
    skill = re.sub(r"[^a-zA-Z0-9.#+]", "", skill)  # Remove special characters
    
    # Handle common variations
    if skill == "nodejs":
        return "node.js"
    if skill == "expressjs":
        return "express.js"
    if skill == "reactjs":
        return "react.js"
    return skill

# Invoke Amazon Bedrock model using provided payload and model parameters
def invoke_bedrock(prompt_text):
    try:
        # Format the prompt if needed (here we simply forward the text)
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
        logger.error(f"Bedrock Error: {str(e)}")
        logger.error(f"Full Traceback: {traceback.format_exc()}")
        return ""

# Extract skills from the resume text
def extract_skills_from_resume(text):
    found_skills = set()
    for skill in TECH_SKILLS:
        if re.search(rf"\b{re.escape(skill)}\b", text, re.IGNORECASE):
            found_skills.add(skill)
    
    # Use Bedrock to extract additional skills
    try:
        prompt = f"""
Extract technical skills from the following resume text. 
Focus on programming languages, frameworks, databases, tools, and methodologies.
Resume Text:
{text}
"""
        response_text = invoke_bedrock(prompt)
        extracted_skills = response_text.strip().split(", ")
        for skill in extracted_skills:
            normalized_skill = normalize_skill_name(skill)
            if normalized_skill in TECH_SKILLS:
                found_skills.add(normalized_skill)
        logger.info("Additional skills extracted using Bedrock.")
    except Exception as e:
        logger.error(f"Bedrock Error (Extract Skills): {str(e)}")
        logger.error(f"Full Traceback: {traceback.format_exc()}")
    
    logger.info(f"Found Skills: {found_skills}")
    return list(found_skills)

# Identify skill gaps
def identify_skill_gaps(user_skills, job_skills):
    user_skills_normalized = set(map(normalize_skill_name, user_skills))
    job_skills_normalized = set(map(normalize_skill_name, job_skills))
    logger.info(f"User Skills (Normalized): {user_skills_normalized}")
    logger.info(f"Job Skills (Normalized): {job_skills_normalized}")
    return list(job_skills_normalized - user_skills_normalized)

# Readiness Score Calculation
def calculate_readiness_score(user_skills, job_skills):
    if not job_skills:
        return 0  
    user_skills_normalized = set(map(normalize_skill_name, user_skills))
    job_skills_normalized = set(map(normalize_skill_name, job_skills))
    match_score = (len(user_skills_normalized & job_skills_normalized) / len(job_skills_normalized)) * 100
    return round(match_score, 2)

# Generate AI-based Course Recommendations using Bedrock
def generate_course_recommendations(skill_gaps):
    if not skill_gaps:
        return {"message": "No skill gaps detected."}
    
    prompt = f"Suggest 3 high-quality online courses for learning: {', '.join(skill_gaps)}. Provide platform name (Coursera, Udemy, edX) and course title."
    try:
        time.sleep(1)
        response_text = invoke_bedrock(prompt)
        courses = response_text.strip().split("\n")
        logger.info(f"Raw Bedrock Response (Courses): {response_text}")
        return {"courses": courses}
    except Exception as e:
        logger.error(f"Bedrock Error (Course Recommendations): {str(e)}")
        logger.error(f"Full Traceback: {traceback.format_exc()}")
        return {
            "error": "An unexpected error occurred.",
            "suggestions": ["Coursera: https://www.coursera.org", "Udemy: https://www.udemy.com", "edX: https://www.edx.org"]
        }

# Generate AI-based Quiz Questions using Bedrock
def generate_quizzes(skill_gaps):
    if not skill_gaps:
        return []
    
    prompt = f"""
Create 3 multiple-choice quiz questions to test knowledge in: {', '.join(skill_gaps)}.
Format as a JSON array where each object has the following fields:
- 'question': The multiple-choice question text.
- 'options': An array of strings, representing the answer options labeled A, B, C, and D.
- 'answer': A string indicating the correct answer option (e.g., 'A', 'B', 'C', or 'D').

Example:
[
  {{
    "question": "What is the capital of France?",
    "options": ["A. Berlin", "B. Paris", "C. Madrid", "D. Rome"],
    "answer": "B"
  }},
  {{
    "question": "What is the value of pi?",
    "options": ["A. 3.14", "B. 3.16", "C. 3.18", "D. 3.20"],
    "answer": "A"
  }}
]
"""
    try:
        time.sleep(1)
        response_text = invoke_bedrock(prompt)
        logger.info(f"Raw Bedrock Response (Quiz): {response_text}")
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if json_match:
            json_text = json_match.group(0)
        else:
            logger.error("JSON not found in Bedrock response.")
            return {"error": "Could not find valid JSON in Bedrock response.", "raw": response_text}
        try:
            quizzes = json.loads(json_text)
            logger.info(f"Parsed Quizzes: {quizzes}")
            return quizzes
        except json.JSONDecodeError as e:
            logger.error(f"JSON Decode Error: {str(e)} | Raw Response: {response_text}")
            return {"error": "Invalid JSON format from Bedrock API.", "raw": response_text}
    except Exception as e:
        logger.error(f"Bedrock Error (Generate Quizzes): {str(e)}")
        logger.error(f"Full Traceback: {traceback.format_exc()}")
        return {"error": "An unexpected error occurred."}

# API: Upload Resume & Analyze Skills
@app.post("/analyze-skills/")
async def analyze_skills(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    required_skills: str = Form(...)
):
    try:
        # Read file and extract text
        if file.filename.endswith(".pdf"):
            resume_text = extract_text_from_pdf(file)
        elif file.filename.endswith(".docx"):
            resume_text = extract_text_from_docx(file)
        else:
            raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and DOCX are supported.")

        logger.info(f"Extracted Resume Text: {resume_text}")
        user_skills = extract_skills_from_resume(resume_text)
        logger.info(f"Extracted Skills: {user_skills}")

        if not user_skills:
            raise HTTPException(status_code=400, detail="No skills found in the resume.")

        job_skills = [skill.strip() for skill in required_skills.split(",")]
        skill_gaps = identify_skill_gaps(user_skills, job_skills)
        logger.info(f"Skill Gaps: {skill_gaps}")
        readiness_score = calculate_readiness_score(user_skills, job_skills)
        recommendations = generate_course_recommendations(skill_gaps)
        quizzes = generate_quizzes(skill_gaps)

        return {
            "readiness_score": readiness_score,
            "user_skills": user_skills,
            "job_skills": job_skills,
            "skill_gaps": skill_gaps,
            "recommendations": recommendations,
            "quizzes": quizzes
        }
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        logger.error(f"Full Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "API is working!"}
