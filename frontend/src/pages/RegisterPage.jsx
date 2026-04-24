import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/ui/Spinner'
import { UserPlus } from 'lucide-react'

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.2, 0, 0, 1] },
  }),
}

function RegisterPage() {
  const { register } = useAuth()
  const { success, error: toastError } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', address: '', pincode: '', contact: '', email: '', password: '', latitude: '', longitude: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)

  const onSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  try {
    await register({
      name: form.name,
      email: form.email,
      password: form.password
    })

    success('Account created')
    navigate('/dashboard', { replace: true })

  } catch (err) {
    setError(err.message)
    toastError(err.message)
  } finally {
    setLoading(false)
  }
}

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text' },
    { key: 'contact', label: 'Contact Number', type: 'text' },
    { key: 'email', label: 'Email address', type: 'email' },
    { key: 'password', label: 'Password', type: 'password' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'pincode', label: 'Pincode', type: 'text' },
  ]

  const getLocation = () => {
    if (navigator.geolocation) {
      setLocationLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude
          const lon = pos.coords.longitude
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
            const data = await res.json()
            const fetchedAddress = data.display_name || ''
            const fetchedPincode = data.address?.postcode || ''
            
            setForm(p => ({ 
              ...p, 
              latitude: lat, 
              longitude: lon,
              address: fetchedAddress,
              pincode: fetchedPincode
            }))
            success('Location detected ✅')
          } catch (err) {
            setForm(p => ({ ...p, latitude: lat, longitude: lon }))
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
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-12">
      <motion.div variants={reveal} initial="hidden" animate="visible" className="w-full max-w-2xl">
        <div className="md-card p-8 sm:p-12 shadow-md-1">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-md-sec-container rounded-full flex items-center justify-center mb-4 text-md-primary">
              <UserPlus size={28} />
            </div>
            <h1 className="text-3xl font-medium tracking-tight text-md-text">Create Account</h1>
            <p className="text-md-text-sec mt-2">Join the community network</p>
          </div>

          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.map((f, idx) => (
              <motion.div key={f.key} variants={reveal} initial="hidden" animate="visible" custom={idx + 1} className="md-input-container">
                <input 
                  id={f.key}
                  className="md-input" 
                  type={f.type} 
                  placeholder=" " 
                  value={form[f.key]} 
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} 
                  required 
                />
                <label htmlFor={f.key} className="md-label">{f.label}</label>
              </motion.div>
            ))}

            <motion.div variants={reveal} initial="hidden" animate="visible" custom={fields.length + 1} className="col-span-1 md:col-span-2 flex items-center justify-between bg-md-surface-low p-4 rounded-xl border border-md-surface-low">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-md-text">Precise Location (Optional)</span>
                <span className="text-xs text-md-text-sec">Attach GPS coordinates for faster routing</span>
              </div>
              <button type="button" onClick={getLocation} disabled={locationLoading} className="md-btn-secondary py-1.5 px-4 text-xs disabled:opacity-50 flex items-center gap-2">
                {locationLoading ? <Spinner className="w-3 h-3" /> : null}
                {locationLoading ? 'Fetching...' : form.latitude ? 'Location Detected ✅' : 'Auto GPS'}
              </button>
            </motion.div>

            <div className="col-span-1 md:col-span-2 pt-4">
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#FFD9DF] text-[#3F0018] p-3 rounded-lg text-sm font-medium mb-4">
                  {error}
                </motion.div>
              )}
              <button type="submit" disabled={loading} className="md-btn-primary w-full flex justify-center items-center h-12">
                {loading ? <Spinner className="border-white/20 border-t-white" /> : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-md-text-sec">
              Already have an account?{' '}
              <Link to="/login" className="text-md-primary font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default RegisterPage
