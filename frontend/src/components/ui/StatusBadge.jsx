import { cn } from '../../utils/cn'

const styles = {
  pending: 'bg-md-surface-low text-md-text-sec',
  resolved: 'bg-[#D3E8D6] text-[#0A3815]', // Custom green tint for resolved
  in_progress: 'bg-md-sec-container text-md-primary',
  reviewed: 'bg-[#E3E3E3] text-[#1C1B1F]',
  assigned: 'bg-[#E8DEF8] text-[#1C1B1F]',
  closed: 'bg-[#F3EDF7] text-[#49454F]',
  sos: 'bg-[#FFD9DF] text-[#3F0018]', // Soft red tint for SOS
}

function StatusBadge({ status = 'pending' }) {
  const normalized = String(status).toLowerCase()
  const finalStyle = normalized === 'sos' ? styles.sos : (styles[normalized] || styles.pending)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        finalStyle
      )}
    >
      {status.toUpperCase()}
    </span>
  )
}

export default StatusBadge
