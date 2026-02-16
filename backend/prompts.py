JOB_EXTRACTION_PROMPT = """
You are an expert HR data extraction system.

Extract structured data from job descriptions.

Return ONLY valid JSON in this format:

{
  "required_skills": [],
  "preferred_skills": [],
  "required_licenses": [],
  "education_requirement": "",
  "minimum_years_experience": 0,
  "location_requirement": ""
}

---

Example 1 (License Job):

JOB:
We are hiring a Security Guard in Texas.
Must have active Texas Security License.
Minimum 2 years experience.
High School diploma required.
Preferred: CPR Certification, surveillance experience.

OUTPUT:
{
  "required_skills": ["security monitoring"],
  "preferred_skills": ["CPR Certification", "surveillance"],
  "required_licenses": ["Texas Security License"],
  "education_requirement": "High School diploma",
  "minimum_years_experience": 2,
  "location_requirement": "Texas"
}

---

Example 2 (Non-License Job):

JOB:
Seeking Software Engineer.
Must know Python, FastAPI, SQL.
3+ years experience required.
Bachelor's in Computer Science required.
Preferred: AWS, Docker.

OUTPUT:
{
  "required_skills": ["Python", "FastAPI", "SQL"],
  "preferred_skills": ["AWS", "Docker"],
  "required_licenses": [],
  "education_requirement": "Bachelor's in Computer Science",
  "minimum_years_experience": 3,
  "location_requirement": ""
}

---

Now extract from the following JOB DESCRIPTION:
"""


RESUME_EXTRACTION_PROMPT = """
You are an expert resume parser.

Extract structured JSON:

{
  "candidate_name": "",
  "skills": [],
  "licenses": [],
  "education": "",
  "years_experience": 0,
  "location": ""
}

Return JSON only.
"""