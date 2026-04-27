import os
import json
from google import genai
from dotenv import load_dotenv
from ai_parser.prompts import PARSE_PROMPT

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Fallback category detection when Gemini quota is exhausted
def _fallback_parse(report: str, location: str) -> dict:
    """Rule-based fallback when Gemini is unavailable."""
    lower = report.lower()
    category = 'other'
    urgency = 5
    confidence = 0.4

    if any(w in lower for w in ['nurse', 'doctor', 'medical', 'hospital', 'insulin', 'breathing', 'pregnant', 'injured']):
        category = 'medical'; urgency = 8
    elif any(w in lower for w in ['food', 'hungry', 'water', 'meal', 'eat']):
        category = 'food'; urgency = 6
    elif any(w in lower for w in ['shelter', 'house', 'roof', 'homeless', 'displaced', 'fire']):
        category = 'shelter'; urgency = 7
    elif any(w in lower for w in ['flood', 'rescue', 'trapped', 'stuck', 'drowning', 'save']):
        category = 'rescue'; urgency = 9
    elif any(w in lower for w in ['safe', 'danger', 'threat', 'violence', 'unsafe']):
        category = 'safety'; urgency = 8

    if any(w in lower for w in ['urgent', 'emergency', 'critical', 'immediately', 'asap']):
        urgency = min(10, urgency + 2)
    if any(w in lower for w in ['elderly', 'child', 'baby', 'pregnant', 'disabled']):
        urgency = min(10, urgency + 1)

    num_match = __import__('re').search(r'(\d+)\s*(people|person|nurses|doctors|families|children)', lower)
    quantity = int(num_match.group(1)) if num_match else 1

    skills_map = {
        'medical': ['first aid', 'medical assistance'],
        'food': ['food distribution'],
        'shelter': ['shelter management'],
        'rescue': ['emergency response', 'flood rescue'],
        'safety': ['emergency response'],
        'other': []
    }

    return {
        "category":               category,
        "urgency":                urgency,
        "confidence":             confidence,
        "quantity":               quantity,
        "required_skills":        skills_map.get(category, []),
        "location_hint":          location,
        "summary":                report[:120],
        "language_detected":      "unknown",
        "estimated_duration_hours": None,
        "needs_review":           True,  # Always flag fallback for review
        "_fallback":              True,
    }


def parse_need(report: str, location: str = "unknown") -> dict:
    """
    Parse a community need report using Gemini.
    Falls back to rule-based parsing if Gemini quota is exhausted.
    """
    # Sanitize input — prevent prompt injection
    # Truncate to 500 chars and strip control characters
    safe_report = report[:500].replace('\n', ' ').replace('\r', ' ').strip()
    safe_location = location[:200].replace('\n', ' ').strip()

    prompt = PARSE_PROMPT.format(report=safe_report, location=safe_location)

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        raw = response.text.strip()

        if "```" in raw:
            parts = raw.split("```")
            raw = parts[1].strip()
            if raw.startswith("json"):
                raw = raw[4:].strip()

        try:
            result = json.loads(raw)
        except json.JSONDecodeError:
            start = raw.find("{")
            end   = raw.rfind("}") + 1
            if start == -1 or end == 0:
                print(f"  ⚠️ Gemini returned non-JSON, using fallback")
                return _fallback_parse(report, location)
            result = json.loads(raw[start:end])

        if result.get("confidence", 1.0) < 0.65 or result.get("urgency", 0) >= 9:
            result["needs_review"] = True
        else:
            result["needs_review"] = False

        return result

    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
            print(f"  ⚠️ Gemini quota exhausted — using rule-based fallback")
            return _fallback_parse(report, location)
        elif "503" in error_str or "UNAVAILABLE" in error_str:
            print(f"  ⚠️ Gemini unavailable — using rule-based fallback")
            return _fallback_parse(report, location)
        else:
            raise RuntimeError(f"Gemini API error: {e}")