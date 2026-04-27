import { motion } from 'framer-motion'
import { FileText, Clock, Zap, CheckCircle2, AlertCircle, Users } from 'lucide-react'
import StatCard from '../ui/StatCard'
import { T } from '../../styles/tokens'

export default function MetricsDashboard({ metrics, loading }) {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
        {Array(6).fill(0).map((_, i) => (
          <div key={i} style={{ height: '140px', backgroundColor: T.surface2, borderRadius: T.radiusLg, animation: 'shimmer 1.5s infinite' }} className="shimmer" />
        ))}
      </div>
    )
  }

  if (!metrics) return null

  const items = [
    { label: 'Total Requests', value: metrics.totalNeedsToday, icon: FileText, trend: 12, color: T.primary },
    { label: 'Pending Review', value: metrics.pendingReview, icon: Clock, color: metrics.pendingReview > 5 ? T.urgent : T.primary },
    { label: 'Open Needs', value: metrics.openNeeds, icon: AlertCircle, color: T.primary },
    { label: 'Active & Matched', value: metrics.matchedNeeds, icon: Zap, color: '#8B5CF6' },
    { label: 'Resolved Today', value: metrics.resolvedNeeds, icon: CheckCircle2, color: T.success },
    { label: 'Active Volunteers', value: metrics.activeVolunteers, icon: Users, color: '#06B6D4', trend: -2 },
  ]

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '20px',
      overflowX: 'auto',
      paddingBottom: '8px'
    }}>
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <StatCard 
            value={item.value || 0} 
            label={item.label} 
            icon={item.icon} 
            color={item.color}
            trend={item.trend}
            trendLabel="vs yesterday"
          />
        </motion.div>
      ))}
    </div>
  )
}
