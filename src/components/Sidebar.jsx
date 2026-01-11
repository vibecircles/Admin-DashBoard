import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Building2,
  FileText, 
  UsersRound, 
  Calendar, 
  MapPin, 
  BarChart3, 
  Megaphone,
  AlertTriangle,
  Shield,
  Settings,
  X,
  LogOut
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated')
    toast.success('Logged out successfully')
    navigate('/login')
    window.location.reload()
  }

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/verification', icon: Shield, label: 'Verification' },
    { path: '/business', icon: Building2, label: 'Business' },
    { path: '/posts', icon: FileText, label: 'Posts' },
    { path: '/communities', icon: UsersRound, label: 'Communities' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/locations', icon: MapPin, label: 'Locations' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/advertising', icon: Megaphone, label: 'Advertising' },
    { path: '/reports', icon: AlertTriangle, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

