import { useState } from 'react'
import { Search, Filter, Eye, Trash2, Plus, Edit, DollarSign, Calendar, Target, TrendingUp } from 'lucide-react'

function Advertising() {
  const [advertisements, setAdvertisements] = useState([])

  const [searchTerm, setSearchTerm] = useState('')

  const filteredAds = advertisements.filter(ad =>
    ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.advertiser.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = (id) => {
    setAdvertisements(advertisements.filter(ad => ad.id !== id))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'banner':
        return 'bg-purple-100 text-purple-800'
      case 'video':
        return 'bg-pink-100 text-pink-800'
      case 'sponsored':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalBudget = advertisements.reduce((sum, ad) => sum + ad.budget, 0)
  const totalSpent = advertisements.reduce((sum, ad) => sum + ad.spent, 0)
  const totalImpressions = advertisements.reduce((sum, ad) => sum + ad.impressions, 0)
  const totalClicks = advertisements.reduce((sum, ad) => sum + ad.clicks, 0)
  const activeAds = advertisements.filter(ad => ad.status === 'active').length

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advertising</h1>
          <p className="text-gray-600 mt-2">Manage advertising campaigns and sponsorships</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          <Plus size={20} />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
            </div>
            <DollarSign className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{activeAds}</p>
            </div>
            <Target className="text-purple-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Impressions</p>
              <p className="text-2xl font-bold text-gray-900">{totalImpressions.toLocaleString()}</p>
            </div>
            <Eye className="text-indigo-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
            </div>
            <Target className="text-pink-500" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search campaigns..."
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
          {filteredAds.map((ad) => (
            <div key={ad.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-lg">{ad.title}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ad.status)}`}>
                      {ad.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(ad.type)}`}>
                      {ad.type}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">Advertiser: <span className="font-medium">{ad.advertiser}</span></p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="text-sm font-semibold text-gray-900">${ad.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Spent</p>
                      <p className="text-sm font-semibold text-gray-900">${ad.spent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Impressions</p>
                      <p className="text-sm font-semibold text-gray-900">{ad.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Clicks</p>
                      <p className="text-sm font-semibold text-gray-900">{ad.clicks.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {ad.startDate} - {ad.endDate}
                    </span>
                    {ad.clicks > 0 && (
                      <span className="text-gray-600">
                        CTR: {((ad.clicks / ad.impressions) * 100).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye size={18} />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(ad.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Advertising

