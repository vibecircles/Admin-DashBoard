import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

