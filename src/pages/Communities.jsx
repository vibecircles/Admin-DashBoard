import { useState, useEffect } from 'react'
import { Search, Filter, Users, Edit, Trash2, Lock, Globe, Loader2 } from 'lucide-react'
import { communitiesAPI } from '../services/api'
import { subscribeToCommunities, unsubscribeFromCommunities } from '../services/websocket'
import toast from 'react-hot-toast'

function Communities() {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true)
        const response = await communitiesAPI.getAll()
        if (response.data && Array.isArray(response.data)) {
          setCommunities(response.data)
        } else if (response.data?.communities && Array.isArray(response.data.communities)) {
          setCommunities(response.data.communities)
        }
      } catch (error) {
        console.error('Error fetching communities:', error)
        if (error.response) {
          toast.error('Failed to load communities')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCommunities()

    const handleCommunityUpdate = {
      onNew: (newCommunity) => {
        setCommunities((prev) => [newCommunity, ...prev])
        toast.success(`New community: ${newCommunity.name}`)
      },
      onUpdated: (updatedCommunity) => {
        setCommunities((prev) =>
          prev.map((c) => (c.id === updatedCommunity.id ? updatedCommunity : c))
        )
      },
      onDeleted: (data) => {
        const communityId = data.communityId || data.id
        setCommunities((prev) => prev.filter((c) => c.id !== communityId))
        toast.success('Community deleted')
      },
    }

    subscribeToCommunities(handleCommunityUpdate)

    return () => {
      unsubscribeFromCommunities(handleCommunityUpdate)
    }
  }, [])

  const filteredCommunities = communities.filter(
    (community) =>
      (community.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.handle?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      community
  )

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
          <p className="text-gray-600 mt-2">Manage all communities</p>
        </div>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Create Community
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search communities..."
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

        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin mx-auto mb-2 text-gray-400" size={32} />
              <p className="text-gray-500">Loading communities...</p>
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No communities found</p>
            </div>
          ) : (
            filteredCommunities.map((community) => (
            <div key={community.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{community.name}</h3>
                    <p className="text-sm text-gray-500">{community.handle}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-600">
                        {(community.members || community.memberCount || 0).toLocaleString()} members
                      </span>
                      <div className="flex items-center gap-1">
                        {(community.type === 'private' || community.isPrivate) ? (
                          <Lock className="text-gray-400" size={14} />
                        ) : (
                          <Globe className="text-gray-400" size={14} />
                        )}
                        <span className="text-xs text-gray-500">
                          {community.type || (community.isPrivate ? 'private' : 'public')}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Created {community.created || (community.createdAt ? new Date(community.createdAt).toLocaleDateString() : 'N/A')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await communitiesAPI.delete(community.id)
                        setCommunities(communities.filter((c) => c.id !== community.id))
                        toast.success('Community deleted')
                      } catch (error) {
                        console.error('Error deleting community:', error)
                        toast.error('Failed to delete community')
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Communities

