import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, ReactNode } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Verification from './pages/Verification'
import Business from './pages/Business'
import Posts from './pages/Posts'
import Communities from './pages/Communities'
import Events from './pages/Events'
import Locations from './pages/Locations'
import Analytics from './pages/Analytics'
import Advertising from './pages/Advertising'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'
import { connectSocket, disconnectSocket, isConnected } from './services/websocket'

interface ProtectedRouteProps {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_authenticated') === 'true' && localStorage.getItem('admin_token')
  })

  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated') === 'true' && localStorage.getItem('admin_token')
    setIsAuthenticated(authStatus)

    // Initialize WebSocket connection if authenticated
    if (authStatus) {
      const token = localStorage.getItem('admin_token')
      if (token && !isConnected()) {
        connectSocket(token)
      }
    }
  }, [])

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />
  }

  return <>{children}</>
}

function App() {
  useEffect(() => {
    // Cleanup WebSocket on app unmount
    return () => {
      disconnectSocket()
    }
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={() => window.location.reload()} />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/verification" element={<Verification />} />
                <Route path="/business" element={<Business />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/communities" element={<Communities />} />
                <Route path="/events" element={<Events />} />
                <Route path="/locations" element={<Locations />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/advertising" element={<Advertising />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App