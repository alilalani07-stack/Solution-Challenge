import { formatDistanceToNow, format } from 'date-fns'

export function timeAgo(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date)
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatDate(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date)
  return format(d, 'MMM d, yyyy')
}

export function formatDateTime(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date)
  return format(d, 'MMM d, yyyy h:mm a')
}

export function formatDuration(minutes) {
  if (!minutes) return 'N/A'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function truncate(str, len = 80) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

export function generateTrackingId() {
  const year = new Date().getFullYear()
  const num = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `CP-${year}-${num}`
}
