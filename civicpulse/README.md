# CivicPulse: Community Crisis & Mutual Aid Orchestrator

**CivicPulse** is a high-velocity, real-time platform designed to connect citizens in need with local volunteers and operational coordinators. It transforms chaotic community requests into structured, actionable tasks using an AI-first triage approach and a live "Command Center" philosophy.

---

## 🛰️ Operational Overview

### 1. The Citizen Hub (Help Request & Tracking)
*   **Intelligent Reporting**: A multi-step flow that structures raw reports into categories (Medical, Food, Shelter, etc.) and urgency levels.
*   **Live Tracking**: Every request generates a unique **Tracking ID**. Citizens can monitor their request's lifecycle (from "Pending AI Review" to "Volunteer Matched" to "Resolved") in real-time without refreshing.

### 2. The Volunteer Portal (Field Inbox)
*   **Real-Time Tasks**: A high-contrast task inbox that updates instantly as coordinators dispatch needs.
*   **Skill-Based Matching**: Volunteers see "Recommended" tasks based on their specific skills (e.g., Medical, Logistics, Emotional Support).
*   **Field Resolution**: One-tap acceptance and a resolution flow to report beneficiaries helped and final outcomes.

### 3. The Coordinator Command Center (Ops Control)
*   **Multi-Mode Triage**: 5 specialized views (Overview, Triage, Active Ops, Escalations, Verification) to manage the entire community lifecycle.
*   **Map-to-Feed Sync**: A synchronized interface where selecting an incident on the map instantly highlights its details in the operational feed, and vice-versa.
*   **Live Metrics**: Real-time calculation of Priority Scores, Response Times, and Match Rates to ensure no request is left behind.

---

## 🛠️ Technical Architecture

*   **Core**: React 18 + Vite (High-performance rendering).
*   **Navigation**: React Router v7 with **Nested Layouts** and **Auth Guards** (RequireAuth/PublicOnly) for secure, role-based access.
*   **State & Sync**: 
    *   **MockStore**: A custom in-memory singleton for the demo session that ensures real-time persistence and role-to-role communication (e.g., a Citizen submission instantly appears in the Coordinator's queue).
    *   **Firestore Ready**: Integrated adapters for seamless transition from Mock to Live Firebase database.
*   **UI/UX**: 
    *   **Premium Design**: Custom "CivicPulse" design system using CSS variables (T-tokens) and **Inline Styles** for maximum consistency across environments.
    *   **Micro-Animations**: Framer Motion transitions for smooth page entry/exit and interactive element feedback.
    *   **Iconography**: Lucide React for consistent, accessible visual cues.
*   **Geospatial**: Leaflet integration with custom markers, pulsing urgency indicators, and fly-to transitions.

---

## 🚀 Key Differentiators

1.  **Zero-Refresh UI**: Every component uses real-time listeners (subscriptions) rather than one-off fetches, ensuring the "Command Center" always shows the current truth.
2.  **Role Persistence**: The authentication system remembers your role and ensures you are always in the correct environment (Volunteer vs. Coordinator) while allowing seamless role switching via dedicated login portals.
3.  **Resilient Navigation**: Page states are restorable via URL parameters, making the app deep-linkable and immune to the "blank screen on back button" bug common in complex SPAs.

---

*Built for high-stakes community coordination where every second counts.*
