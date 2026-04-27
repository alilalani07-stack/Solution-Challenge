export function getPriorityColor(score) {
  if (score >= 80) return { bg: '#FFF0F0', text: '#FF4444', label: 'Critical' }
  if (score >= 60) return { bg: '#FFF8EC', text: '#FF9500', label: 'High' }
  if (score >= 40) return { bg: '#EBF0FF', text: '#0057FF', label: 'Medium' }
  return { bg: '#E6FAF5', text: '#00C48C', label: 'Low' }
}

export function getPriorityLabel(score) {
  if (score >= 80) return 'Critical'
  if (score >= 60) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}
