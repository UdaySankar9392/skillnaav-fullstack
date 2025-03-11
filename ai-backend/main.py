from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import fitz  # type: ignore # PyMuPDF for PDFs
import docx  # type: ignore # python-docx for DOCX files
import logging
import spacy  # type: ignore
from openai import OpenAI  # Updated import
from dotenv import load_dotenv
import time
import json
import re
import traceback  # Import traceback for error logging

# Load environment variables
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("Missing OpenAI API key. Check your .env file!")

# Initialize OpenAI Client
client = OpenAI(api_key=openai_api_key)  # Initialize client globally

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

# Extract skills from the resume text
def extract_skills_from_resume(text):
    # Use regex to find skills in the text
    found_skills = set()
    for skill in TECH_SKILLS:
        if re.search(rf"\b{re.escape(skill)}\b", text, re.IGNORECASE):
            found_skills.add(skill)
    
    # Use OpenAI API to extract additional skills
    try:
        prompt = f"""
        Extract technical skills from the following resume text. 
        Focus on programming languages, frameworks, databases, tools, and methodologies.
        Resume Text:
        {text}
        """
        response = client.chat.completions.create(  # Use the global client
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2046
        )
        extracted_skills = response.choices[0].message.content.strip().split(", ")
        for skill in extracted_skills:
            normalized_skill = normalize_skill_name(skill)
            if normalized_skill in TECH_SKILLS:
                found_skills.add(normalized_skill)
        
        # Log token usage
        token_usage = response.usage
        logger.info(f"Token Usage (Extract Skills): {token_usage}")
    except Exception as e:
        logger.error(f"OpenAI Error: {str(e)}")
        logger.error(f"Full Traceback: {traceback.format_exc()}")  # Log full traceback
    
    logger.info(f"Found Skills: {found_skills}")  # Log found skills
    return list(found_skills)

# Identify skill gaps
def identify_skill_gaps(user_skills, job_skills):
    user_skills_normalized = set(map(normalize_skill_name, user_skills))
    job_skills_normalized = set(map(normalize_skill_name, job_skills))
    logger.info(f"User Skills (Normalized): {user_skills_normalized}")  # Log normalized user skills
    logger.info(f"Job Skills (Normalized): {job_skills_normalized}")  # Log normalized job skills
    return list(job_skills_normalized - user_skills_normalized)

# Readiness Score Calculation
def calculate_readiness_score(user_skills, job_skills):
    if not job_skills:
        return 0  
    user_skills_normalized = set(map(normalize_skill_name, user_skills))
    job_skills_normalized = set(map(normalize_skill_name, job_skills))
    match_score = (len(user_skills_normalized & job_skills_normalized) / len(job_skills_normalized)) * 100
    return round(match_score, 2)

# Generate AI-based Course Recommendations using OpenAI
def generate_course_recommendations(skill_gaps):
    if not skill_gaps:
        return {"message": "No skill gaps detected."}
    
    prompt = f"Suggest 3 high-quality online courses for learning: {', '.join(skill_gaps)}. Provide platform name (Coursera, Udemy, edX) and course title."

    try:
        time.sleep(1)  # Prevent rate limiting
        response = client.chat.completions.create(  # Use the global client
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2046
        )
        courses = response.choices[0].message.content.strip().split("\n")
        
        # Log token usage
        token_usage = response.usage
        logger.info(f"Token Usage (Course Recommendations): {token_usage}")
        
        # Log the raw response for debugging
        logger.info(f"Raw OpenAI Response: {response.choices[0].message.content}")
        
        return {"courses": courses}
    except Exception as e:
        logger.error(f"OpenAI Error: {str(e)}")
        logger.error(f"Full Traceback: {traceback.format_exc()}")  # Log full traceback
        return {
            "error": "An unexpected error occurred.",
            "suggestions": ["Coursera: https://www.coursera.org", "Udemy: https://www.udemy.com", "edX: https://www.edx.org"]
        }

# Generate AI-based Quiz Questions using OpenAI
def generate_quizzes(skill_gaps):
    if not skill_gaps:
        return []  # Return an empty list

    # Enhanced prompt for structured JSON with labeled options
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
        time.sleep(1)  # Prevent rate limiting
        response = client.chat.completions.create(  # Use the global client
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2046
        )

        raw_text = response.choices[0].message.content
        logger.info(f"Raw OpenAI Response: {raw_text}")

        # Robust JSON extraction using regex
        json_match = re.search(r'\[.*\]', raw_text, re.DOTALL)  # Find JSON array
        if json_match:
            json_text = json_match.group(0)
        else:
            logger.error("JSON not found in OpenAI response.")
            return {"error": "Could not find valid JSON in OpenAI response.", "raw": raw_text}

        try:
            quizzes = json.loads(json_text)
            logger.info(f"Parsed Quizzes: {quizzes}")  # Log the parsed quizzes
            
            # Log token usage
            token_usage = response.usage
            logger.info(f"Token Usage (Generate Quizzes): {token_usage}")
            
            return quizzes
        except json.JSONDecodeError as e:
            logger.error(f"JSON Decode Error: {str(e)} | Raw Response: {raw_text}")
            return {"error": "Invalid JSON format from OpenAI API.", "raw": raw_text}
    except Exception as e:
        logger.error(f"OpenAI Error: {str(e)}")
        logger.error(f"Full Traceback: {traceback.format_exc()}")  # Log full traceback
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

        logger.info(f"Extracted Resume Text: {resume_text}")  # Log extracted text

        # Extract user skills
        user_skills = extract_skills_from_resume(resume_text)
        logger.info(f"Extracted Skills: {user_skills}")  # Log extracted skills

        if not user_skills:
            raise HTTPException(status_code=400, detail="No skills found in the resume.")

        # Convert required skills input (string) into list
        job_skills = [skill.strip() for skill in required_skills.split(",")]

        # Identify skill gaps
        skill_gaps = identify_skill_gaps(user_skills, job_skills)
        logger.info(f"Skill Gaps: {skill_gaps}")  # Log skill gaps

        # Calculate readiness score
        readiness_score = calculate_readiness_score(user_skills, job_skills)

        # Get AI Recommendations
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
        logger.error(f"Full Traceback: {traceback.format_exc()}")  # Log full traceback
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "API is working!"}