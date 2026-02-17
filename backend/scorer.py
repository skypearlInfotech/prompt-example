def calculate_score(job, resumes):

    resume_scores_result = []

    for resume in resumes:

        score = 0
        strengths = []
        gaps = []

        # Normalize helpers
        def normalize_list(lst):
            return [x.strip().lower() for x in lst if isinstance(x, str)]

        job_required = normalize_list(job.get("required_skills", []))
        job_preferred = normalize_list(job.get("preferred_skills", []))
        job_licenses = normalize_list(job.get("required_licenses", []))

        resume_skills = normalize_list(resume.get("skills", []))
        resume_licenses = normalize_list(resume.get("licenses", []))

        # -----------------------------
        # REQUIRED SKILLS (40)
        # -----------------------------
        if job_required:
            matched_required = [s for s in job_required if s in resume_skills]
            required_score = (len(matched_required) / len(job_required)) * 40
            score += required_score

            if matched_required:
                strengths.append(f"Matched required skills: {matched_required}")

            missing_required = list(set(job_required) - set(matched_required))
            if missing_required:
                gaps.append(f"Missing required skills: {missing_required}")
        else:
            score += 40

        # -----------------------------
        # PREFERRED SKILLS (15)
        # -----------------------------
        if job_preferred:
            matched_pref = [s for s in job_preferred if s in resume_skills]
            pref_score = (len(matched_pref) / len(job_preferred)) * 15
            score += pref_score

            if matched_pref:
                strengths.append(f"Matched preferred skills: {matched_pref}")

        # -----------------------------
        # EXPERIENCE (20)
        # -----------------------------
        resume_exp = resume.get("total_years_experience", 0)
        job_exp = job.get("minimum_years_experience", 0)

        if job_exp > 0:
            exp_ratio = min(resume_exp / job_exp, 1)
            exp_score = exp_ratio * 20
            score += exp_score

            if resume_exp >= job_exp:
                strengths.append("Meets or exceeds experience requirement")
            else:
                gaps.append("Below required experience")
        else:
            score += 20

        # -----------------------------
        # EDUCATION (10)
        # -----------------------------
        resume_rank = resume.get("highest_education_rank", 0)

        def education_to_rank(edu_str):
            edu_str = edu_str.lower()
            if "phd" in edu_str:
                return 5
            if "master" in edu_str:
                return 4
            if "bachelor" in edu_str:
                return 3
            if "associate" in edu_str:
                return 2
            if "high school" in edu_str:
                return 1
            return 0

        job_rank = education_to_rank(job.get("education_requirement", ""))

        if job_rank == 0:
            score += 10
        else:
            if resume_rank >= job_rank:
                score += 10
                strengths.append("Education meets requirement")
            else:
                gaps.append("Education below requirement")

        # -----------------------------
        # LICENSE (10) - HARD FILTER
        # -----------------------------
        if job_licenses:
            missing_license = [lic for lic in job_licenses if lic not in resume_licenses]

            if missing_license:
                gaps.append(f"Missing required licenses: {missing_license}")
                score = min(score, 50)  # Disqualification cap
            else:
                score += 10
                strengths.append("All required licenses present")
        else:
            score += 10

        # -----------------------------
        # LOCATION (5)
        # -----------------------------
        job_location = job.get("location_requirement", "").lower()
        resume_location = resume.get("location", "").lower()

        if job_location:
            if job_location == "remote":
                score += 5
                strengths.append("Location eligible (Remote)")
            elif job_location in resume_location:
                score += 5
                strengths.append("Location matches requirement")
            else:
                gaps.append("Location mismatch")
        else:
            score += 5

        # -----------------------------
        # INDUSTRY BONUS (Optional +5)
        # -----------------------------
        job_industry = job.get("industry", "").lower()
        resume_industries = normalize_list(resume.get("industries_worked_in", []))

        if job_industry and job_industry in resume_industries:
            score += 5
            strengths.append("Industry experience match")

        # Cap score at 100
        score = min(score, 100)

        resume_scores_result.append({
            "candidate": resume.get("candidate_name", ""),
            "score": round(score, 2),
            "strengths": strengths,
            "gaps": gaps,
            "reasoning": "Score calculated using weighted deterministic scoring model with proportional experience, normalized skills, strict license validation, and education rank comparison.",
        })

    return resume_scores_result