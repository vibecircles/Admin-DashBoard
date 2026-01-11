import { useState, FormEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { connectSocket } from '../services/websocket'

interface LoginProps {
  onLogin?: () => void
}

function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Try API authentication first
      const response = await authAPI.login(username, password)
      
      if (response.data && response.data.token) {
        // API authentication successful
        localStorage.setItem('admin_token', response.data.token)
        localStorage.setItem('admin_authenticated', 'true')
        
        // Connect WebSocket with token
        connectSocket(response.data.token)
        
        toast.success('Login successful!')
        if (onLogin) {
          onLogin()
        } else {
          navigate('/dashboard')
        }
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Fallback to demo authentication if API is not available
      if (!error.response || error.response.status === 0) {
        // Network error or no backend - use demo credentials
        if (username === 'admin' && password === 'admin123') {
          localStorage.setItem('admin_authenticated', 'true')
          // Store a demo token for consistency
          localStorage.setItem('admin_token', 'demo_token_' + Date.now())
          toast.success('Login successful! (Demo Mode)')
          if (onLogin) {
            onLogin()
          } else {
            navigate('/dashboard')
          }
        } else {
          toast.error('Invalid credentials. Use admin/admin123 for demo mode')
        }
      } else {
        // API returned an error
        const errorMessage = error.response?.data?.message || 'Invalid credentials'
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <LogIn className="text-primary-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Sign in to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Demo Credentials (if API unavailable):<br />
            Username: <strong>admin</strong><br />
            Password: <strong>admin123</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login