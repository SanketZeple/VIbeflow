import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import useAuth from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TimeReportPage from './pages/TimeReportPage'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-bg">
        <div className="text-text-secondary">Loading application...</div>
      </div>
    )
  }

  return (
    <Router>
      <div className="h-screen bg-page-bg text-text-primary flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex w-full flex-1 overflow-hidden">
          {isAuthenticated && <Sidebar />}
          <div className="flex-1 min-w-0 overflow-auto">
            <Routes>
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
              } />
              <Route path="/register" element={
                isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
              <Route path="/reports/time" element={
                <ProtectedRoute>
                  <TimeReportPage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App