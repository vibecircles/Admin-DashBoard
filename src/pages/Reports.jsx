import { useState, useEffect } from 'react'
import { Search, Filter, Eye, Check, X, AlertTriangle, User, FileText, UsersRound, Trash2, Ban, MessageSquare, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { reportsAPI } from '../services/api'
import { subscribeToReports, unsubscribeFromReports } from '../services/websocket'

function Reports() {
  const [activeTab, setActiveTab] = useState('posts')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  const [reportedPosts, setReportedPosts] = useState([])
  const [reportedCommunities, setReportedCommunities] = useState([])
  const [reportedUsers, setReportedUsers] = useState([])

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const response = await reportsAPI.getAll()
        if (response.data) {
          const reports = Array.isArray(response.data) ? response.data : response.data.reports || []
          // Categorize reports by type
          setReportedPosts(reports.filter(r => r.type === 'post' || r.type === 'posts'))
          setReportedCommunities(reports.filter(r => r.type === 'community' || r.type === 'communities'))
          setReportedUsers(reports.filter(r => r.type === 'user' || r.type === 'users'))
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
        if (error.response) {
          toast.error('Failed to load reports')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchReports()

    const handleReportUpdate = {
      onNew: (newReport) => {
        if (newReport.type === 'post' || newReport.type === 'posts') {
          setReportedPosts((prev) => [newReport, ...prev])
        } else if (newReport.type === 'community' || newReport.type === 'communities') {
          setReportedCommunities((prev) => [newReport, ...prev])
        } else if (newReport.type === 'user' || newReport.type === 'users') {
          setReportedUsers((prev) => [newReport, ...prev])
        }
        toast.success('New report received')
      },
      onResolved: (resolvedReport) => {
        const updateReport = (prev) =>
          prev.map((r) => (r.id === resolvedReport.id ? { ...r, status: 'reviewed' } : r))
        if (resolvedReport.type === 'post' || resolvedReport.type === 'posts') {
          setReportedPosts(updateReport)
        } else if (resolvedReport.type === 'community' || resolvedReport.type === 'communities') {
          setReportedCommunities(updateReport)
        } else if (resolvedReport.type === 'user' || resolvedReport.type === 'users') {
          setReportedUsers(updateReport)
        }
      },
      onDeleted: (data) => {
        const reportId = data.reportId || data.id
        const updateList = (prev) => prev.filter((r) => r.id !== reportId)
        if (data.type === 'post' || data.type === 'posts') {
          setReportedPosts(updateList)
        } else if (data.type === 'community' || data.type === 'communities') {
          setReportedCommunities(updateList)
        } else if (data.type === 'user' || data.type === 'users') {
          setReportedUsers(updateList)
        }
        toast.success('Report deleted')
      },
    }

    subscribeToReports(handleReportUpdate)

    return () => {
      unsubscribeFromReports(handleReportUpdate)
    }
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'reviewed':
        return 'bg-green-100 text-green-800'
      case 'dismissed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getReasonColor = (reason) => {
    switch (reason.toLowerCase()) {
      case 'harassment':
      case 'hate speech':
        return 'bg-red-100 text-red-800'
      case 'spam':
        return 'bg-orange-100 text-orange-800'
      case 'misinformation':
        return 'bg-purple-100 text-purple-800'
      case 'fraud':
        return 'bg-pink-100 text-pink-800'
      case 'inappropriate content':
        return 'bg-rose-100 text-rose-800'
      case 'impersonation':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleApproveReport = async (id, type) => {
    try {
      await reportsAPI.resolve(id)
      if (type === 'posts') {
        setReportedPosts(reportedPosts.map(post => 
          post.id === id ? { ...post, status: 'reviewed', action: 'removed' } : post
        ))
      } else if (type === 'communities') {
        setReportedCommunities(reportedCommunities.map(community => 
          community.id === id ? { ...community, status: 'reviewed', action: 'removed' } : community
        ))
      } else if (type === 'users') {
        setReportedUsers(reportedUsers.map(user => 
          user.id === id ? { ...user, status: 'reviewed', action: 'suspended' } : user
        ))
      }
      toast.success('Report approved and action taken')
    } catch (error) {
      console.error('Error resolving report:', error)
      toast.error('Failed to resolve report')
    }
  }

  const handleDismissReport = async (id, type) => {
    try {
      await reportsAPI.delete(id)
      if (type === 'posts') {
        setReportedPosts(reportedPosts.filter(post => post.id !== id))
      } else if (type === 'communities') {
        setReportedCommunities(reportedCommunities.filter(community => community.id !== id))
      } else if (type === 'users') {
        setReportedUsers(reportedUsers.filter(user => user.id !== id))
      }
      toast.success('Report dismissed')
    } catch (error) {
      console.error('Error dismissing report:', error)
      toast.error('Failed to dismiss report')
    }
  }

  const filterItems = (items, type) => {
    return items.filter(item => {
      const searchFields = type === 'posts' 
        ? [item.postContent, item.postAuthor, item.reason]
        : type === 'communities'
        ? [item.communityName, item.creator, item.reason]
        : [item.username, item.email, item.reason]
      
      return searchFields.some(field => 
        field.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }

  const pendingPostsCount = reportedPosts.filter(p => p.status === 'pending').length
  const pendingCommunitiesCount = reportedCommunities.filter(c => c.status === 'pending').length
  const pendingUsersCount = reportedUsers.filter(u => u.status === 'pending').length

  const tabs = [
    { id: 'posts', label: 'Reported Posts', icon: FileText, count: pendingPostsCount },
    { id: 'communities', label: 'Reported Communities', icon: UsersRound, count: pendingCommunitiesCount },
    { id: 'users', label: 'Reported Users', icon: User, count: pendingUsersCount },
  ]

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="text-yellow-500" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        </div>
        <p className="text-gray-600">Review and manage reported content, communities, and users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Reports</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingPostsCount + pendingCommunitiesCount + pendingUsersCount}
              </p>
            </div>
            <AlertTriangle className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportedPosts.length + reportedCommunities.length + reportedUsers.length}
              </p>
            </div>
            <MessageSquare className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reviewed Reports</p>
              <p className="text-2xl font-bold text-green-600">
                {[...reportedPosts, ...reportedCommunities, ...reportedUsers].filter(r => r.status === 'reviewed').length}
              </p>
            </div>
            <Check className="text-green-500" size={24} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={20} />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        {/* Reported Posts */}
        {activeTab === 'posts' && (
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-500">Loading reports...</p>
              </div>
            ) : filterItems(reportedPosts, 'posts').length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 text-lg">No reported posts found</p>
              </div>
            ) : (
              filterItems(reportedPosts, 'posts').map((report) => (
                <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{report.postId}</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getReasonColor(report.reason)}`}>
                          {report.reason}
                        </span>
                        <span className="text-sm text-red-600 font-semibold">{report.reports} reports</span>
                      </div>
                      <p className="text-gray-700 mb-2 italic">"{report.postContent}"</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">Post Author:</span>
                          <span className="ml-2 font-medium text-gray-900">{report.postAuthor}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Reported By:</span>
                          <span className="ml-2 font-medium text-gray-900">{report.reportedBy}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-600">Report Date:</span>
                          <span className="ml-2 font-medium text-gray-900">{report.reportDate}</span>
                        </div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700"><span className="font-semibold">Description:</span> {report.description}</p>
                      </div>
                      {report.action && (
                        <div className="mt-3 text-sm text-green-600 font-medium">
                          Action Taken: {report.action.replace('_', ' ').toUpperCase()}
                        </div>
                      )}
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex items-center gap-2 ml-4">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleApproveReport(report.id, 'posts')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Remove Post"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleDismissReport(report.id, 'posts')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Dismiss Report"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Reported Communities */}
        {activeTab === 'communities' && (
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-500">Loading reports...</p>
              </div>
            ) : filterItems(reportedCommunities, 'communities').length === 0 ? (
              <div className="p-12 text-center">
                <UsersRound className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 text-lg">No reported communities found</p>
              </div>
            ) : (
              filterItems(reportedCommunities, 'communities').map((report) => (
                <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-lg">{report.communityName}</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getReasonColor(report.reason)}`}>
                          {report.reason}
                        </span>
                        <span className="text-sm text-red-600 font-semibold">{report.reports} reports</span>
                      </div>
                      <p className="text-gray-700 mb-2 italic">"{report.communityDescription}"</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">Community ID:</span>
                          <span className="ml-2 font-medium text-gray-900">{report.communityId}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Members:</span>
                          <span className="ml-2 font-medium text-gray-900">{report.members}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Creator:</span>
                          <span className="ml-2 font-medium text-gray-900">{report.creator}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Reported By:</span>
                          <span className="ml-2 font-medium text-gray-900">{report.reportedBy}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-600">Report Date:</span>
                          <span className="ml-2 font-medium text-gray-900">{report.reportDate}</span>
                        </div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700"><span className="font-semibold">Description:</span> {report.description}</p>
                      </div>
                      {report.action && (
                        <div className="mt-3 text-sm text-green-600 font-medium">
                          Action Taken: {report.action.replace('_', ' ').toUpperCase()}
                        </div>
                      )}
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex items-center gap-2 ml-4">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleApproveReport(report.id, 'communities')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Remove Community"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleDismissReport(report.id, 'communities')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Dismiss Report"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Reported Users */}
        {activeTab === 'users' && (
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-500">Loading reports...</p>
              </div>
            ) : filterItems(reportedUsers, 'users').length === 0 ? (
              <div className="p-12 text-center">
                <User className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 text-lg">No reported users found</p>
              </div>
            ) : (
              filterItems(reportedUsers, 'users').map((report) => (
                <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-lg">@{report.username}</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getReasonColor(report.reason)}`}>
                          {report.reason}
                        </span>
                        <span className="text-sm text-red-600 font-semibold">{report.reports} reports</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">User ID:</span>
                          <span className="ml-2 font-medium text-gray-900">{report.userId}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-2 font-medium text-gray-900">{report.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Posts:</span>
                          <span className="ml-2 font-medium text-gray-900">{report.totalPosts}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Join Date:</span>
                          <span className="ml-2 font-medium text-gray-900">{report.joinDate}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Reported By:</span>
                          <span className="ml-2 font-medium text-gray-900">{report.reportedBy}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Report Date:</span>
                          <span className="ml-2 font-medium text-gray-900">{report.reportDate}</span>
                        </div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700"><span className="font-semibold">Description:</span> {report.description}</p>
                      </div>
                      {report.action && (
                        <div className="mt-3 text-sm text-green-600 font-medium">
                          Action Taken: {report.action.replace('_', ' ').toUpperCase()}
                        </div>
                      )}
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex items-center gap-2 ml-4">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View User Profile">
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleApproveReport(report.id, 'users')}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Suspend User"
                        >
                          <Ban size={18} />
                        </button>
                        <button 
                          onClick={() => handleDismissReport(report.id, 'users')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Dismiss Report"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports

