from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from extractor import extract_job_data, extract_resume_data
from scorer import calculate_score
from typing import List

app = FastAPI()

origins = [
    "http://localhost:9002",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    job_description: str
    resumes: List[str]

@app.post("/analyze")
def analyze(data: AnalyzeRequest):

    job_data = extract_job_data(data.job_description)
    resume_objects = []
    for resume_text in data.resumes:
        resume_data = extract_resume_data(resume_text)
        resume_objects.append(resume_data)

    result = calculate_score(job_data, resume_objects)

    print("FORMATTED RESUME DATA ===> ", resume_objects, result)

    return {
        "job_extracted": job_data,
        "resume_extracted": resume_objects,
        "analysis": result
    }