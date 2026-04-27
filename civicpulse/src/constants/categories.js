export const CATEGORIES = [
  { id: 'medical', label: 'Medical', icon: '🏥', color: '#FF4444' },
  { id: 'food', label: 'Food & Water', icon: '🍽️', color: '#FF9500' },
  { id: 'shelter', label: 'Shelter', icon: '🏠', color: '#00C48C' },
  { id: 'safety', label: 'Safety', icon: '🛡️', color: '#0057FF' },
  { id: 'mobility', label: 'Mobility', icon: '🚗', color: '#8B5CF6' },
  { id: 'emotional', label: 'Emotional Support', icon: '💙', color: '#06B6D4' },
  { id: 'resources', label: 'Resources', icon: '📦', color: '#84CC16' },
  { id: 'other', label: 'Other', icon: '📋', color: '#6B7280' },
]

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
}
