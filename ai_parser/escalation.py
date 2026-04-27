from datetime import datetime, timezone

def compute_escalation_tier(match: dict) -> dict:
    """
    Given a match record, determines what escalation tier it's in.
    
    Tiers:
      1 — Assigned, waiting for volunteer acceptance (0-10 min)
      2 — Volunteer 1 didn't respond, reassign to next match
      3 — All volunteers exhausted, flag to coordinator
    
    match dict expects:
      - assigned_at: ISO timestamp string
      - tier: int (current tier)
      - volunteer_responses: list of dicts {volunteer_id, status, responded_at}
    """
    now = datetime.now(timezone.utc)
    assigned_at = datetime.fromisoformat(match["assigned_at"])
    elapsed_minutes = (now - assigned_at).seconds / 60
    tier = match.get("tier", 1)

    if tier == 1 and elapsed_minutes >= 10:
        return {
            "action": "escalate",
            "new_tier": 2,
            "reason": "Volunteer 1 did not respond within 10 minutes",
            "notify_coordinator": False
        }
    elif tier == 2 and elapsed_minutes >= 20:
        return {
            "action": "escalate",
            "new_tier": 3,
            "reason": "No volunteer accepted after 20 minutes",
            "notify_coordinator": True,
            "alert_message": "CRITICAL: Need unmet after 2 volunteer attempts. Manual intervention required."
        }
    elif tier == 3:
        return {
            "action": "manual_required",
            "new_tier": 3,
            "reason": "All automated tiers exhausted",
            "notify_coordinator": True,
            "alert_message": "ESCALATED TO NGO PARTNER: Immediate human coordination needed."
        }
    else:
        return {
            "action": "wait",
            "new_tier": tier,
            "reason": f"Within acceptable window ({elapsed_minutes:.1f} min elapsed)"
        }


def get_escalation_status_label(tier: int) -> str:
    labels = {
        1: "Awaiting volunteer response",
        2: "Reassigning to next volunteer",
        3: "CRITICAL — Coordinator alerted"
    }
    return labels.get(tier, "Unknown")