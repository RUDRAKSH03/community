import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

function Button({ className, children, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-2 font-medium text-white shadow-lg shadow-purple-300/30 transition disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-purple-900/40',
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default Button
