import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import { ArrowRight, Home, HandHeart, ShieldAlert } from 'lucide-react'
import PageTransition from '../../components/layout/PageTransition'
import Card from '../../components/ui/Card'
import { staggerContainer, slideUp } from '../../utils/motionVariants'
import { T } from '../../styles/tokens'
import React, { useState } from 'react'

export default function RoleSelectionPage() {
  const navigate = useNavigate()

  return (
    <PageTransition>
      <div style={{
        backgroundColor: T.surface2,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 0'
      }}>
        <div style={{ maxWidth: '896px', margin: '0 auto', padding: '0 24px', width: '100%' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div style={{
                width: '48px', height: '48px', backgroundColor: T.primary, borderRadius: '50%',
                margin: '0 auto 24px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.white
              }}>
                <svg viewBox="0 0 32 32" fill="none" style={{ width: '24px', height: '24px' }}>
                  <circle cx="16" cy="16" r="14" fill="currentColor"/>
                  <path d="M16 8C11.58 8 8 11.58 8 16s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="white"/>
                  <circle cx="16" cy="16" r="2.5" fill="white"/>
                  <path d="M16 10v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h1 style={{ fontFamily: T.fontDisplay, fontSize: '36px', fontWeight: 700, marginBottom: '12px', color: T.textPrimary }}>
                Welcome to CivicPulse
              </h1>
              <p style={{ fontSize: '18px', color: T.textSecondary }}>
                How would you like to participate today?
              </p>
            </motion.div>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}
          >
            <RoleCard
              icon={Home}
              color={T.primary}
              bgColor={T.primaryLight}
              title="I need help"
              desc="Submit a request for assistance. No account required."
              actionText="Continue"
              onClick={() => navigate('/citizen')}
            />
            
            <RoleCard
              icon={HandHeart}
              color={T.success}
              bgColor={T.successLight}
              title="I want to help"
              desc="View needs in your area and volunteer your time and skills."
              actionText="Login / Register"
              onClick={() => navigate('/volunteer/login')}
            />

            <RoleCard
              icon={ShieldAlert}
              color="#8B5CF6"
              bgColor="#F3F0FF"
              title="I manage ops"
              desc="Review critical needs and coordinate volunteer matching."
              actionText="Coordinator Login"
              onClick={() => navigate('/coordinator/login')}
            />
          </motion.div>

        </div>
      </div>
    </PageTransition>
  )
}

function RoleCard({ icon: Icon, color, bgColor, title, desc, actionText, onClick }) {
  const [hover, setHover] = useState(false)

  return (
    <motion.div variants={slideUp} style={{ height: '100%' }}>
      <div 
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: T.white,
          borderRadius: T.radiusLg,
          border: `1px solid ${hover ? color : T.border}`,
          padding: '24px',
          height: '100%',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s ease',
          boxShadow: hover ? T.shadowMd : T.shadowSm,
          transform: hover ? 'translateY(-2px)' : 'none'
        }}
      >
        <div style={{
          width: '56px', height: '56px', borderRadius: T.radiusLg, backgroundColor: bgColor, color: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
          transform: hover ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s ease'
        }}>
          <Icon size={28} />
        </div>
        
        <h3 style={{ fontFamily: T.fontDisplay, fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: hover ? color : T.textPrimary, transition: 'color 0.2s ease' }}>
          {title}
        </h3>
        
        <p style={{ fontSize: '14px', color: T.textSecondary, marginBottom: '24px', flex: 1, lineHeight: 1.5 }}>
          {desc}
        </p>
        
        <div style={{
          display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: 600, color: color,
          opacity: hover ? 1 : 0, transition: 'opacity 0.2s ease'
        }}>
          {actionText} <ArrowRight size={16} style={{ marginLeft: '4px' }} />
        </div>
      </div>
    </motion.div>
  )
}
