import os
import json
from google import genai
from dotenv import load_dotenv
from ai_parser.prompts import PARSE_PROMPT

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def parse_need(report: str, location: str = "unknown") -> dict:
    prompt = PARSE_PROMPT.format(report=report, location=location)

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

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("{")
        end   = raw.rfind("}") + 1
        if start == -1 or end == 0:
            raise ValueError(f"Could not find JSON in Gemini response:\n{raw}")
        result = json.loads(raw[start:end])

    if result.get("confidence", 1.0) < 0.65 or result.get("urgency", 0) >= 9:
        result["needs_review"] = True
    else:
        result["needs_review"] = False

    return result