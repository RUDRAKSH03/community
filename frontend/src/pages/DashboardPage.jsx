import { useEffect, useMemo, useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowRight, ArrowUp, CheckCircle2, Clock } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import StatusBadge from '../components/ui/StatusBadge'
import api from '../services/api'
import { hasAllowedRole } from '../utils/roles'

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.2, 0, 0, 1] },
  }),
}

const API_BASE = "http://localhost:8000"

function DashboardPage() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const [items, setItems] = useState([])
  const [localComplaints, setLocalComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [votingOn, setVotingOn] = useState(null)
  
  const [statsUser, setStatsUser] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0 })
  const [statsOverview, setStatsOverview] = useState({ totalComplaints: 0, resolvedComplaints: 0, pendingComplaints: 0, satisfactionRate: 0 })
  const [statsTrends, setStatsTrends] = useState([])
  const [statsDepartments, setStatsDepartments] = useState([])
  
  const canSeeAdmin = hasAllowedRole(user?.role, ['admin', 'super_admin', 'AREA_ADMIN', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN'])

  useEffect(() => {
    const load = async () => {
      try {
        const [resMy, resLocal, resUser, resOverview, resTrends, resDepts] = await Promise.all([
          api.get('/complaints/my'),
          api.get('/complaints/local'),
          api.get('/stats/user'),
          api.get('/stats/overview'),
          api.get('/stats/trends'),
          api.get('/stats/departments'),
        ])
        setItems(resMy.data?.data || [])
        setLocalComplaints(resLocal.data?.data || [])
        setStatsUser(resUser.data?.data)
        setStatsOverview(resOverview.data?.data)
        setStatsTrends(resTrends.data?.data || [])
        setStatsDepartments(resDepts.data?.data || [])
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleVote = async (id) => {
    if (votingOn) return
    setVotingOn(id)
    try {
      await api.post(`/complaints/${id}/vote`)
      setLocalComplaints(prev => prev.map(c => c.id === id ? { ...c, votes: c.votes + 1, hasVoted: true } : c))
      success('Vote recorded successfully')
    } catch (err) {
      toastError(err.response?.data?.message || err.message)
    } finally {
      setVotingOn(null)
    }
  }

  const userStatsData = useMemo(() => {
    const total = items.length;
    const pending = items.filter(c => String(c.status).toLowerCase() === 'pending').length;
    const resolved = items.filter(c => String(c.status).toLowerCase() === 'resolved' || String(c.status).toLowerCase() === 'closed').length;
    const inProgress = items.filter(c => String(c.status).toLowerCase() === 'in_progress' || String(c.status).toLowerCase() === 'assigned' || String(c.status).toLowerCase() === 'reviewed').length;

    return [
      { label: 'My Complaints', value: total, icon: AlertCircle, color: 'text-md-primary' },
      { label: 'Pending', value: pending, icon: Clock, color: 'text-orange-600' },
      { label: 'Resolved', value: resolved, icon: CheckCircle2, color: 'text-green-700' },
      { label: 'In Progress', value: inProgress, icon: AlertCircle, color: 'text-blue-600' },
    ]
  }, [items])
  
  const COLORS = ['#6750A4', '#10b981', '#f97316', '#3b82f6']

  const recent = items.slice(0, 4)

  if (!user) return <Navigate to="/login" replace />

  return (
    <div>
      {/* ══════ HERO ══════ */}
      <section className="px-6 md:px-8 pt-4 pb-12">
        <div className="mx-auto max-w-7xl">
          <motion.div variants={reveal} initial="hidden" animate="visible" className="bg-md-sec-container rounded-[48px] p-12 md:p-20 overflow-hidden relative">
            {/* Background decorative blob */}
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/40 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-md-text mb-6">
                Report. Track.<br/>Improve.
              </h1>
              <p className="text-lg text-md-text-sec mb-10">
                Welcome back, {user?.name}. Your community hub is ready. Track your recent reports or file a new issue to get started.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <Link to="/complaints/create" className="md-btn-primary text-xl px-10 py-5 h-auto shadow-md-2 w-full md:w-auto flex items-center justify-center font-bold">
                  Report Issue
                </Link>
                {canSeeAdmin && (
                  <Link to="/admin" className="md-btn-secondary">
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════ COMMON PROBLEMS ══════ */}
      <section className="px-6 md:px-8 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium">Common Problems in Your Area</h2>
          </div>

          <div className="flex overflow-x-auto gap-6 pb-6 snap-x hide-scrollbar">
            {(!localComplaints || localComplaints.length === 0) && (
              <div className="w-full md-card p-12 text-center text-md-text-sec flex-shrink-0">
                {loading ? 'Loading...' : 'No local problems reported in your area yet.'}
              </div>
            )}
            
            {(localComplaints || []).map((item) => (
              <motion.div 
                key={item.id} 
                className="md-card flex flex-col p-6 space-y-3 group snap-start flex-shrink-0 w-[280px] sm:w-[320px]"
              >
                {item.address && (
                  <div className="text-xs text-md-text-sec truncate font-medium">
                    📍 {item.address}
                  </div>
                )}
                
                <h3 className="text-lg font-semibold text-md-text line-clamp-2">{item.title}</h3>
                <p className="text-md-text-sec text-sm line-clamp-3 flex-1">{item.description}</p>
                
                <div className="flex items-center justify-between pt-4 mt-auto border-t border-md-surface-low">
                    <div className="flex items-center gap-1 text-sm font-medium text-md-primary">
                      <ArrowUp size={16} />
                      {item.votes || 0} Votes
                    </div>
                    
                    <button 
                      onClick={() => handleVote(item.id)}
                      disabled={item.hasVoted || votingOn === item.id}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        item.hasVoted 
                          ? 'bg-md-surface-low text-md-text-sec cursor-not-allowed'
                          : 'bg-md-sec-container text-md-primary hover:bg-[#E8DEF8]'
                      }`}
                    >
                      {item.hasVoted ? 'Voted' : '⬆ Vote'}
                    </button>
                  </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ USER STATS ══════ */}
      <section className="px-6 md:px-8 py-12 mt-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-medium mb-6">My Activity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {userStatsData.map((s, idx) => (
              <motion.div
                key={s.label}
                variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={idx}
                className="md-card p-6 flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-white ${s.color}`}>
                    <s.icon size={24} />
                  </div>
                  <span className="text-md-text-sec font-medium">{s.label}</span>
                </div>
                <p className="text-5xl font-medium">{loading ? '...' : (s.value || 0)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ RECENT ACTIVITY ══════ */}
      <section className="px-6 md:px-8 py-12 pb-12 bg-md-surface-low/30">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium">Recent Community Activity</h2>
            <Link to="/complaints/my" className="text-md-primary font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!loading && (!recent || recent.length === 0) && (
              <div className="col-span-full md-card p-12 text-center text-md-text-sec">
                No recent community activity found.
              </div>
            )}
            
            {(recent || []).map((item, idx) => (
              <motion.div key={item.id} variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={idx} className="md-card p-6 flex flex-col gap-4 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-2 min-w-0">
                    {item.address && (
                      <div className="text-xs text-md-text-sec truncate font-medium">
                        📍 {item.address}
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-md-text truncate">{item.title}</h3>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                <p className="text-md-text-sec text-sm line-clamp-2">{item.description}</p>
                <div className="flex items-center text-xs text-md-text-sec font-medium mt-auto pt-2">
                    {item.department?.name || 'Unassigned'} • {item.priority || 'Normal'}
                  </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ COMMUNITY TRENDS (Line Chart) ══════ */}
      <section className="px-6 md:px-8 py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-medium mb-6">Community Trends</h2>
          <motion.div variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="md-card p-6 md:p-10 h-[400px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-md-text-sec">Loading statistics...</div>
            ) : (!statsTrends || statsTrends.length === 0) ? (
              <div className="flex h-full items-center justify-center text-md-text-sec">No trend data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statsTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="date" tick={{ fill: '#49454F' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#49454F' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Line type="monotone" dataKey="count" stroke="#6750A4" strokeWidth={4} dot={{ r: 4, fill: '#6750A4', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} animationDuration={1500} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>
      </section>

      {/* ══════ COMMUNITY BREAKDOWN (Bar & Pie) ══════ */}
      <section className="px-6 md:px-8 py-12 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <motion.div variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="md-card p-6 md:p-10">
              <h2 className="text-xl font-medium mb-8">Issues by Department</h2>
              <div className="h-[300px]">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-md-text-sec">Loading statistics...</div>
                ) : (!statsDepartments || statsDepartments.length === 0) ? (
                  <div className="flex h-full items-center justify-center text-md-text-sec">No department data available.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsDepartments} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.1)" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="department" type="category" axisLine={false} tickLine={false} tick={{ fill: '#49454F', fontSize: 12 }} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                      <Bar dataKey="count" fill="#6750A4" radius={[0, 8, 8, 0]} barSize={20} animationDuration={1500} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            <motion.div variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} className="md-card p-6 md:p-10">
              <h2 className="text-xl font-medium mb-2">Status Overview</h2>
              {statsOverview && (
                <p className="text-sm text-md-text-sec mb-8">Community Satisfaction Rate: <span className="font-bold text-md-primary">{statsOverview.satisfactionRate || 0}%</span></p>
              )}
              <div className="h-[300px]">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-md-text-sec">Loading statistics...</div>
                ) : (!statsOverview || (statsOverview.resolvedComplaints === 0 && statsOverview.pendingComplaints === 0)) ? (
                  <div className="flex h-full items-center justify-center text-md-text-sec">No status data available.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Resolved/Closed', value: statsOverview?.resolvedComplaints || 0 },
                          { name: 'Pending/Active', value: statsOverview?.pendingComplaints || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1500}
                      >
                        <Cell fill={COLORS[1]} />
                        <Cell fill={COLORS[2]} />
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* ══════ SOS FAB ══════ */}
      <Link to="/complaints/create" className="fixed bottom-8 right-8 z-50">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="md-fab">
          SOS
        </motion.div>
      </Link>
    </div>
  )
}

export default DashboardPage
