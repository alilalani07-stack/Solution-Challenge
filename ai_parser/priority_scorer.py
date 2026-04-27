from datetime import datetime, timezone, timedelta


def compute_priority_score(need: dict) -> float:
    CATEGORY_WEIGHTS = {
        "rescue":  1.4,
        "medical": 1.3,
        "safety":  1.2,
        "shelter": 1.1,
        "food":    1.0,
        "other":   0.8
    }

    urgency          = need.get("urgency", 5)
    category         = need.get("category", "other")
    submitted_at_str = need.get("submitted_at")
    status           = need.get("status", "open")

    if status == "resolved":
        return 0.0

    staleness_boost = 1.0
    minutes_old     = 0

    if submitted_at_str:
        submitted_at = datetime.fromisoformat(submitted_at_str).replace(tzinfo=timezone.utc)
        now          = datetime.now(timezone.utc)
        minutes_old  = (now - submitted_at).total_seconds() / 60

        if minutes_old > 120:
            staleness_boost = 1.6
        elif minutes_old > 60:
            staleness_boost = 1.3
        elif minutes_old > 30:
            staleness_boost = 1.1

    category_weight = CATEGORY_WEIGHTS.get(category, 1.0)
    score = urgency * category_weight * staleness_boost
    return round(score, 3)


def rank_needs(needs: list) -> list:
    for need in needs:
        need["priority_score"] = compute_priority_score(need)
    return sorted(needs, key=lambda x: x["priority_score"], reverse=True)


if __name__ == "__main__":
    now = datetime.now(timezone.utc)
    test_needs = [
        {"id": "n1", "category": "food",    "urgency": 5, "submitted_at": (now - timedelta(minutes=10)).isoformat(), "status": "open"},
        {"id": "n2", "category": "medical", "urgency": 8, "submitted_at": (now - timedelta(minutes=2)).isoformat(),  "status": "open"},
        {"id": "n3", "category": "rescue",  "urgency": 9, "submitted_at": (now - timedelta(minutes=90)).isoformat(), "status": "open"},
        {"id": "n4", "category": "shelter", "urgency": 6, "submitted_at": (now - timedelta(minutes=5)).isoformat(),  "status": "resolved"},
    ]
    ranked = rank_needs(test_needs)
    print("\nRANKED NEEDS (highest priority first):")
    print("-" * 40)
    for n in ranked:
        print(f"[{n['id']}] {n['category'].upper()} | urgency={n['urgency']} | score={n['priority_score']}")
