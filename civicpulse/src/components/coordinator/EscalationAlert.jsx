import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router'

export default function EscalationAlert({ count = 0 }) {
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 bg-urgent flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-[var(--radius-md)] text-white shadow-md overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold">Attention Required: SLA Breached</p>
              <p className="text-sm text-white/90">{count} need{count > 1 ? 's have' : ' has'} exceeded the maximum wait time without a match.</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/coordinator/review')}
            className="flex-shrink-0 px-4 py-2 bg-white text-urgent font-bold text-sm rounded-md hover:bg-white/90 transition-colors flex items-center gap-2 cursor-pointer relative z-10"
          >
            Review Now <ArrowRight size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
