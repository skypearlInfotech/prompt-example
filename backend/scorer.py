def calculate_score(job, resume):

    score = 0
    strengths = []
    gaps = []

    # --- REQUIRED SKILLS (40)
    required = job["required_skills"]
    matched_required = [s for s in required if s.lower() in [x.lower() for x in resume["skills"]]]
    
    if required:
        required_score = (len(matched_required) / len(required)) * 40
    else:
        required_score = 40

    score += required_score

    if matched_required:
        strengths.append(f"Matched required skills: {matched_required}")

    missing_required = list(set(required) - set(matched_required))
    if missing_required:
        gaps.append(f"Missing required skills: {missing_required}")


    # --- PREFERRED SKILLS (15)
    preferred = job["preferred_skills"]
    matched_pref = [s for s in preferred if s.lower() in [x.lower() for x in resume["skills"]]]
    
    if preferred:
        pref_score = (len(matched_pref) / len(preferred)) * 15
        score += pref_score

    # --- EXPERIENCE (20)
    if resume["years_experience"] >= job["minimum_years_experience"]:
        score += 20
        strengths.append("Meets experience requirement")
    else:
        score += 10
        gaps.append("Below required experience")

    # --- EDUCATION (10)
    if job["education_requirement"].lower() in resume["education"].lower():
        score += 10
        strengths.append("Education matches requirement")
    else:
        gaps.append("Education mismatch")

    # --- LICENSE (10)
    if job["required_licenses"]:
        missing_license = any(
            lic not in resume["licenses"] for lic in job["required_licenses"]
        )

        if missing_license:
            gaps.append("Missing required license")
            score = min(score, 50)  # DISQUALIFICATION CAP
        else:
            score += 10
            strengths.append("Required license present")
    else:
        score += 10  # no license required

    # --- LOCATION (5)
    if job["location_requirement"]:
        if job["location_requirement"].lower() in resume["location"].lower():
            score += 5
        else:
            gaps.append("Location mismatch")

    return {
        "score": round(score, 2),
        "strengths": strengths,
        "gaps": gaps,
        "reasoning": "Score calculated using weighted deterministic scoring model."
    }