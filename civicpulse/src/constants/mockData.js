const now = new Date()
const hour = (h) => new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, 0, 0)
const daysAgo = (d) => new Date(now.getTime() - d * 86400000)
const hoursAgo = (h) => new Date(now.getTime() - h * 3600000)
const minsAgo = (m) => new Date(now.getTime() - m * 60000)

export const MOCK_VOLUNTEERS = [
  { id: 'v1', uid: 'v1', name: 'Priya Sharma', email: 'priya@example.com', skills: ['medical', 'emotional'], location: 'Koramangala, Bengaluru', coords: { lat: 12.9352, lng: 77.6245 }, availability: true, rating: 4.8, total_tasks_completed: 47, created_at: daysAgo(120) },
  { id: 'v2', uid: 'v2', name: 'Arjun Mehta', email: 'arjun@example.com', skills: ['food', 'resources', 'mobility'], location: 'Banjara Hills, Hyderabad', coords: { lat: 17.4156, lng: 78.4347 }, availability: true, rating: 4.5, total_tasks_completed: 32, created_at: daysAgo(90) },
  { id: 'v3', uid: 'v3', name: 'Kavya Nair', email: 'kavya@example.com', skills: ['shelter', 'food', 'emotional'], location: 'T. Nagar, Chennai', coords: { lat: 13.0418, lng: 80.2341 }, availability: false, rating: 4.9, total_tasks_completed: 61, created_at: daysAgo(200) },
  { id: 'v4', uid: 'v4', name: 'Rahul Desai', email: 'rahul@example.com', skills: ['safety', 'mobility', 'resources'], location: 'Andheri West, Mumbai', coords: { lat: 19.1364, lng: 72.8296 }, availability: true, rating: 4.2, total_tasks_completed: 18, created_at: daysAgo(60) },
  { id: 'v5', uid: 'v5', name: 'Sneha Gupta', email: 'sneha@example.com', skills: ['medical', 'food', 'shelter'], location: 'Connaught Place, Delhi', coords: { lat: 28.6315, lng: 77.2167 }, availability: true, rating: 4.7, total_tasks_completed: 53, created_at: daysAgo(150) },
]

export const MOCK_NEEDS = [
  {
    id: 'n1', tracking_id: 'CP-2024-0892', raw_report: 'My elderly mother has run out of her blood pressure medication and cannot go to the pharmacy. She needs help getting her prescription filled urgently.',
    summary: 'Elderly woman needs blood pressure medication picked up from pharmacy', category: 'medical', urgency: 'urgent', quantity: 1,
    required_skills: ['medical'], location_hint: 'Koramangala 4th Block, Bengaluru', location_coords: { lat: 12.9352, lng: 77.6245 },
    status: 'matched', priority_score: 78, confidence: 0.92, needs_review: false,
    submitted_at: hoursAgo(3), updated_at: hoursAgo(1), assigned_volunteer_id: 'v1', match_tier: 1,
    escalation_status: null, resolved_at: null, resolution_notes: null, volunteers_helped: null,
    contact_phone: '+91 9876543210', contact_email: null,
  },
  {
    id: 'n2', tracking_id: 'CP-2024-0893', raw_report: 'A family of 5 displaced by flooding needs immediate shelter and food. They are currently at the community center.',
    summary: 'Family of 5 displaced by flooding — needs shelter and food immediately', category: 'shelter', urgency: 'critical', quantity: 5,
    required_skills: ['shelter', 'food'], location_hint: 'Banjara Hills, Hyderabad', location_coords: { lat: 17.4156, lng: 78.4347 },
    status: 'active', priority_score: 95, confidence: 0.97, needs_review: false,
    submitted_at: hoursAgo(5), updated_at: hoursAgo(2), assigned_volunteer_id: 'v2', match_tier: 1,
    escalation_status: null, resolved_at: null, resolution_notes: null, volunteers_helped: null,
    contact_phone: '+91 8765432109', contact_email: 'flood.help@email.com',
  },
  {
    id: 'n3', tracking_id: 'CP-2024-0894', raw_report: 'Senior citizen living alone needs help with grocery shopping. Cannot walk far distances.',
    summary: 'Senior citizen needs grocery shopping assistance', category: 'food', urgency: 'low', quantity: 1,
    required_skills: ['food', 'mobility'], location_hint: 'T. Nagar, Chennai', location_coords: { lat: 13.0418, lng: 80.2341 },
    status: 'pending_review', priority_score: 42, confidence: 0.85, needs_review: true,
    submitted_at: minsAgo(45), updated_at: minsAgo(45), assigned_volunteer_id: null, match_tier: null,
    escalation_status: null, resolved_at: null, resolution_notes: null, volunteers_helped: null,
    contact_phone: null, contact_email: 'senior.help@email.com',
  },
  {
    id: 'n4', tracking_id: 'CP-2024-0895', raw_report: 'Building collapse in Andheri, multiple people trapped. Need immediate rescue and medical help.',
    summary: 'Building collapse — multiple people trapped, rescue needed', category: 'safety', urgency: 'critical', quantity: 12,
    required_skills: ['safety', 'medical'], location_hint: 'Andheri West, Mumbai', location_coords: { lat: 19.1364, lng: 72.8296 },
    status: 'pending_review', priority_score: 98, confidence: 0.95, needs_review: true,
    submitted_at: minsAgo(10), updated_at: minsAgo(10), assigned_volunteer_id: null, match_tier: null,
    escalation_status: 'sla_exceeded', resolved_at: null, resolution_notes: null, volunteers_helped: null,
    contact_phone: '+91 7654321098', contact_email: null,
  },
  {
    id: 'n5', tracking_id: 'CP-2024-0896', raw_report: 'Need transportation for a disabled person to reach hospital for dialysis appointment.',
    summary: 'Disabled person needs transportation to hospital for dialysis', category: 'mobility', urgency: 'urgent', quantity: 1,
    required_skills: ['mobility'], location_hint: 'Connaught Place, Delhi', location_coords: { lat: 28.6315, lng: 77.2167 },
    status: 'open', priority_score: 72, confidence: 0.88, needs_review: false,
    submitted_at: hoursAgo(2), updated_at: hoursAgo(1), assigned_volunteer_id: null, match_tier: null,
    escalation_status: null, resolved_at: null, resolution_notes: null, volunteers_helped: null,
    contact_phone: '+91 6543210987', contact_email: null,
  },
  {
    id: 'n6', tracking_id: 'CP-2024-0897', raw_report: 'Young woman feeling very anxious and isolated after losing her job. Needs someone to talk to.',
    summary: 'Young woman needs emotional support after job loss', category: 'emotional', urgency: 'low', quantity: 1,
    required_skills: ['emotional'], location_hint: 'Whitefield, Bengaluru', location_coords: { lat: 12.9698, lng: 77.7500 },
    status: 'resolved', priority_score: 35, confidence: 0.90, needs_review: false,
    submitted_at: daysAgo(2), updated_at: daysAgo(1), assigned_volunteer_id: 'v1', match_tier: 2,
    escalation_status: null, resolved_at: daysAgo(1), resolution_notes: 'Connected with local mental health support group. Follow-up scheduled.', volunteers_helped: 1,
    contact_phone: null, contact_email: 'anon@email.com',
  },
  {
    id: 'n7', tracking_id: 'CP-2024-0898', raw_report: 'Community kitchen needs volunteers for cooking and distributing food to 200 flood affected people.',
    summary: 'Community kitchen needs volunteers for flood relief food distribution', category: 'food', urgency: 'urgent', quantity: 200,
    required_skills: ['food', 'resources'], location_hint: 'Jubilee Hills, Hyderabad', location_coords: { lat: 17.4325, lng: 78.4073 },
    status: 'matched', priority_score: 82, confidence: 0.91, needs_review: false,
    submitted_at: hoursAgo(6), updated_at: hoursAgo(3), assigned_volunteer_id: 'v2', match_tier: 1,
    escalation_status: null, resolved_at: null, resolution_notes: null, volunteers_helped: null,
    contact_phone: '+91 5432109876', contact_email: null,
  },
  {
    id: 'n8', tracking_id: 'CP-2024-0899', raw_report: 'Need blankets and warm clothing for a group of homeless people near the railway station.',
    summary: 'Homeless group needs blankets and warm clothing', category: 'resources', urgency: 'urgent', quantity: 15,
    required_skills: ['resources', 'shelter'], location_hint: 'Chennai Central, Chennai', location_coords: { lat: 13.0827, lng: 80.2707 },
    status: 'open', priority_score: 65, confidence: 0.87, needs_review: false,
    submitted_at: hoursAgo(4), updated_at: hoursAgo(4), assigned_volunteer_id: null, match_tier: null,
    escalation_status: null, resolved_at: null, resolution_notes: null, volunteers_helped: null,
    contact_phone: null, contact_email: null,
  },
  {
    id: 'n9', tracking_id: 'CP-2024-0900', raw_report: 'Child with high fever needs immediate medical attention. Parents cannot afford private hospital.',
    summary: 'Child with high fever needs affordable medical attention', category: 'medical', urgency: 'critical', quantity: 1,
    required_skills: ['medical'], location_hint: 'Lajpat Nagar, Delhi', location_coords: { lat: 28.5700, lng: 77.2400 },
    status: 'pending_review', priority_score: 90, confidence: 0.93, needs_review: true,
    submitted_at: minsAgo(20), updated_at: minsAgo(20), assigned_volunteer_id: null, match_tier: null,
    escalation_status: null, resolved_at: null, resolution_notes: null, volunteers_helped: null,
    contact_phone: '+91 4321098765', contact_email: null,
  },
  {
    id: 'n10', tracking_id: 'CP-2024-0901', raw_report: 'Water pipeline burst in the locality. Need clean drinking water supply for 50 families.',
    summary: 'Water pipeline burst — 50 families need clean drinking water', category: 'resources', urgency: 'urgent', quantity: 50,
    required_skills: ['resources', 'food'], location_hint: 'Malleswaram, Bengaluru', location_coords: { lat: 13.0035, lng: 77.5710 },
    status: 'resolved', priority_score: 75, confidence: 0.94, needs_review: false,
    submitted_at: daysAgo(1), updated_at: hoursAgo(8), assigned_volunteer_id: 'v5', match_tier: 1,
    escalation_status: null, resolved_at: hoursAgo(8), resolution_notes: 'Water tankers arranged. Municipal team notified for pipe repair.', volunteers_helped: 50,
    contact_phone: '+91 3210987654', contact_email: null,
  },
]

export const MOCK_MATCHES = [
  { id: 'm1', need_id: 'n1', volunteer_id: 'v1', match_score: 94, tier: 1, status: 'accepted', created_at: hoursAgo(2), accepted_at: hoursAgo(1.5), resolved_at: null },
  { id: 'm2', need_id: 'n2', volunteer_id: 'v2', match_score: 91, tier: 1, status: 'accepted', created_at: hoursAgo(4), accepted_at: hoursAgo(3), resolved_at: null },
  { id: 'm3', need_id: 'n6', volunteer_id: 'v1', match_score: 76, tier: 2, status: 'resolved', created_at: daysAgo(2), accepted_at: daysAgo(2), resolved_at: daysAgo(1) },
  { id: 'm4', need_id: 'n7', volunteer_id: 'v2', match_score: 88, tier: 1, status: 'accepted', created_at: hoursAgo(5), accepted_at: hoursAgo(4), resolved_at: null },
  { id: 'm5', need_id: 'n10', volunteer_id: 'v5', match_score: 85, tier: 1, status: 'resolved', created_at: daysAgo(1), accepted_at: daysAgo(1), resolved_at: hoursAgo(8) },
  { id: 'm6', need_id: 'n5', volunteer_id: 'v4', match_score: 79, tier: 2, status: 'pending', created_at: hoursAgo(1), accepted_at: null, resolved_at: null },
]

export const MOCK_DASHBOARD_METRICS = {
  totalNeedsToday: 14,
  pendingReview: 3,
  openNeeds: 4,
  matchedNeeds: 5,
  resolvedNeeds: 8,
  avgPriorityScore: 72,
  totalVolunteers: 48,
  activeVolunteers: 31,
  avgResponseTime: '8 min',
  matchRate: 94,
}
