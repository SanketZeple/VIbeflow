import { createContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const validateToken = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsAuthenticated(false)
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setIsAuthenticated(true)
      setUser(response.data)
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('token')
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    validateToken()
  }, [validateToken])

  const login = async (token, userData) => {
    localStorage.setItem('token', token)
    setIsAuthenticated(true)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUser(null)
    // Redirect to login page after logout
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, validateToken }}>
      {children}
    </AuthContext.Provider>
  )
}
