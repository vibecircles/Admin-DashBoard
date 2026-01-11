import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_authenticated')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API methods
export const authAPI = {
  login: (username, password) => api.post('/admin/login', { username, password }),
  logout: () => api.post('/admin/logout'),
}

export const dashboardAPI = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getRecentActivity: () => api.get('/admin/dashboard/activity'),
}

export const usersAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  update: (id, data) => api.patch(`/admin/users/${id}`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
  ban: (id) => api.patch(`/admin/users/${id}/ban`),
  unban: (id) => api.patch(`/admin/users/${id}/unban`),
}

export const postsAPI = {
  getAll: (params) => api.get('/admin/posts', { params }),
  getById: (id) => api.get(`/admin/posts/${id}`),
  update: (id, data) => api.patch(`/admin/posts/${id}`, data),
  delete: (id) => api.delete(`/admin/posts/${id}`),
  approve: (id) => api.patch(`/admin/posts/${id}/approve`),
  flag: (id) => api.patch(`/admin/posts/${id}/flag`),
}

export const communitiesAPI = {
  getAll: (params) => api.get('/admin/communities', { params }),
  getById: (id) => api.get(`/admin/communities/${id}`),
  update: (id, data) => api.patch(`/admin/communities/${id}`, data),
  delete: (id) => api.delete(`/admin/communities/${id}`),
  create: (data) => api.post('/admin/communities', data),
}

export const eventsAPI = {
  getAll: (params) => api.get('/admin/events', { params }),
  getById: (id) => api.get(`/admin/events/${id}`),
  update: (id, data) => api.patch(`/admin/events/${id}`, data),
  delete: (id) => api.delete(`/admin/events/${id}`),
  create: (data) => api.post('/admin/events', data),
}

export const locationsAPI = {
  getAll: (params) => api.get('/admin/locations', { params }),
  getById: (id) => api.get(`/admin/locations/${id}`),
  update: (id, data) => api.patch(`/admin/locations/${id}`, data),
  delete: (id) => api.delete(`/admin/locations/${id}`),
}

export const analyticsAPI = {
  getStats: (timeRange) => api.get('/admin/analytics/stats', { params: { range: timeRange } }),
  getUserGrowth: (timeRange) => api.get('/admin/analytics/user-growth', { params: { range: timeRange } }),
  getPostEngagement: (timeRange) => api.get('/admin/analytics/post-engagement', { params: { range: timeRange } }),
  getTopCommunities: (timeRange) => api.get('/admin/analytics/top-communities', { params: { range: timeRange } }),
  getRecentActivity: (timeRange) => api.get('/admin/analytics/recent-activity', { params: { range: timeRange } }),
}

export const advertisingAPI = {
  getAll: (params) => api.get('/admin/advertising', { params }),
  getById: (id) => api.get(`/admin/advertising/${id}`),
  update: (id, data) => api.patch(`/admin/advertising/${id}`, data),
  delete: (id) => api.delete(`/admin/advertising/${id}`),
  create: (data) => api.post('/admin/advertising', data),
}

export const reportsAPI = {
  getAll: (params) => api.get('/admin/reports', { params }),
  getById: (id) => api.get(`/admin/reports/${id}`),
  resolve: (id) => api.patch(`/admin/reports/${id}/resolve`),
  delete: (id) => api.delete(`/admin/reports/${id}`),
}

export const verificationAPI = {
  getAll: (params) => api.get('/admin/verification', { params }),
  approve: (id) => api.patch(`/admin/verification/${id}/approve`),
  reject: (id) => api.patch(`/admin/verification/${id}/reject`),
}

export const businessAPI = {
  getAll: (params) => api.get('/admin/business', { params }),
  getById: (id) => api.get(`/admin/business/${id}`),
  update: (id, data) => api.patch(`/admin/business/${id}`, data),
  verify: (id) => api.patch(`/admin/business/${id}/verify`),
}

export default api
