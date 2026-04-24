import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Plus, Inbox } from 'lucide-react'
import api from '../services/api'
import StatusBadge from '../components/ui/StatusBadge'
import { useToast } from '../context/ToastContext'

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.05, ease: [0.2, 0, 0, 1] },
  }),
}

function MyComplaintsPage() {
  const { success } = useToast()
  const [items, setItems] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [votesById, setVotesById] = useState(() => JSON.parse(localStorage.getItem('votesById') || '{}'))
  const [votedIds, setVotedIds] = useState(() => JSON.parse(localStorage.getItem('votedIds') || '[]'))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try { const res = await api.get('/complaints/my'); setItems(res.data?.data || []) }
      catch (err) { setError(err.message) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  useEffect(() => { localStorage.setItem('votesById', JSON.stringify(votesById)) }, [votesById])
  useEffect(() => { localStorage.setItem('votedIds', JSON.stringify(votedIds)) }, [votedIds])

  const filtered = useMemo(() => {
    const src = statusFilter === 'all' ? items : items.filter((i) => String(i.status).toLowerCase() === statusFilter)
    return [...src].sort((a, b) => (votesById[b.id] || 0) - (votesById[a.id] || 0))
  }, [items, statusFilter, votesById])

  const upvote = (id) => {
    if (votedIds.includes(id)) return
    setVotesById((p) => ({ ...p, [id]: (p[id] || 0) + 1 }))
    setVotedIds((p) => [...p, id])
    success('Upvoted successfully')
  }

  return (
    <div className="min-h-screen px-6 md:px-8 py-8 md:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-md-sec-container rounded-full flex items-center justify-center text-md-primary">
              <Inbox size={24} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-medium tracking-tight">Your Complaints</h1>
            </div>
          </div>
          
          <motion.div variants={reveal} initial="hidden" animate="visible" className="relative">
            <select
              className="appearance-none bg-md-surface-low border-b-2 border-transparent hover:border-md-text-sec focus:border-md-primary rounded-t-lg px-6 py-3 font-medium outline-none transition-colors w-full md:w-auto"
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-md-text-sec" />
          </motion.div>
        </div>

        {error && <div className="mb-8 bg-[#FFD9DF] text-[#3F0018] p-4 rounded-xl text-sm font-medium max-w-md">{error}</div>}

        {/* List Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {!loading && filtered.length === 0 && (
            <div className="col-span-full md-card p-16 flex flex-col items-center justify-center text-center">
              <Inbox size={48} className="text-md-text-sec/30 mb-4" />
              <p className="text-lg font-medium text-md-text">No complaints found</p>
              <p className="text-md-text-sec">You haven't filed any complaints matching this filter.</p>
            </div>
          )}
          
          {filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              variants={reveal} initial="hidden" animate="visible" custom={idx % 6}
              className="md-card flex flex-col overflow-hidden"
            >
              {item.before_image ? (
                <div className="h-48 overflow-hidden bg-md-surface-low">
                  <img src={`https://community-backend-8pqm.onrender.com${item.before_image}`} alt={item.title} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-48 bg-md-surface-low flex items-center justify-center text-md-text-sec/50 text-sm">
                  No Image Available
                </div>
              )}

              <div className="flex-1 flex flex-col p-6">
                <div className="mb-4">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <StatusBadge status={item.status} />
                    {(String(item.priority).toLowerCase() === 'sos' || String(item.title).includes('[SOS]')) && (
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-[#FFD9DF] text-[#3F0018]">SOS</span>
                    )}
                    {votesById[item.id] >= 3 && <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-[#D3E8D6] text-[#0A3815]">Trending</span>}
                  </div>
                  <h3 className="text-xl font-medium tracking-tight truncate">{item.title}</h3>
                </div>

                <p className="text-md-text-sec text-sm mb-6 line-clamp-3 flex-1">{item.description}</p>

                <div className="flex items-center gap-2 mb-4 text-xs font-medium text-md-text-sec">
                  <span className="bg-md-bg px-2 py-1 rounded-md">{item.department?.name || 'Unassigned'}</span>
                  <span>•</span>
                  <span className="bg-md-bg px-2 py-1 rounded-md">{item.priority || 'Normal'} priority</span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-md-surface-low">
                  <button
                    type="button" onClick={() => upvote(item.id)} disabled={votedIds.includes(item.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-md-sec-container hover:bg-[#D0C4E8] text-md-text rounded-full py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Plus size={16} /> Upvote ({votesById[item.id] || 0})
                  </button>
                  <button
                    type="button" onClick={() => setExpandedId((p) => (p === item.id ? null : item.id))}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-md-surface-low transition-colors text-md-text-sec"
                  >
                    <ChevronDown size={20} className={expandedId === item.id ? 'rotate-180 transition-transform' : 'transition-transform'} />
                  </button>
                </div>

                <AnimatePresence>
                  {expandedId === item.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden text-sm text-md-text-sec pt-4 space-y-1"
                    >
                      <p><strong>ID:</strong> {item.id}</p>
                      <p><strong>Filed:</strong> {new Date(item.created_at || Date.now()).toLocaleString()}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyComplaintsPage
