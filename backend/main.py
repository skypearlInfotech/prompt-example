from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from extractor import extract_job_data, extract_resume_data
from scorer import calculate_score
from typing import List

app = FastAPI()

# ✅ Add this
origins = [
    "http://localhost:9002",  # React default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # OR ["*"] for development only
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
    # resume_data = extract_resume_data(data.resumes)
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
    # return {
    #     "job_extracted": {
    #         "required_skills": [
    #             "SQL",
    #             "Python",
    #             "Tableau",
    #             "financial data modeling"
    #         ],
    #         "preferred_skills": [
    #             "Power BI",
    #             "Snowflake"
    #         ],
    #         "required_licenses": [],
    #         "education_requirement": "Bachelor's Degree in Statistics",
    #         "minimum_years_experience": 4,
    #         "location_requirement": "Hybrid - New York",
    #         "employment_type": "Full-Time",
    #         "industry": "Finance"
    #     },
    #     "resume_extracted": {
    #         "candidate_name": "Emily Johnson",
    #         "skills": [
    #             "SQL",
    #             "Python",
    #             "Tableau",
    #             "Power BI",
    #             "Data Modeling",
    #             "Excel"
    #         ],
    #         "licenses": [],
    #         "education": [
    #             "Bachelor's Degree in Statistics"
    #         ],
    #         "highest_education_level": "Bachelor's Degree",
    #         "highest_education_rank": 3,
    #         "total_years_experience": 5,
    #         "location": "New York, NY",
    #         "employment_type_preference": "",
    #         "industries_worked_in": [
    #             "Finance"
    #         ]
    #     },
    #     "analysis": {
    #         "score": 82.5,
    #         "strengths": [
    #             "Matched required skills: ['sql', 'python', 'tableau']",
    #             "Matched preferred skills: ['power bi']",
    #             "Meets or exceeds experience requirement",
    #             "Education meets requirement",
    #             "Industry experience match"
    #         ],
    #         "gaps": [
    #             "Missing required skills: ['financial data modeling']",
    #             "Location mismatch"
    #         ],
    #         "reasoning": "Score calculated using weighted deterministic scoring model with proportional experience, normalized skills, strict license validation, and education rank comparison."
    #     }
    # }