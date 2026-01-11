import { useState, useEffect } from 'react'
import { Search, Filter, MapPin, Edit, Trash2, Users, Calendar, Loader2 } from 'lucide-react'
import { locationsAPI } from '../services/api'
import toast from 'react-hot-toast'

function Locations() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true)
        const response = await locationsAPI.getAll()
        if (response.data && Array.isArray(response.data)) {
          setLocations(response.data)
        } else if (response.data?.locations && Array.isArray(response.data.locations)) {
          setLocations(response.data.locations)
        }
      } catch (error) {
        console.error('Error fetching locations:', error)
        if (error.response) {
          toast.error('Failed to load locations')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  const filteredLocations = locations.filter(
    (location) =>
      (location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.address?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      location
  )

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-600 mt-2">Manage all platform locations</p>
        </div>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Add Location
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search locations..."
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
              <p className="text-gray-500">Loading locations...</p>
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No locations found</p>
            </div>
          ) : (
            filteredLocations.map((location) => (
            <div key={location.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <MapPin className="text-red-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{location.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {location.address || location.street || ''}, {location.city || ''} {location.state || ''} {location.zipCode || ''}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{(location.followers || location.followerCount || 0).toLocaleString()} followers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{location.events || location.eventCount || 0} events</span>
                      </div>
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
                        await locationsAPI.delete(location.id)
                        setLocations(locations.filter((l) => l.id !== location.id))
                        toast.success('Location deleted')
                      } catch (error) {
                        console.error('Error deleting location:', error)
                        toast.error('Failed to delete location')
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

export default Locations

