import { useState, useEffect } from 'react'
import { Search, Filter, Calendar, Edit, Trash2, MapPin, Users, Loader2 } from 'lucide-react'
import { eventsAPI } from '../services/api'
import { subscribeToEvents, unsubscribeFromEvents } from '../services/websocket'
import toast from 'react-hot-toast'

function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await eventsAPI.getAll()
        if (response.data && Array.isArray(response.data)) {
          setEvents(response.data)
        } else if (response.data?.events && Array.isArray(response.data.events)) {
          setEvents(response.data.events)
        }
      } catch (error) {
        console.error('Error fetching events:', error)
        if (error.response) {
          toast.error('Failed to load events')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()

    const handleEventUpdate = {
      onNew: (newEvent) => {
        setEvents((prev) => [newEvent, ...prev])
        toast.success(`New event: ${newEvent.title}`)
      },
      onUpdated: (updatedEvent) => {
        setEvents((prev) =>
          prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
        )
      },
      onDeleted: (data) => {
        const eventId = data.eventId || data.id
        setEvents((prev) => prev.filter((e) => e.id !== eventId))
        toast.success('Event deleted')
      },
    }

    subscribeToEvents(handleEventUpdate)

    return () => {
      unsubscribeFromEvents(handleEventUpdate)
    }
  }, [])

  const filteredEvents = events.filter(
    (event) =>
      (event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      event
  )

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-2">Manage all platform events</p>
        </div>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Create Event
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search events..."
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
              <p className="text-gray-500">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No events found</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
            <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>{event.location || event.address || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>
                          {event.date || (event.startDate ? new Date(event.startDate).toLocaleDateString() : 'N/A')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{(event.attendees || event.attendeeCount || 0)} attendees</span>
                      </div>
                    </div>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      (event.status === 'upcoming' || event.status === 'active')
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status || 'upcoming'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await eventsAPI.delete(event.id)
                        setEvents(events.filter((e) => e.id !== event.id))
                        toast.success('Event deleted')
                      } catch (error) {
                        console.error('Error deleting event:', error)
                        toast.error('Failed to delete event')
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

export default Events

