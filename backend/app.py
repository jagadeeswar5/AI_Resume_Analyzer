import os
import fitz  # PyMuPDF for PDF text extraction
import spacy
import openai
import pymongo
from flask import Flask, request, jsonify
from dotenv import load_dotenv

# Load API keys
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

# Initialize Flask app
app = Flask(__name__)

# Connect to MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["resume_db"]
collection = db["resumes"]

# Load NLP model
nlp = spacy.load("en_core_web_sm")

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text("text")
    return text

# Extract skills from text using NLP
def extract_skills(text):
    doc = nlp(text)
    skills = set()
    tech_keywords = ["Python", "Java", "C++", "SQL", "TensorFlow", "AWS", "Flask", "React", "Node.js"]
    for token in doc:
        if token.text in tech_keywords:
            skills.add(token.text)
    return list(skills)

# Generate AI-powered resume insights using ChatGPT API
def analyze_resume_with_gpt(resume_text):
    prompt = f"Analyze this resume:\n{resume_text}\nProvide a summary, key strengths, and weaknesses."
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return response["choices"][0]["message"]["content"]

# API Endpoint to Upload and Analyze Resume
@app.route("/upload", methods=["POST"])
def upload_resume():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    file_path = f"uploads/{file.filename}"
    file.save(file_path)

    # Extract text & analyze resume
    resume_text = extract_text_from_pdf(file_path)
    skills = extract_skills(resume_text)
    ai_analysis = analyze_resume_with_gpt(resume_text)

    # Store results in MongoDB
    result = {"filename": file.filename, "skills": skills, "ai_analysis": ai_analysis}
    collection.insert_one(result)

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
