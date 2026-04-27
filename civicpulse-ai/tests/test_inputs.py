TEST_CASES = [
    {
        "id": "en_medical",
        "report": "We need 2 nurses urgently near Banjara Hills. Elderly patient, no insulin.",
        "location": "Banjara Hills, Hyderabad",
        "expect_category": "medical",
        "expect_urgency_min": 7,
    },
    {
        "id": "te_food",
        "report": "మాకు తిండి అవసరం, 10 మంది పిల్లలు ఉన్నారు, Dilsukhnagar దగ్గర",
        "location": "Dilsukhnagar, Hyderabad",
        "expect_category": "food",
        "expect_urgency_min": 5,
    },
    {
        "id": "hi_rescue",
        "report": "बाढ़ आ गई है, हमें बचाओ, Hussain Sagar के पास फंसे हैं, 6 लोग",
        "location": "Hussain Sagar, Hyderabad",
        "expect_category": "rescue",
        "expect_urgency_min": 9,
    },
    {
        "id": "hinglish_mixed",
        "report": "Bhai please help karo, ghar mein koi nahi hai aur mom ko breathing problem ho rahi hai",
        "location": "Secunderabad",
        "expect_category": "medical",
        "expect_urgency_min": 8,
    },
    {
        "id": "vague_low_confidence",
        "report": "need help asap",
        "location": "unknown",
        "expect_confidence_max": 0.65,
    },
    {
        "id": "en_shelter",
        "report": "Family of 5 displaced after fire in Mehdipatnam, need shelter tonight",
        "location": "Mehdipatnam, Hyderabad",
        "expect_category": "shelter",
        "expect_urgency_min": 7,
    },
]