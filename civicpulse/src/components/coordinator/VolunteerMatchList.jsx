import { motion } from 'framer-motion'
import { MapPin, Star, UserPlus } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import MatchScoreBadge from '../volunteer/MatchScoreBadge'
import { T } from '../../styles/tokens'

export default function VolunteerMatchList({ matches, onAssign }) {
  if (!matches || matches.length === 0) {
    return (
      <div style={{ padding: '24px', backgroundColor: T.surface2, borderRadius: T.radiusLg, textAlign: 'center', fontSize: '14px', color: T.textSecondary, border: `1px solid ${T.border}` }}>
        No immediate matches found. The request will remain open in the active queue for manual dispatch.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {matches.map((match, idx) => (
        <motion.div
          key={match.volunteer.uid || idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          style={{
            backgroundColor: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusLg,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: T.shadowSm
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', 
                  backgroundColor: `${T.primary}10`, color: T.primary, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '20px', fontWeight: 800, border: `1px solid ${T.primary}20`
                }}>
                  {match.volunteer.name.charAt(0)}
                </div>
                <div style={{ position: 'absolute', bottom: '-4px', right: '-4px' }}>
                  <Badge value={`Tier ${match.tier}`} />
                </div>
              </div>
              
              <div>
                <h4 style={{ fontWeight: 800, color: T.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                  {match.volunteer.name}
                  <span style={{ fontSize: '11px', fontWeight: 600, color: T.textSecondary, display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: T.surface2, padding: '2px 6px', borderRadius: T.radiusFull }}>
                    <Star size={10} fill={T.warning} color={T.warning} /> {match.volunteer.rating || '5.0'}
                  </span>
                </h4>
                <p style={{ fontSize: '12px', color: T.textTertiary, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <MapPin size={12} /> {match.volunteer.location}
                </p>
              </div>
            </div>

            <MatchScoreBadge score={match.match_score} size="sm" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderTop: `1px solid ${T.border}50`, paddingTop: '12px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {match.matchingSkills?.slice(0, 2).map(skill => (
                <span key={skill} style={{ px: '8px', py: '2px', backgroundColor: T.surface2, color: T.textSecondary, fontSize: '10px', fontWeight: 700, borderRadius: T.radiusSm, textTransform: 'uppercase' }}>
                  {skill}
                </span>
              ))}
            </div>
            <Button size="sm" onClick={() => onAssign(match.volunteer.uid, match.tier)} icon={UserPlus}>
              Assign Manual
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
