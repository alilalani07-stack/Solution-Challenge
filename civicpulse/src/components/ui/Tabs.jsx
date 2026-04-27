import { motion } from 'framer-motion'
import { T } from '../../styles/tokens'

export default function Tabs({ tabs, activeTab, onTabChange, style }) {
  return (
    <div style={{ display: 'flex', gap: '4px', backgroundColor: T.surface2, padding: '4px', borderRadius: T.radiusMd, position: 'relative', overflowX: 'auto', ...style }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            position: 'relative', padding: '8px 16px', fontSize: '14px', fontWeight: 500, borderRadius: T.radiusSm,
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', background: 'transparent',
            color: activeTab === tab.id ? T.textPrimary : T.textSecondary,
            zIndex: 10, whiteSpace: 'nowrap'
          }}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              style={{ position: 'absolute', inset: 0, backgroundColor: T.surface, boxShadow: T.shadowSm, borderRadius: T.radiusSm, zIndex: -1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          )}
          <span style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {tab.icon && <tab.icon size={16} />}
            {tab.label}
            {tab.count !== undefined && (
              <span style={{
                fontSize: '12px', padding: '2px 6px', borderRadius: '9999px', fontWeight: 600,
                backgroundColor: activeTab === tab.id ? T.primaryLight : T.surface3,
                color: activeTab === tab.id ? T.primary : T.textTertiary
              }}>
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  )
}
