export const URGENCY_LEVELS = [
  { id: 'low', label: 'Low Priority', description: 'Can wait a few hours', color: '#0057FF', bg: '#EBF0FF' },
  { id: 'urgent', label: 'Urgent', description: 'Needs help within an hour', color: '#FF9500', bg: '#FFF8EC' },
  { id: 'critical', label: 'Critical', description: 'Immediate danger — respond now', color: '#FF4444', bg: '#FFF0F0' },
]

export function getUrgencyById(id) {
  return URGENCY_LEVELS.find(u => u.id === id) || URGENCY_LEVELS[0]
}
