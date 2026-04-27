import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

cred = credentials.Certificate("serviceAccount.json")
firebase_admin.initialize_app(cred)

uid = "UuPh5AAzGJh4Re7XU3XigeKszxq1"  # ← from Firebase Auth

db = firestore.client()

db.collection('volunteers').document(uid).set({
    'name': 'Demo Volunteer',
    'email': 'volunteer@civicpulse.com',
    'skills': ['nursing', 'first aid', 'medical assistance'],
    'location': 'Banjara Hills, Hyderabad',
    'coords': {'lat': 17.4156, 'lng': 78.4347},
    'availability': True,
    'rating': 4.8,
    'phone': '+91-9000000099',
    'created_at': firestore.SERVER_TIMESTAMP,
    'updated_at': firestore.SERVER_TIMESTAMP,
    'total_tasks_completed': 0,
})

print("✅ Volunteer profile created")