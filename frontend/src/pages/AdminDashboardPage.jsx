import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, Settings2, ShieldCheck } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.05, ease: [0.2, 0, 0, 1] },
  }),
}

function AdminDashboardPage() {
  const { success, error: toastError } = useToast()
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [afterImagePreview, setAfterImagePreview] = useState({})
  const [rows, setRows] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [compRes, deptRes] = await Promise.all([
          api.get('/admin/complaints'),
          api.get('/departments')
        ])
        setRows(compRes.data?.data || [])
        setDepartments(deptRes.data?.data || [])
      } catch (err) {
        console.error('Failed to load admin data:', err)
        toastError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredRows = useMemo(
    () => rows.filter((r) => {
      const s = statusFilter === 'all' || r.status === statusFilter
      const d = departmentFilter === 'all' || r.department === departmentFilter
      return s && d
    }),
    [rows, statusFilter, departmentFilter],
  )

  const onStatusChange = (id, next) => setRows((p) => p.map((r) => (r.id === id ? { ...r, status: next } : r)))

  return (
    <div className="min-h-screen px-6 md:px-8 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FFD9DF] rounded-full flex items-center justify-center text-[#3F0018]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-medium tracking-tight">Admin Console</h1>
            </div>
          </div>
          
          <motion.div variants={reveal} initial="hidden" animate="visible" className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <select className="appearance-none bg-md-surface-low border-b-2 border-transparent hover:border-md-text-sec focus:border-md-primary rounded-t-lg px-10 py-2.5 font-medium outline-none transition-colors w-full cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <Settings2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-md-text-sec" />
            </div>
            <div className="relative">
              <select className="appearance-none bg-md-surface-low border-b-2 border-transparent hover:border-md-text-sec focus:border-md-primary rounded-t-lg px-10 py-2.5 font-medium outline-none transition-colors w-full cursor-pointer" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                <option value="all">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
              <Settings2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-md-text-sec" />
            </div>
          </motion.div>
        </div>

        {/* Data Grid */}
        <div className="md-card overflow-hidden">
          {/* Header Row */}
          <div className="hidden lg:grid grid-cols-12 gap-6 p-6 bg-md-surface-low/50 text-sm font-medium text-md-text-sec border-b border-md-surface-low">
            <div className="col-span-4">Issue Details</div>
            <div className="col-span-2">Department</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-4">Actions</div>
          </div>

          <div className="flex flex-col">
            {filteredRows.map((r, idx) => (
              <motion.div
                key={r.id}
                variants={reveal} initial="hidden" animate="visible" custom={idx}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 border-b border-md-surface-low last:border-b-0 items-center hover:bg-md-surface-low/30 transition-colors"
              >
                {/* Info */}
                <div className="col-span-4 flex flex-col gap-1">
                  <div className="flex items-start gap-2">
                    <h3 className="font-medium text-lg text-md-text">{r.title}</h3>
                    {r.priority === 'sos' && <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-[#FFD9DF] text-[#3F0018] uppercase">SOS</span>}
                  </div>
                  <p className="text-xs text-md-text-sec">ID: {r.id}</p>
                </div>

                {/* Department */}
                <div className="col-span-2 text-sm text-md-text font-medium">
                  <span className="lg:hidden text-md-text-sec mr-2">Dept:</span>{r.department?.name || 'Unassigned'}
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <StatusBadge status={r.status} />
                </div>

                {/* Actions */}
                <div className="col-span-4 flex flex-wrap items-center gap-3">
                  <select className="bg-md-bg border border-md-surface-low rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-md-primary" value={r.status} onChange={async (e) => {
                    const newStatus = e.target.value;
                    try {
                      await api.put(`/admin/complaints/${r.id}/status`, { status: newStatus })
                      onStatusChange(r.id, newStatus)
                      success('Status updated')
                    } catch (err) {
                      toastError('Failed to update status')
                    }
                  }}>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  <select className="bg-md-bg border border-md-surface-low rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-md-primary" disabled>
                    <option>Assign to...</option>
                    <option>Worker A</option>
                    <option>Worker B</option>
                  </select>

                  <button type="button" onClick={async () => {
                    try {
                      await api.put(`/admin/complaints/${r.id}/status`, { status: 'resolved' })
                      onStatusChange(r.id, 'resolved')
                      success('Marked as resolved')
                    } catch (err) {
                      toastError('Failed to resolve')
                    }
                  }} className="md-btn-primary px-4 py-2 text-sm">
                    Resolve
                  </button>

                  <label className="bg-md-sec-container text-md-text rounded-full px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-opacity-80 transition-colors text-sm font-medium">
                    <Upload size={16} /> Upload
                    <input className="hidden" type="file" accept="image/*" onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) setAfterImagePreview((p) => ({ ...p, [r.id]: URL.createObjectURL(f) }))
                    }} />
                  </label>
                </div>

                {afterImagePreview[r.id] && (
                  <div className="col-span-1 lg:col-span-12 mt-2 p-2 bg-md-surface-low rounded-2xl">
                    <img src={afterImagePreview[r.id]} alt="after" className="h-32 w-48 object-cover rounded-xl" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
