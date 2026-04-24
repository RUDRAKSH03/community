import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/ui/Spinner'
import { Lock } from 'lucide-react'

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.2, 0, 0, 1] },
  }),
}

function LoginPage() {
  const { login } = useAuth()
  const { success, error: toastError } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { user: loggedInUser } = await login(form.email, form.password)
      success('Welcome back')
      
      const role = String(loggedInUser?.role).toLowerCase()
      const isAdmin = ['admin', 'super_admin', 'area_admin', 'department_admin'].includes(role)
      
      if (isAdmin) {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.message)
      toastError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-12">
      <motion.div variants={reveal} initial="hidden" animate="visible" className="w-full max-w-md">
        <div className="md-card p-8 sm:p-12 shadow-md-1">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-md-sec-container rounded-full flex items-center justify-center mb-4 text-md-primary">
              <Lock size={28} />
            </div>
            <h1 className="text-3xl font-medium tracking-tight text-md-text">Welcome Back</h1>
            <p className="text-md-text-sec mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="md-input-container">
              <input 
                id="email"
                className="md-input" 
                type="email" 
                placeholder=" " 
                value={form.email} 
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} 
                required 
              />
              <label htmlFor="email" className="md-label">Email address</label>
            </div>
            
            <div className="md-input-container">
              <input 
                id="password"
                className="md-input" 
                type="password" 
                placeholder=" " 
                value={form.password} 
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} 
                required 
              />
              <label htmlFor="password" className="md-label">Password</label>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#FFD9DF] text-[#3F0018] p-3 rounded-lg text-sm font-medium">
                {error}
              </motion.div>
            )}

            <div className="pt-4">
              <button type="submit" disabled={loading} className="md-btn-primary w-full flex justify-center items-center h-12">
                {loading ? <Spinner className="border-white/20 border-t-white" /> : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-md-text-sec">
              Don't have an account?{' '}
              <Link to="/register" className="text-md-primary font-medium hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage
