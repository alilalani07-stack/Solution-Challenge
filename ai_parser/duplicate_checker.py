import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SIMILARITY_PROMPT = """
You are comparing two community distress reports to check if they describe the same incident.

Report A: {report_a}
Location A: {location_a}

Report B: {report_b}
Location B: {location_b}

Return ONLY a JSON object with this exact structure:
{{
  "is_duplicate": true or false,
  "similarity_score": 0.0 to 1.0,
  "reason": "<one sentence explaining your decision>"
}}

Consider them duplicates if they describe the same type of need, in the same area,
submitted within a short time window. Minor wording differences don't matter.
"""

def check_duplicate(new_report: str, new_location: str, existing_needs: list) -> dict:
    """
    Checks if new_report is a duplicate of any need in existing_needs.
    existing_needs: list of dicts with keys 'report', 'location', 'id'
    Returns: dict with 'is_duplicate', 'matched_id', 'similarity_score'
    """
    for existing in existing_needs:
        prompt = SIMILARITY_PROMPT.format(
            report_a=new_report,
            location_a=new_location,
            report_b=existing["report"],
            location_b=existing["location"]
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )

        raw = response.text.strip()
        if "```" in raw:
            parts = raw.split("```")
            raw = parts[1].strip()
            if raw.startswith("json"):
                raw = raw[4:].strip()

        import json
        result = json.loads(raw)

        if result.get("similarity_score", 0) >= 0.80:
            return {
                "is_duplicate": True,
                "matched_id": existing["id"],
                "similarity_score": result["similarity_score"],
                "reason": result["reason"]
            }

    return {
        "is_duplicate": False,
        "matched_id": None,
        "similarity_score": 0.0,
        "reason": "No duplicate found"
    }