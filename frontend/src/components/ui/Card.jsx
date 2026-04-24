import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

function Card({ className, hover = true, children }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={cn('glass soft-shadow rounded-2xl p-4', className)}
    >
      {children}
    </motion.div>
  )
}

export default Card

