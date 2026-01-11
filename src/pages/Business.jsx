import { useState } from 'react'
import { Search, Filter, MoreVertical, Edit, Trash2, Ban, Building2, UserPlus } from 'lucide-react'

function Business() {
  const [businesses, setBusinesses] = useState([])

  const [searchTerm, setSearchTerm] = useState('')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState(null)

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAssignBusiness = (business) => {
    setSelectedBusiness(business)
    setShowAssignModal(true)
  }

  const confirmAssignBusiness = () => {
    setBusinesses(businesses.map(b => 
      b.id === selectedBusiness.id ? { ...b, owner: 'admin' } : b
    ))
    setShowAssignModal(false)
    setSelectedBusiness(null)
  }

  const handleUnassignBusiness = (businessId) => {
    setBusinesses(businesses.map(b => 
      b.id === businessId ? { ...b, owner: null } : b
    ))
  }

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business</h1>
          <p className="text-gray-600 mt-2">Manage and assign businesses to your profile</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Add Business
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search businesses..."
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner/Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBusinesses.map((business) => (
                <tr key={business.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <Building2 className="text-primary-600" size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{business.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{business.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{business.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {business.owner ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-xs">{business.owner[0].toUpperCase()}</span>
                        </div>
                        <span className="text-sm text-gray-900">{business.owner}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      business.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : business.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {business.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {business.registered}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {business.employees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {!business.owner ? (
                        <button 
                          onClick={() => handleAssignBusiness(business)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Assign to profile"
                        >
                          <UserPlus size={18} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUnassignBusiness(business.id)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Unassign from profile"
                        >
                          <UserPlus size={18} />
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit size={18} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Ban size={18} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Business Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Assign Business</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to assign <strong>{selectedBusiness?.name}</strong> to your admin profile?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedBusiness(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAssignBusiness}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Assign to Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Business

