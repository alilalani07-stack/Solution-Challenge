import os
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone
from dotenv import load_dotenv
from ai_parser.priority_scorer import compute_priority_score

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


def write_need(parsed_need: dict, raw_report: str, location: str) -> str:
    db = get_db()
    now = datetime.now(timezone.utc).isoformat()

    doc = {
        "category":                 parsed_need.get("category"),
        "urgency":                  parsed_need.get("urgency"),
        "confidence":               parsed_need.get("confidence"),
        "quantity":                 parsed_need.get("quantity"),
        "required_skills":          parsed_need.get("required_skills", []),
        "location_hint":            parsed_need.get("location_hint"),
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
    }

    doc_ref = db.collection("needs").document()
    doc_ref.set(doc)
    print(f"  ✅ Need written to Firestore: {doc_ref.id}")
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


def get_open_needs(limit: int = 50) -> list:
    db = get_db()
    docs = (
        db.collection("needs")
        .where("status", "in", ["open", "pending_review"])
        .order_by("priority_score", direction=firestore.Query.DESCENDING)
        .limit(limit)
        .stream()
    )
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]


def write_volunteer(volunteer_data: dict) -> str:
    db = get_db()
    now = datetime.now(timezone.utc).isoformat()

    doc = {
        "name":         volunteer_data.get("name"),
        "skills":       volunteer_data.get("skills", []),
        "location":     volunteer_data.get("location"),
        "availability": volunteer_data.get("availability", True),
        "rating":       volunteer_data.get("rating", 3.0),
        "phone":        volunteer_data.get("phone"),
        "email":        volunteer_data.get("email"),
        "created_at":   now,
        "updated_at":   now,
        "total_tasks_completed": 0,
    }

    doc_ref = db.collection("volunteers").document()
    doc_ref.set(doc)
    print(f"  ✅ Volunteer written to Firestore: {doc_ref.id}")
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

def get_open_needs_simple(limit: int = 20) -> list:
    """
    Simpler query — no composite index needed.
    Sorts in Python instead of Firestore.
    """
    db = get_db()
    docs = (
        db.collection("needs")
        .where("status", "in", ["open", "pending_review"])
        .limit(limit)
        .stream()
    )
    results = [{"id": doc.id, **doc.to_dict()} for doc in docs]
    return sorted(results, key=lambda x: x.get("priority_score", 0), reverse=True)
