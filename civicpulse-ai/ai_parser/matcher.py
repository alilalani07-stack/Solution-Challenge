import math
from ai_parser.firestore_writer import (
    get_open_needs,
    get_available_volunteers,
    write_match,
    update_need_status,
    get_db
)
from datetime import datetime, timezone


def haversine_distance(loc1: dict, loc2: dict) -> float:
    """
    Calculates distance in km between two lat/lng points.
    loc format: {"lat": float, "lng": float}
    Returns float km, or 999 if coords missing.
    """
    if not loc1 or not loc2:
        return 999
    try:
        R = 6371
        lat1, lon1 = math.radians(loc1["lat"]), math.radians(loc1["lng"])
        lat2, lon2 = math.radians(loc2["lat"]), math.radians(loc2["lng"])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        return R * 2 * math.asin(math.sqrt(a))
    except Exception:
        return 999


def skill_match_score(required: list, volunteer_skills: list) -> float:
    if not required:
        return 1.0
    if not volunteer_skills:
        return 0.0
    matched = sum(1 for s in required if s.lower() in [v.lower() for v in volunteer_skills])
    return matched / len(required)


def compute_match_score(need: dict, volunteer: dict) -> float:
    skill   = skill_match_score(need.get("required_skills", []), volunteer.get("skills", []))
    rating  = (volunteer.get("rating", 3.0)) / 5.0
    urgency = need.get("urgency", 5) / 10.0

    need_loc = need.get("coords")
    vol_loc  = volunteer.get("coords")
    dist_km  = haversine_distance(need_loc, vol_loc)

    if dist_km < 2:
        dist_score = 1.0
    elif dist_km < 5:
        dist_score = 0.8
    elif dist_km < 10:
        dist_score = 0.6
    elif dist_km < 20:
        dist_score = 0.4
    else:
        dist_score = 0.1

    score = (skill * 0.40) + (dist_score * 0.30) + (urgency * 0.20) + (rating * 0.10)
    return round(score, 4)


def match_need(need: dict, volunteers: list) -> list:
    """
    Returns top 3 volunteers for a need, sorted by match score.
    """
    scores = []
    for v in volunteers:
        score = compute_match_score(need, v)
        scores.append({"volunteer": v, "score": score})

    scores.sort(key=lambda x: x["score"], reverse=True)
    return scores[:3]


def run_matching_cycle():
    """
    Full matching cycle:
    1. Get all open needs
    2. Get all available volunteers
    3. Match and write to Firestore
    """
    print("\n" + "="*50)
    print(f"MATCHING CYCLE — {datetime.now(timezone.utc).isoformat()}")
    print("="*50)

    needs      = get_open_needs()
    volunteers = get_available_volunteers()

    print(f"Open needs: {len(needs)}")
    print(f"Available volunteers: {len(volunteers)}")

    if not needs:
        print("No open needs. Exiting.")
        return

    if not volunteers:
        print("No available volunteers. All needs escalated to coordinator.")
        return

    for need in needs:
        need_id = need["id"]
        print(f"\nMatching need: {need_id} [{need.get('category')} | urgency {need.get('urgency')}]")

        top_matches = match_need(need, volunteers)

        for i, m in enumerate(top_matches):
            vol  = m["volunteer"]
            score = m["score"]
            tier  = i + 1
            match_id = write_match(need_id, vol["id"], score, tier)
            print(f"  Tier {tier}: {vol.get('name')} (score={score}) → match {match_id}")

        update_need_status(need_id, "matched", {
            "assigned_volunteer_id": None,
            "match_candidates": [m["volunteer"]["id"] for m in top_matches]
        })

    print("\nMatching cycle complete.")


if __name__ == "__main__":
    run_matching_cycle()