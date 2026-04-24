import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CreateComplaintPage from './pages/CreateComplaintPage'
import MyComplaintsPage from './pages/MyComplaintsPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints/create"
          element={
            <ProtectedRoute>
              <CreateComplaintPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints/my"
          element={
            <ProtectedRoute>
              <MyComplaintsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'AREA_ADMIN', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
