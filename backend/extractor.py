from openai import OpenAI
import json
from prompts import JOB_EXTRACTION_PROMPT, RESUME_EXTRACTION_PROMPT

client = OpenAI(api_key="API_KEY")

def extract_job_data(job_text):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {"role": "user", "content": JOB_EXTRACTION_PROMPT + job_text}
        ]
    )
    return json.loads(response.choices[0].message.content)


def extract_resume_data(resume_text):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {"role": "user", "content": RESUME_EXTRACTION_PROMPT + resume_text}
        ]
    )
    return json.loads(response.choices[0].message.content)