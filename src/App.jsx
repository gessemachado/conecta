import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

import Login from './pages/Login'
import Home from './pages/Home'
import Trilhas from './pages/Trilhas'
import TrailDetail from './pages/TrailDetail'
import VideoPlayer from './pages/VideoPlayer'
import Evaluation from './pages/Evaluation'
import Certificate from './pages/Certificate'

import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminTrails from './pages/admin/Trails'
import CreateTrail from './pages/admin/CreateTrail'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Colaborador */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/trilhas" element={<ProtectedRoute><Trilhas /></ProtectedRoute>} />
      <Route path="/trilha/:id" element={<ProtectedRoute><TrailDetail /></ProtectedRoute>} />
      <Route path="/video/:id" element={<ProtectedRoute><VideoPlayer /></ProtectedRoute>} />
      <Route path="/avaliacao/:id" element={<ProtectedRoute><Evaluation /></ProtectedRoute>} />
      <Route path="/certificado/:id" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/usuarios" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/trilhas" element={<AdminRoute><AdminTrails /></AdminRoute>} />
      <Route path="/admin/trilhas/criar" element={<AdminRoute><CreateTrail /></AdminRoute>} />
      <Route path="/admin/trilhas/editar/:id" element={<AdminRoute><CreateTrail /></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
