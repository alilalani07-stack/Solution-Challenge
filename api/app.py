from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import time

from ai_parser.pipeline import process_submission
from ai_parser.firestore_writer import (
    get_open_needs_simple,
    get_available_volunteers,
    update_need_status,
    write_volunteer
)
from ai_parser.matcher import run_matching_cycle

app = FastAPI(title="CivicPulse API", version="1.0.0")

# Allow C's frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── REQUEST MODELS ────────────────────────────────────────────

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

class StatusUpdate(BaseModel):
    status: str
    volunteer_id: Optional[str] = None
    resolution_notes: Optional[str] = None


# ── HEALTH CHECK ──────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "CivicPulse API is running"}


# ── NEEDS ─────────────────────────────────────────────────────

@app.post("/submit-need")
def submit_need(body: NeedSubmission):
    """
    Main endpoint. C's citizen form calls this.
    Parses with Gemini, checks duplicates, writes to Firestore.
    """
    if not body.report.strip():
        raise HTTPException(status_code=400, detail="Report cannot be empty")

    try:
        result = process_submission(body.report, body.location)
        return {
            "success": True,
            "action":         result["action"],
            "need_id":        result["need_id"],
            "summary":        result["parsed"].get("summary"),
            "category":       result["parsed"].get("category"),
            "urgency":        result["parsed"].get("urgency"),
            "needs_review":   result["parsed"].get("needs_review"),
            "priority_score": result["priority_score"],
            "message":        result["message"],
            "duplicate_of":   result["duplicate_info"]["matched_id"] if result["duplicate_info"] else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/needs")
def get_needs(limit: int = 50):
    """
    Returns open needs sorted by priority score.
    C's coordinator dashboard calls this for the priority feed.
    """
    try:
        needs = get_open_needs_simple(limit=limit)
        return {"success": True, "count": len(needs), "needs": needs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/needs/{need_id}/status")
def update_status(need_id: str, body: StatusUpdate):
    """
    Update a need's status. Used by coordinator dashboard.
    Valid statuses: open, matched, resolved, cancelled
    """
    valid = ["open", "matched", "resolved", "cancelled", "pending_review"]
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


# ── VOLUNTEERS ────────────────────────────────────────────────

@app.post("/register-volunteer")
def register_volunteer(body: VolunteerRegistration):
    """
    C's volunteer registration form calls this.
    """
    try:
        vol_data = body.dict()
        vol_data["availability"] = True
        vol_data["rating"] = 3.0
        vol_id = write_volunteer(vol_data)
        return {"success": True, "volunteer_id": vol_id, "message": "Volunteer registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/volunteers")
def get_volunteers():
    """
    Returns available volunteers.
    """
    try:
        volunteers = get_available_volunteers()
        return {"success": True, "count": len(volunteers), "volunteers": volunteers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── MATCHING ──────────────────────────────────────────────────

@app.post("/run-matching")
def trigger_matching():
    """
    Manually trigger a matching cycle.
    Coordinator dashboard has a 'Run Matching' button that calls this.
    """
    try:
        run_matching_cycle()
        return {"success": True, "message": "Matching cycle complete"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── DASHBOARD SUMMARY ─────────────────────────────────────────

@app.get("/dashboard-summary")
def dashboard_summary():
    """
    Single endpoint for dashboard stats.
    C calls this once on load to populate counters.
    """
    try:
        needs      = get_open_needs_simple(limit=100)
        volunteers = get_available_volunteers()

        open_needs     = [n for n in needs if n.get("status") == "open"]
        review_needs   = [n for n in needs if n.get("status") == "pending_review"]
        matched_needs  = [n for n in needs if n.get("status") == "matched"]

        critical = [n for n in needs if n.get("urgency", 0) >= 9]

        return {
            "success": True,
            "stats": {
                "total_open":         len(open_needs),
                "pending_review":     len(review_needs),
                "matched":            len(matched_needs),
                "critical_needs":     len(critical),
                "available_volunteers": len(volunteers),
            },
            "top_needs": needs[:5],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))