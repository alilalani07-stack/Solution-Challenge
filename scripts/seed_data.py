import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_parser.firestore_writer import write_need, write_volunteer
from datetime import datetime, timezone, timedelta

VOLUNTEERS = [
    {"name": "Ravi Kumar",    "skills": ["nursing", "first aid", "medical assistance"], "location": "Banjara Hills, Hyderabad",  "coords": {"lat": 17.4156, "lng": 78.4347}, "availability": True,  "rating": 4.8, "phone": "+91-9000000001"},
    {"name": "Priya Sharma",  "skills": ["cooking", "food distribution"],               "location": "Dilsukhnagar, Hyderabad",   "coords": {"lat": 17.3688, "lng": 78.5247}, "availability": True,  "rating": 4.5, "phone": "+91-9000000002"},
    {"name": "Arun Reddy",    "skills": ["flood rescue", "emergency response", "swimming"], "location": "Hussain Sagar, Hyderabad", "coords": {"lat": 17.4239, "lng": 78.4738}, "availability": True,  "rating": 4.9, "phone": "+91-9000000003"},
    {"name": "Sunita Patel",  "skills": ["shelter management", "logistics"],            "location": "Mehdipatnam, Hyderabad",    "coords": {"lat": 17.3950, "lng": 78.4383}, "availability": True,  "rating": 4.2, "phone": "+91-9000000004"},
    {"name": "Kiran Rao",     "skills": ["driving", "logistics", "food distribution"],  "location": "Secunderabad, Hyderabad",   "coords": {"lat": 17.4399, "lng": 78.4983}, "availability": False, "rating": 4.0, "phone": "+91-9000000005"},
    {"name": "Meera Nair",    "skills": ["nursing", "medical assistance", "first aid"], "location": "Kukatpally, Hyderabad",     "coords": {"lat": 17.4849, "lng": 78.3993}, "availability": True,  "rating": 4.7, "phone": "+91-9000000006"},
]

NEEDS = [
    {"category": "medical",  "urgency": 9,  "confidence": 0.95, "quantity": 2,  "required_skills": ["nursing", "medical assistance"], "location_hint": "Banjara Hills, Hyderabad",  "summary": "Elderly patient needs insulin injection urgently.",          "language_detected": "English", "needs_review": True,  "raw_report": "We need 2 nurses urgently near Banjara Hills. Elderly patient, no insulin.", "raw_location": "Banjara Hills, Hyderabad"},
    {"category": "food",     "urgency": 7,  "confidence": 0.90, "quantity": 10, "required_skills": [],                               "location_hint": "Dilsukhnagar, Hyderabad",   "summary": "10 children need food near Dilsukhnagar.",                   "language_detected": "Telugu", "needs_review": False, "raw_report": "మాకు తిండి అవసరం, 10 మంది పిల్లలు ఉన్నారు", "raw_location": "Dilsukhnagar, Hyderabad"},
    {"category": "rescue",   "urgency": 10, "confidence": 0.95, "quantity": 6,  "required_skills": ["flood rescue", "emergency response"], "location_hint": "Hussain Sagar, Hyderabad", "summary": "6 people trapped near Hussain Sagar due to flooding.", "language_detected": "Hindi",   "needs_review": True,  "raw_report": "बाढ़ आ गई है, हमें बचाओ, Hussain Sagar के पास फंसे हैं, 6 लोग", "raw_location": "Hussain Sagar, Hyderabad"},
    {"category": "shelter",  "urgency": 8,  "confidence": 1.00, "quantity": 5,  "required_skills": [],                               "location_hint": "Mehdipatnam, Hyderabad",    "summary": "Family of 5 needs shelter after fire.",                      "language_detected": "English", "needs_review": False, "raw_report": "Family of 5 displaced after fire in Mehdipatnam, need shelter tonight", "raw_location": "Mehdipatnam, Hyderabad"},
    {"category": "medical",  "urgency": 9,  "confidence": 0.90, "quantity": 1,  "required_skills": ["medical professional", "first aid"], "location_hint": "Secunderabad",         "summary": "Mother experiencing breathing problems at home.",             "language_detected": "Hindi",   "needs_review": True,  "raw_report": "Bhai please help karo, mom ko breathing problem ho rahi hai", "raw_location": "Secunderabad"},
    {"category": "food",     "urgency": 6,  "confidence": 0.85, "quantity": 20, "required_skills": ["food distribution"],            "location_hint": "Kukatpally, Hyderabad",     "summary": "20 flood-affected families need food packets.",               "language_detected": "English", "needs_review": False, "raw_report": "20 families affected by flooding in Kukatpally need food packets", "raw_location": "Kukatpally, Hyderabad"},
    {"category": "rescue",   "urgency": 8,  "confidence": 0.88, "quantity": 4,  "required_skills": ["flood rescue", "driving"],      "location_hint": "Kukatpally, Hyderabad",     "summary": "Family trapped on rooftop due to flooding needs rescue.",     "language_detected": "English", "needs_review": False, "raw_report": "Family trapped on rooftop near Kukatpally, flooding, 4 people", "raw_location": "Kukatpally, Hyderabad"},
    {"category": "shelter",  "urgency": 7,  "confidence": 0.92, "quantity": 3,  "required_skills": ["shelter management"],           "location_hint": "Banjara Hills, Hyderabad",  "summary": "3 elderly people need temporary shelter.",                   "language_detected": "English", "needs_review": False, "raw_report": "3 elderly people need temporary shelter in Banjara Hills area", "raw_location": "Banjara Hills, Hyderabad"},
    {"category": "safety",   "urgency": 9,  "confidence": 0.80, "quantity": 1,  "required_skills": ["emergency response"],           "location_hint": "Mehdipatnam, Hyderabad",    "summary": "Woman reports unsafe situation at home, needs immediate help.", "language_detected": "English", "needs_review": True,  "raw_report": "Woman alone at home feels unsafe, needs help immediately Mehdipatnam", "raw_location": "Mehdipatnam, Hyderabad"},
    {"category": "medical",  "urgency": 7,  "confidence": 0.88, "quantity": 1,  "required_skills": ["first aid"],                   "location_hint": "Dilsukhnagar, Hyderabad",   "summary": "Child with high fever needs medical attention.",              "language_detected": "English", "needs_review": False, "raw_report": "Child with high fever for 2 days in Dilsukhnagar needs medical help", "raw_location": "Dilsukhnagar, Hyderabad"},
]

def seed():
    print("Seeding volunteers...")
    for v in VOLUNTEERS:
        vid = write_volunteer(v)
        print(f"  Volunteer: {v['name']} → {vid}")

    print("\nSeeding needs...")
    now = datetime.now(timezone.utc)
    for i, n in enumerate(NEEDS):
        # Vary submitted_at so staleness boost works realistically
        offset = timedelta(minutes=[5, 15, 90, 30, 10, 45, 20, 60, 8, 25][i])
        n["submitted_at"] = (now - offset).isoformat()
        n["status"] = "open"
        nid = write_need(n, n["raw_report"], n["raw_location"])
        print(f"  Need: {n['summary'][:50]} → {nid}")

    print("\n✅ Seed complete. 6 volunteers + 10 needs written to Firestore.")

if __name__ == "__main__":
    seed()