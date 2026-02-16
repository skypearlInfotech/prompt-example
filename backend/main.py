from fastapi import FastAPI
from pydantic import BaseModel
from extractor import extract_job_data, extract_resume_data
from scorer import calculate_score

app = FastAPI()

class AnalyzeRequest(BaseModel):
    job_description: str
    resume: str

@app.post("/analyze")
def analyze(data: AnalyzeRequest):

    job_data = extract_job_data(data.job_description)
    resume_data = extract_resume_data(data.resume)

    result = calculate_score(job_data, resume_data)

    return {
        "job_extracted": job_data,
        "resume_extracted": resume_data,
        "analysis": result
    }