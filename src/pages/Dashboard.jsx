import { useState, useEffect } from 'react'
import { Users, FileText, UsersRound, Calendar, MapPin, TrendingUp, Eye, Heart, Loader2 } from 'lucide-react'
import { dashboardAPI } from '../services/api'
import { subscribeToStats, unsubscribeFromStats } from '../services/websocket'
import toast from 'react-hot-toast'

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalCommunities: 0,
    totalEvents: 0,
    totalLocations: 0,
    totalViews: 0,
    totalLikes: 0,
    growthRate: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(true)

  useEffect(() => {
    // Fetch initial stats
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await dashboardAPI.getStats()
        if (response.data) {
          setStats({
            totalUsers: response.data.totalUsers || 0,
            totalPosts: response.data.totalPosts || 0,
            totalCommunities: response.data.totalCommunities || 0,
            totalEvents: response.data.totalEvents || 0,
            totalLocations: response.data.totalLocations || 0,
            totalViews: response.data.totalViews || 0,
            totalLikes: response.data.totalLikes || 0,
            growthRate: response.data.growthRate || 0,
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Don't show error toast if it's a network error (backend might not be running)
        if (error.response) {
          toast.error('Failed to load dashboard statistics')
        }
      } finally {
        setLoading(false)
      }
    }

    // Fetch recent activity
    const fetchRecentActivity = async () => {
      try {
        setActivityLoading(true)
        const response = await dashboardAPI.getRecentActivity()
        if (response.data && Array.isArray(response.data)) {
          setRecentActivity(response.data)
        }
      } catch (error) {
        console.error('Error fetching recent activity:', error)
        if (error.response) {
          toast.error('Failed to load recent activity')
        }
      } finally {
        setActivityLoading(false)
      }
    }

    fetchStats()
    fetchRecentActivity()

    // Subscribe to real-time stats updates
    const handleStatsUpdate = (newStats) => {
      setStats({
        totalUsers: newStats.totalUsers || stats.totalUsers,
        totalPosts: newStats.totalPosts || stats.totalPosts,
        totalCommunities: newStats.totalCommunities || stats.totalCommunities,
        totalEvents: newStats.totalEvents || stats.totalEvents,
        totalLocations: newStats.totalLocations || stats.totalLocations,
        totalViews: newStats.totalViews || stats.totalViews,
        totalLikes: newStats.totalLikes || stats.totalLikes,
        growthRate: newStats.growthRate || stats.growthRate,
      })
    }

    subscribeToStats(handleStatsUpdate)

    // Cleanup
    return () => {
      unsubscribeFromStats(handleStatsUpdate)
    }
  }, [])

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers.toLocaleString(), color: 'bg-blue-500' },
    { icon: FileText, label: 'Total Posts', value: stats.totalPosts.toLocaleString(), color: 'bg-green-500' },
    { icon: UsersRound, label: 'Communities', value: stats.totalCommunities.toLocaleString(), color: 'bg-purple-500' },
    { icon: Calendar, label: 'Events', value: stats.totalEvents.toLocaleString(), color: 'bg-orange-500' },
    { icon: MapPin, label: 'Locations', value: stats.totalLocations.toLocaleString(), color: 'bg-red-500' },
    { icon: Eye, label: 'Total Views', value: stats.totalViews.toLocaleString(), color: 'bg-indigo-500' },
    { icon: Heart, label: 'Total Likes', value: stats.totalLikes.toLocaleString(), color: 'bg-pink-500' },
    { icon: TrendingUp, label: 'Growth Rate', value: `${stats.growthRate?.toFixed(1) || 0}%`, color: 'bg-teal-500' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin text-gray-400" size={20} />
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {activityLoading ? (
              <div className="text-center text-gray-400 py-8">
                <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                <p className="text-sm">Loading activity...</p>
              </div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 text-xs font-semibold">
                        {activity.type?.[0]?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message || activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors">
              Manage Users
            </button>
            <button className="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              Review Posts
            </button>
            <button className="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              Moderate Communities
            </button>
            <button className="w-full text-left px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

