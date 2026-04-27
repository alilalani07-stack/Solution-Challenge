import { motion } from 'framer-motion'

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{ 
        width: '100%', 
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      }}
    >
      {children}
    </motion.div>
  )
}
