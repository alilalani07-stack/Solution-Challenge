from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import time
import os

from ai_parser.pipeline import process_submission
from ai_parser.firestore_writer import (
    get_open_needs_simple,
    get_available_volunteers,
    update_need_status,
    write_volunteer,
    get_db
)
from ai_parser.matcher import run_matching_cycle

app = FastAPI(title="CivicPulse API", version="1.0.0")

# CORS — restrict to your domains
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# ------------------------
# MODELS
# ------------------------

class NeedSubmission(BaseModel):
    report: str
    location: str


class VolunteerRegistration(BaseModel):
    name: str
    skills: list[str]
    location: str
    phone: str
    email: Optional[str] = None
    coords: Optional[dict] = None
    languages: Optional[list[str]] = None
    bio: Optional[str] = None
    experience_level: Optional[str] = None
    availability: Optional[str] = None
    onboarding_completed: Optional[bool] = False


class StatusUpdate(BaseModel):
    status: str
    volunteer_id: Optional[str] = None
    resolution_notes: Optional[str] = None


# ✅ NEW MODEL
class VerifyResolution(BaseModel):
    approved: bool
    notes: Optional[str] = None
    coordinator_id: Optional[str] = None


# ------------------------
# BASIC ROUTES
# ------------------------

@app.get("/")
def root():
    return {"status": "CivicPulse API is running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok", "timestamp": time.time()}


# ------------------------
# NEED SUBMISSION
# ------------------------

@app.post("/submit-need")
def submit_need(body: NeedSubmission):
    if not body.report.strip():
        raise HTTPException(status_code=400, detail="Report cannot be empty")
    if len(body.report) > 1000:
        raise HTTPException(status_code=400, detail="Report too long. Max 1000 characters.")

    try:
        result = process_submission(body.report.strip(), body.location.strip() or "unknown")

        tracking_id = None
        if result.get("need_id"):
            try:
                db = get_db()
                doc = db.collection("needs").document(result["need_id"]).get()
                if doc.exists:
                    tracking_id = doc.to_dict().get("tracking_id")
            except Exception:
                pass

        return {
            "success": True,
            "action": result["action"],
            "need_id": result["need_id"],
            "tracking_id": tracking_id or result.get("need_id"),
            "summary": result["parsed"].get("summary"),
            "category": result["parsed"].get("category"),
            "urgency": result["parsed"].get("urgency"),
            "needs_review": result["parsed"].get("needs_review"),
            "priority_score": result["priority_score"],
            "message": result["message"],
            "duplicate_of": result["duplicate_info"]["matched_id"] if result.get("duplicate_info") else None,
            "used_fallback": result["parsed"].get("_fallback", False),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------
# NEED FETCHING
# ------------------------

@app.get("/needs")
def get_needs(limit: int = 50):
    try:
        needs = get_open_needs_simple(limit=limit)
        return {"success": True, "count": len(needs), "needs": needs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/needs/all")
def get_all_needs(limit: int = 100):
    try:
        db = get_db()
        docs = db.collection("needs").limit(limit).stream()
        needs = [{"id": doc.id, **doc.to_dict()} for doc in docs]
        needs.sort(key=lambda x: x.get("priority_score", 0), reverse=True)
        return {"success": True, "count": len(needs), "needs": needs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/needs/track/{tracking_id}")
def track_need(tracking_id: str):
    try:
        db = get_db()
        docs = (
            db.collection("needs")
            .where("tracking_id", "==", tracking_id.upper())
            .limit(1)
            .stream()
        )
        results = [{"id": doc.id, **doc.to_dict()} for doc in docs]

        if not results:
            raise HTTPException(status_code=404, detail="Tracking ID not found")

        return {"success": True, "need": results[0]}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------
# STATUS MANAGEMENT
# ------------------------

@app.patch("/needs/{need_id}/status")
def update_status(need_id: str, body: StatusUpdate):
    valid = ["open", "matched", "resolved", "cancelled", "pending_review", "active", "rejected"]

    if body.status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid}")

    try:
        extra = {}
        if body.volunteer_id:
            extra["assigned_volunteer_id"] = body.volunteer_id
        if body.resolution_notes:
            extra["resolution_notes"] = body.resolution_notes

        update_need_status(need_id, body.status, extra)

        return {"success": True, "need_id": need_id, "new_status": body.status}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ NEW: VERIFY RESOLUTION ENDPOINT
@app.post("/needs/{need_id}/verify")
def verify_resolution(need_id: str, body: VerifyResolution):
    try:
        db = get_db()
        doc_ref = db.collection("needs").document(need_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="Need not found")

        data = doc.to_dict()

        if body.approved:
            updates = {
                "status": "resolved",
                "verified": True,
                "verified_at": datetime.now(timezone.utc).isoformat(),
                "verification_notes": body.notes or "",
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            if body.coordinator_id:
                updates["verified_by"] = body.coordinator_id
        else:
            updates = {
                "status": "active",
                "escalation_status": "reopened",
                "verified": False,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }

        doc_ref.update(updates)

        return {"success": True, "approved": body.approved}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------
# VOLUNTEERS
# ------------------------

@app.post("/register-volunteer")
def register_volunteer(body: VolunteerRegistration):
    try:
        vol_data = body.dict()
        vol_data["availability"] = True
        vol_data["rating"] = 3.0
        vol_id = write_volunteer(vol_data)
        return {"success": True, "volunteer_id": vol_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/volunteers/{volunteer_id}/profile")
def upsert_volunteer_profile(volunteer_id: str, body: VolunteerRegistration):
    try:
        vol_data = body.dict()
        vol_id = write_volunteer(vol_data, doc_id=volunteer_id)
        return {"success": True, "volunteer_id": vol_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/volunteers")
def get_volunteers():
    try:
        volunteers = get_available_volunteers()
        return {"success": True, "count": len(volunteers), "volunteers": volunteers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/volunteers/{volunteer_id}")
def get_volunteer(volunteer_id: str):
    try:
        db = get_db()
        doc = db.collection("volunteers").document(volunteer_id).get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="Volunteer not found")

        return {"success": True, "volunteer": {"id": doc.id, **doc.to_dict()}}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------
# MATCHING
# ------------------------

@app.post("/run-matching")
def trigger_matching():
    try:
        run_matching_cycle()
        return {"success": True, "message": "Matching cycle complete"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------
# DASHBOARD
# ------------------------

@app.get("/dashboard-summary")
def dashboard_summary():
    try:
        db = get_db()
        all_needs = [{"id": doc.id, **doc.to_dict()} for doc in db.collection("needs").stream()]
        volunteers = get_available_volunteers()

        open_needs = [n for n in all_needs if n.get("status") == "open"]
        review_needs = [n for n in all_needs if n.get("status") == "pending_review"]
        matched_needs = [n for n in all_needs if n.get("status") in ["matched", "active"]]
        resolved = [n for n in all_needs if n.get("status") == "resolved"]

        return {
            "success": True,
            "stats": {
                "total_open": len(open_needs),
                "pending_review": len(review_needs),
                "matched": len(matched_needs),
                "resolved": len(resolved),
                "available_volunteers": len(volunteers),
                "total_needs": len(all_needs),
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))