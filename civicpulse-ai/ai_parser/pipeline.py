import time
from ai_parser.gemini_parser import parse_need
from ai_parser.duplicate_checker import check_duplicate
from ai_parser.priority_scorer import compute_priority_score
from ai_parser.firestore_writer import write_need, get_open_needs_simple as get_open_needs
from datetime import datetime, timezone


def process_submission(raw_report: str, location: str) -> dict:
    """
    Full submission pipeline:
    1. Fetch existing needs from Firestore for duplicate check
    2. Parse with Gemini
    3. Check duplicate
    4. Write to Firestore if not duplicate
    5. Return result
    """

    # Step 1 — Get existing needs for duplicate check
    existing_needs = []
    try:
        open_needs = get_open_needs(limit=20)
        existing_needs = [
            {
                "id":       n["id"],
                "report":   n.get("raw_report", ""),
                "location": n.get("raw_location", "")
            }
            for n in open_needs
        ]
    except Exception as e:
        print(f"  ⚠️ Could not fetch existing needs for duplicate check: {e}")

    # Step 2 — Parse
    parsed = parse_need(raw_report, location)

    # Step 3 — Duplicate check
    duplicate_result = {"is_duplicate": False}
    if existing_needs:
        duplicate_result = check_duplicate(raw_report, location, existing_needs)

    if duplicate_result["is_duplicate"]:
        return {
            "action":         "duplicate",
            "parsed":         parsed,
            "duplicate_info": duplicate_result,
            "need_id":        None,
            "priority_score": None,
            "message":        f"Duplicate of need {duplicate_result['matched_id']}"
        }

    # Step 4 — Write to Firestore
    need_id = write_need(parsed, raw_report, location)

    action = "review" if parsed.get("needs_review") else "create"

    return {
        "action":         action,
        "parsed":         parsed,
        "duplicate_info": None,
        "need_id":        need_id,
        "priority_score": parsed.get("priority_score"),
        "message":        "Flagged for coordinator review" if action == "review" else "Need created and ready to match"
    }


if __name__ == "__main__":
    import json

    test_submissions = [
        {
            "report":   "We need 2 nurses urgently near Banjara Hills. Elderly patient, no insulin.",
            "location": "Banjara Hills, Hyderabad"
        },
        {
            "report":   "Family of 5 displaced after fire in Mehdipatnam, need shelter tonight",
            "location": "Mehdipatnam, Hyderabad"
        },
        {
            "report":   "Nurse needed urgently Banjara Hills insulin patient elderly",
            "location": "Banjara Hills, Hyderabad"
        },
    ]

    for i, sub in enumerate(test_submissions):
        print(f"\n--- Submission {i+1} ---")
        print(f"Report: {sub['report']}")
        result = process_submission(sub["report"], sub["location"])
        print(f"Action:   {result['action']}")
        print(f"Need ID:  {result['need_id']}")
        print(f"Message:  {result['message']}")
        if i < len(test_submissions) - 1:
            time.sleep(5)