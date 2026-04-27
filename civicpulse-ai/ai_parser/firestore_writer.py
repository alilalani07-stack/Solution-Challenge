import os
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone
from dotenv import load_dotenv
from ai_parser.priority_scorer import compute_priority_score
import uuid

load_dotenv()

_db = None

def get_db():
    global _db
    if _db is None:
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "serviceAccount.json")
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        _db = firestore.client()
    return _db


def generate_tracking_id():
    """Generate a short human-readable tracking ID"""
    return 'CP-' + uuid.uuid4().hex[:8].upper()


def geocode_location(location_hint: str) -> dict:
    """
    Convert location hint string to lat/lng using Nominatim.
    Returns coords dict or None if failed.
    """
    if not location_hint or location_hint == 'unknown':
        return None
    try:
        import urllib.request
        import json
        query = location_hint.replace(' ', '+')
        url = f"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'CivicPulse/1.0'})
        with urllib.request.urlopen(req, timeout=3) as response:
            data = json.loads(response.read())
            if data:
                return {
                    'lat': float(data[0]['lat']),
                    'lng': float(data[0]['lon'])
                }
    except Exception as e:
        print(f"  ⚠️ Geocoding failed for '{location_hint}': {e}")
    return None


def write_need(parsed_need: dict, raw_report: str, location: str) -> str:
    db = get_db()
    now = datetime.now(timezone.utc).isoformat()
    tracking_id = generate_tracking_id()

    # Geocode location
    coords = parsed_need.get('location_coords') or geocode_location(
        parsed_need.get('location_hint') or location
    )

    doc = {
        "tracking_id":              tracking_id,
        "category":                 parsed_need.get("category"),
        "urgency":                  parsed_need.get("urgency"),
        "confidence":               parsed_need.get("confidence"),
        "quantity":                 parsed_need.get("quantity"),
        "required_skills":          parsed_need.get("required_skills", []),
        "location_hint":            parsed_need.get("location_hint"),
        "location_coords":          coords,
        "summary":                  parsed_need.get("summary"),
        "language_detected":        parsed_need.get("language_detected"),
        "estimated_duration_hours": parsed_need.get("estimated_duration_hours"),
        "needs_review":             parsed_need.get("needs_review", False),
        "raw_report":               raw_report,
        "raw_location":             location,
        "status":                   "pending_review" if parsed_need.get("needs_review") else "open",
        "submitted_at":             now,
        "updated_at":               now,
        "assigned_volunteer_id":    None,
        "match_tier":               1,
        "escalation_status":        "waiting",
        "priority_score":           compute_priority_score({
                                        **parsed_need,
                                        "submitted_at": now,
                                        "status": "open"
                                    }),
        "resolved_at":              None,
        "resolution_notes":         None,
        "volunteers_helped":        None,
        "verified":                 False,
    }

    doc_ref = db.collection("needs").document()
    doc_ref.set(doc)
    print(f"  ✅ Need written: {doc_ref.id} | tracking: {tracking_id}")
    return doc_ref.id


def update_need_status(need_id: str, status: str, extra_fields: dict = None):
    db = get_db()
    update = {
        "status":     status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    if extra_fields:
        update.update(extra_fields)
    db.collection("needs").document(need_id).update(update)


def get_open_needs_simple(limit: int = 50) -> list:
    db = get_db()
    docs = (
        db.collection("needs")
        .where("status", "in", ["open", "pending_review"])
        .limit(limit)
        .stream()
    )
    results = [{"id": doc.id, **doc.to_dict()} for doc in docs]
    return sorted(results, key=lambda x: x.get("priority_score", 0), reverse=True)


def get_open_needs(limit: int = 50) -> list:
    return get_open_needs_simple(limit)


def write_volunteer(volunteer_data: dict, doc_id: str = None) -> str:
    db = get_db()
    now = datetime.now(timezone.utc).isoformat()

    # Geocode volunteer location if no coords
    coords = volunteer_data.get('coords')
    if not coords and volunteer_data.get('location'):
        coords = geocode_location(volunteer_data['location'])

    doc = {
        "name":                  volunteer_data.get("name"),
        "skills":                volunteer_data.get("skills", []),
        "location":              volunteer_data.get("location"),
        "coords":                coords,
        "availability":          volunteer_data.get("availability", True),
        "rating":                volunteer_data.get("rating", 3.0),
        "phone":                 volunteer_data.get("phone"),
        "email":                 volunteer_data.get("email"),
        "languages":             volunteer_data.get("languages", ["English"]),
        "bio":                   volunteer_data.get("bio", ""),
        "experience_level":      volunteer_data.get("experience_level", "Beginner"),
        "onboarding_completed":  volunteer_data.get("onboarding_completed", False),
        "created_at":            now,
        "updated_at":            now,
        "total_tasks_completed": 0,
    }

    if doc_id:
        db.collection("volunteers").document(doc_id).set(doc, merge=True)
        print(f"  ✅ Volunteer upserted: {doc_id}")
        return doc_id
    else:
        doc_ref = db.collection("volunteers").document()
        doc_ref.set(doc)
        print(f"  ✅ Volunteer written: {doc_ref.id}")
        return doc_ref.id


def get_available_volunteers() -> list:
    db = get_db()
    docs = (
        db.collection("volunteers")
        .where("availability", "==", True)
        .stream()
    )
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]


def write_match(need_id: str, volunteer_id: str, score: float, tier: int = 1) -> str:
    db = get_db()
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "need_id":      need_id,
        "volunteer_id": volunteer_id,
        "match_score":  score,
        "tier":         tier,
        "status":       "pending",
        "created_at":   now,
        "updated_at":   now,
        "accepted_at":  None,
        "resolved_at":  None,
    }
    doc_ref = db.collection("matches").document()
    doc_ref.set(doc)
    return doc_ref.id