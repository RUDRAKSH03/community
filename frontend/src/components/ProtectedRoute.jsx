import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { hasAllowedRole } from '../utils/roles'

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (!hasAllowedRole(user?.role, allowedRoles)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute

