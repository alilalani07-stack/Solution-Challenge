# Solution-Challenge

# 🌍 CivicPulse

CivicPulse is a civic issue reporting and volunteer coordination platform that connects citizens in need with nearby verified volunteers in real-time using AI-powered triage and matching.

It consists of:
- 🖥️ Frontend: CivicPulse (React)
- ⚙️ Backend: CivicPulse AI (FastAPI + Firestore + AI pipeline)

---

## 🚀 Features

### 🧠 AI-Powered Intake
- Parses citizen reports using AI
- Extracts category, urgency, and structured data
- Detects duplicates automatically

### 📊 Smart Triage System
- Priority scoring system for incoming requests
- Coordinator review dashboard
- Approval / rejection / escalation flow

### 🤝 Volunteer Matching Engine
- Matches requests with nearby volunteers
- Skill-based and availability-based matching
- Real-time assignment system

### ✅ Resolution Verification System
- Volunteers mark tasks as resolved
- Coordinators verify or reopen tasks
- Full audit trail of resolution lifecycle

---

## 🏗️ Project Structure

Solution-Challenge/
│
├── civicpulse/ # Frontend (React)
├── civicpulse-ai/ # Backend (FastAPI)
│
└── README.md


---

## ⚙️ Backend Setup (CivicPulse AI)

cd civicpulse-ai
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn api.app:app --reload --port 8000

Backend runs at:
http://localhost:8000

Frontend Setup (CivicPulse)

cd civicpulse
npm install
npm run dev

Frontend runs at:

http://localhost:5173

API Overview
Core Endpoints
POST /submit-need → Submit civic issue
GET /needs → Fetch open needs
GET /needs/all → Admin dashboard view
PATCH /needs/{id}/status → Update status
POST /needs/{id}/verify → Verify resolution
POST /run-matching → Trigger volunteer matching
GET /dashboard-summary → System overview

Tech Stack
Frontend
React
Framer Motion
Lucide Icons
Custom UI System
Backend
FastAPI
Firebase Firestore
Pydantic
Python AI pipeline

Environment Variables

Backend requires:
GOOGLE_APPLICATION_CREDENTIALS=serviceAccount.json
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

Key System Flow
Citizen submits request
AI parses and classifies need
Coordinator reviews and approves
Matching engine assigns volunteer
Volunteer resolves task
Coordinator verifies resolution


Purpose

Built for civic impact:

Faster emergency response coordination
Community-driven volunteer network
AI-assisted civic infrastructure
