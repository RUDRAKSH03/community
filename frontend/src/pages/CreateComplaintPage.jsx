import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Plus, Siren } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useToast } from '../context/ToastContext'
import api from '../services/api'
import Spinner from '../components/ui/Spinner'

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.2, 0, 0, 1] },
  }),
}

function CreateComplaintPage() {
  const { success, error: toastError, loading: toastLoading, dismiss } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [beforeImage, setBeforeImage] = useState(null)
  const [departmentId, setDepartmentId] = useState('')
  const [isSOS, setIsSOS] = useState(false)
  const [address, setAddress] = useState('')
  const [location, setLocation] = useState({ lat: null, lng: null })
  const [preview, setPreview] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    api.get('/departments')
      .then(res => setDepartments(res.data?.data || []))
      .catch(err => console.error('Failed to load departments', err))
  }, [])

  const groupedDepartments = useMemo(() => {
    return departments.reduce((acc, dept) => {
      const cat = dept.category || 'Other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(dept)
      return acc
    }, {})
  }, [departments])

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    const toastId = toastLoading('Submitting report...')
    try {
      const formData = new FormData()
      formData.append('title', isSOS ? `[SOS] ${title}` : title)
      formData.append('description', description)
      if (departmentId) formData.append('department_id', departmentId)
      if (isSOS) formData.append('priority', 'high')
      if (beforeImage) formData.append('before_image', beforeImage)
      if (address) formData.append('address', address)
      if (location.lat) formData.append('latitude', location.lat)
      if (location.lng) formData.append('longitude', location.lng)
      await api.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      success('Report submitted successfully')
      setTitle(''); setDescription(''); setBeforeImage(null); setDepartmentId(''); setIsSOS(false); setPreview(''); setAddress(''); setLocation({ lat: null, lng: null })
      setMessage('Your report has been successfully recorded.')
    } catch (err) {
      setError(err.message)
      toastError(err.message)
    } finally {
      dismiss(toastId)
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/png': [], 'image/jpeg': [], 'image/jpg': [] },
    multiple: false,
    onDrop: (files) => {
      const f = files?.[0]
      if (f) { setBeforeImage(f); setPreview(URL.createObjectURL(f)) }
    },
  })

  const getLocation = () => {
    if (navigator.geolocation) {
      setLocationLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            const data = await res.json()
            const fetchedAddress = data.display_name || ''
            
            setLocation({ lat, lng })
            setAddress(fetchedAddress)
            success('Location detected ✅')
          } catch (err) {
            setLocation({ lat, lng })
            toastError('Unable to detect address, please enter manually')
          } finally {
            setLocationLoading(false)
          }
        },
        (err) => {
          setLocationLoading(false)
          toastError('Could not get location: ' + err.message)
        }
      )
    } else {
      toastError('Geolocation not supported by this browser')
    }
  }

  return (
    <div className="flex justify-center px-6 py-12 md:py-20 relative">
      <div className="w-full max-w-3xl">
        <motion.div variants={reveal} initial="hidden" animate="visible" className="md-card p-8 md:p-12 shadow-md-1 relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 pb-6 border-b border-md-surface-low gap-6 relative z-10">
            <div>
              <h2 className="text-3xl font-medium tracking-tight text-md-text">Report an Issue</h2>
              <p className="text-md-text-sec mt-1">Provide details to help us resolve the problem quickly.</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6 relative z-10">
            <motion.div variants={reveal} initial="hidden" animate="visible" custom={1} className="md-input-container">
              <input id="title" className="md-input" placeholder=" " value={title} onChange={(e) => setTitle(e.target.value)} required />
              <label htmlFor="title" className="md-label">Issue Title</label>
            </motion.div>

            <motion.div variants={reveal} initial="hidden" animate="visible" custom={2} className="md-input-container">
              <textarea id="desc" className="md-input min-h-[120px] resize-none" placeholder=" " value={description} onChange={(e) => setDescription(e.target.value)} required />
              <label htmlFor="desc" className="md-label">Detailed Description</label>
            </motion.div>

            <motion.div variants={reveal} initial="hidden" animate="visible" custom={3} className="md-input-container">
              <select id="dept" className="md-input appearance-none bg-transparent" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value=""></option>
                {Object.entries(groupedDepartments).map(([category, depts]) => (
                  <optgroup key={category} label={category} className="bg-md-surface-low font-bold">
                    {depts.map(dept => (
                      <option key={dept.id} value={dept.id} className="font-normal">{dept.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <label htmlFor="dept" className="md-label">Assigned Department</label>
            </motion.div>

            <motion.div variants={reveal} initial="hidden" animate="visible" custom={4} className="flex flex-col gap-4 bg-md-surface-low p-4 rounded-xl border border-md-surface-low">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-md-text">Location (Optional)</span>
                <button type="button" onClick={getLocation} disabled={locationLoading} className="md-btn-secondary py-1.5 px-4 text-xs disabled:opacity-50 flex items-center gap-2">
                  {locationLoading ? <Spinner className="w-3 h-3" /> : null}
                  {locationLoading ? 'Fetching...' : location.lat ? 'Location Detected ✅' : 'Auto GPS'}
                </button>
              </div>
              <div className="md-input-container bg-transparent !pt-4 !pb-1 !px-0">
                <input id="addr" className="md-input" placeholder=" " value={address} onChange={(e) => setAddress(e.target.value)} />
                <label htmlFor="addr" className="md-label !left-0">Manual Address / Landmark</label>
              </div>
            </motion.div>

            {isSOS && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center gap-3 bg-[#FFD9DF] text-[#3F0018] p-4 rounded-xl text-sm font-medium">
                <AlertTriangle size={18} /> SOS Protocol Active: This issue will be flagged for immediate response.
              </motion.div>
            )}

            {/* Dropzone */}
            <motion.div variants={reveal} initial="hidden" animate="visible" custom={4}>
              <div
                {...getRootProps()}
                className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
                  isDragActive ? 'border-md-primary bg-md-sec-container' : 'border-md-text-sec/30 bg-md-bg hover:border-md-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-12 h-12 bg-md-surface rounded-full flex items-center justify-center mx-auto mb-4 text-md-primary">
                  <Plus size={24} />
                </div>
                <p className="font-medium text-md-text">{isDragActive ? 'Drop here' : 'Add Photo Evidence'}</p>
                <p className="text-sm text-md-text-sec mt-1">Drag and drop, or click to browse</p>
              </div>
              {preview && (
                <div className="mt-4 p-2 bg-md-bg rounded-2xl">
                  <img src={preview} alt="preview" className="h-48 w-full object-cover rounded-xl" />
                </div>
              )}
            </motion.div>

            {message && <div className="bg-[#D3E8D6] text-[#0A3815] p-4 rounded-xl text-sm font-medium">{message}</div>}
            {error && <div className="bg-[#FFD9DF] text-[#3F0018] p-4 rounded-xl text-sm font-medium">{error}</div>}

            <div className="pt-4 flex justify-end gap-4">
              <button type="submit" disabled={loading} className="md-btn-primary w-full sm:w-auto h-12 min-w-[140px] flex justify-center items-center">
                {loading ? <Spinner className="border-white/20 border-t-white" /> : 'Submit Report'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* SOS Toggle FAB */}
      <div className="fixed bottom-8 right-8 z-50">
        <motion.button
          onClick={() => setIsSOS((v) => !v)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 rounded-2xl px-6 py-4 shadow-md-2 transition-all duration-300 font-medium ${
            isSOS ? 'bg-[#3F0018] text-[#FFD9DF]' : 'bg-md-surface-low text-md-text hover:bg-[#FFD9DF] hover:text-[#3F0018]'
          }`}
        >
          <Siren size={20} /> Toggle SOS
        </motion.button>
      </div>
    </div>
  )
}

export default CreateComplaintPage
