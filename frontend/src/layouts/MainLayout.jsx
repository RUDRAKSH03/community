import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { hasAllowedRole } from '../utils/roles'

function MainLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const canAdmin = hasAllowedRole(user?.role, ['admin', 'super_admin', 'AREA_ADMIN', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN'])
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-300 rounded-full px-4 py-2 ${
      isActive ? 'bg-md-sec-container text-md-text' : 'text-md-text-sec hover:bg-md-surface-low hover:text-md-text'
    }`

  return (
    <div className="relative min-h-screen text-md-text">
      {/* ── BACKGROUND ── */}
      <div className="bg-blur-shape-1" />
      <div className="bg-blur-shape-2" />

      {/* ── NAVIGATION ── */}
      <header className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ease-material ${scrolled ? 'bg-md-bg/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-8">
          
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-md-primary flex items-center justify-center text-white font-bold text-sm">
              CC
            </div>
            <span className="text-xl font-medium tracking-tight text-md-text hidden sm:block">
              Community Connect
            </span>
          </Link>

          {/* Desktop */}
          <nav className="hidden items-center gap-2 md:flex">
            {isAuthenticated && (
              <>
                {!canAdmin && (
                  <>
                    <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
                    <NavLink to="/complaints/my" className={navClass}>Complaints</NavLink>
                  </>
                )}
                {canAdmin && (
                  <>
                    <NavLink to="/admin" className={navClass} end>Admin Panel</NavLink>
                    <NavLink to="/admin" className={navClass}>Manage Complaints</NavLink>
                  </>
                )}
              </>
            )}
            {!isAuthenticated && (
              <>
                <NavLink to="/login" className={navClass}>Login</NavLink>
                <NavLink to="/register" className={navClass}>Register</NavLink>
              </>
            )}
            
            <div className="w-px h-6 bg-md-surface-low mx-2" />

            {isAuthenticated && (
              <button type="button" onClick={logout} className="text-sm font-medium text-md-text-sec hover:text-md-text transition-colors px-4 py-2 rounded-full hover:bg-md-surface-low">
                Logout
              </button>
            )}
            {!canAdmin && isAuthenticated && (
              <Link to="/complaints/create" className="md-btn-primary ml-2">
                Report Issue
              </Link>
            )}
          </nav>

          {/* Mobile Toggle */}
          <button type="button" onClick={() => setMobileOpen((v) => !v)} className="md:hidden text-md-text p-2 bg-md-surface rounded-full">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-4 top-20 z-40 bg-md-surface rounded-3xl shadow-md-2 p-4 md:hidden border border-md-surface-low"
          >
            <div className="flex flex-col gap-2">
              {isAuthenticated && (
                <>
                  {!canAdmin && (
                    <>
                      <NavLink to="/dashboard" onClick={() => setMobileOpen(false)} className={navClass}>Dashboard</NavLink>
                      <NavLink to="/complaints/my" onClick={() => setMobileOpen(false)} className={navClass}>Complaints</NavLink>
                      <NavLink to="/complaints/create" onClick={() => setMobileOpen(false)} className={navClass}>Report Issue</NavLink>
                    </>
                  )}
                  {canAdmin && (
                    <>
                      <NavLink to="/admin" onClick={() => setMobileOpen(false)} className={navClass} end>Admin Panel</NavLink>
                      <NavLink to="/admin" onClick={() => setMobileOpen(false)} className={navClass}>Manage Complaints</NavLink>
                    </>
                  )}
                  <div className="h-px w-full bg-md-surface-low my-2" />
                  <button type="button" onClick={() => { logout(); setMobileOpen(false) }} className="text-left text-sm font-medium text-md-text-sec px-4 py-2 hover:bg-md-surface-low rounded-full">Logout</button>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <NavLink to="/login" onClick={() => setMobileOpen(false)} className={navClass}>Login</NavLink>
                  <NavLink to="/register" onClick={() => setMobileOpen(false)} className={navClass}>Register</NavLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTENT ── */}
      <main className="relative z-10 pt-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 mt-32 px-6 pb-6">
        <div className="mx-auto max-w-7xl bg-md-surface rounded-[48px] px-8 md:px-16 py-16 md:py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
              Improving Your Community
            </h2>
            <p className="text-xl text-md-text-sec max-w-2xl mx-auto italic">
              "Small actions today create better cities tomorrow."
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-md-surface-low p-6 rounded-3xl border border-md-surface-low shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">⚡</div>
              <p className="text-md-text font-medium leading-relaxed">
                Over <span className="text-md-primary font-bold">70%</span> of civic issues are resolved faster when reported early.
              </p>
            </div>
            <div className="bg-md-surface-low p-6 rounded-3xl border border-md-surface-low shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">📈</div>
              <p className="text-md-text font-medium leading-relaxed">
                Active communities see up to <span className="text-md-primary font-bold">40%</span> improvement in public services.
              </p>
            </div>
            <div className="bg-md-surface-low p-6 rounded-3xl border border-md-surface-low shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">🎯</div>
              <p className="text-md-text font-medium leading-relaxed">
                Your report helps authorities prioritize real, pressing problems.
              </p>
            </div>
            <div className="bg-md-surface-low p-6 rounded-3xl border border-md-surface-low shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">🤝</div>
              <p className="text-md-text font-medium leading-relaxed">
                Transparency and consistent feedback build stronger communities.
              </p>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-md-surface-low flex flex-wrap justify-between items-center text-sm text-md-text-sec">
            <p>Community Connect © {new Date().getFullYear()}</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-md-text transition-colors">Privacy</a>
              <a href="#" className="hover:text-md-text transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
