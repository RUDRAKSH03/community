import React, { createContext, useContext, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const nextToken = response.data.token
    const nextUser = response.data.user

    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem('token', nextToken)
    localStorage.setItem('user', JSON.stringify(nextUser))
    
    return { user: nextUser }
  }

 const register = async (payload) => {
  const response = await api.post('/auth/register', {
    name: payload.name,
    email: payload.email,
    password: payload.password
  })

  const nextToken = response.data.token
  const nextUser = response.data.user

  setToken(nextToken)
  setUser(nextUser)
  localStorage.setItem('token', nextToken)
  localStorage.setItem('user', JSON.stringify(nextUser))
}

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, user],
  )

  return React.createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

