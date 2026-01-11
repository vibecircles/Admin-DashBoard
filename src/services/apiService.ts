/**
 * Admin Dashboard API Service
 * 
 * This service provides a comprehensive interface for all admin API endpoints.
 * All methods return promises that resolve to ApiResponse<T>.
 */

// Types
export interface ApiResponse<T> {
  data: T | null
  success: boolean
  message?: string
  error?: string
  pagination?: Pagination
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// User Management Types
export interface User {
  id: string
  username: string
  displayName: string
  email: string
  avatar?: string
  verified: boolean
  followers: number
  following: number
  bio?: string
  stats?: {
    posts: number
    followers: number
    following: number
    likes: number
    reposts: number
  }
  accountStatus?: 'active' | 'banned' | 'suspended'
  role?: string
  createdAt?: string
  lastActive?: string
}

export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  role?: string
  status?: 'active' | 'banned' | 'suspended'
}

// Post Management Types
export interface Post {
  id: string
  content: string
  author: string
  userId: string
  createdAt: string
  status?: 'active' | 'reported' | 'hidden' | 'deleted'
  likes?: number
  comments?: number
  reposts?: number
}

export interface PostFilters {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'reported' | 'hidden' | 'deleted'
  userId?: string
}

// Comment Management Types
export interface Comment {
  id: string
  content: string
  postId: string
  userId: string
  createdAt: string
}

export interface CommentFilters {
  page?: number
  limit?: number
  postId?: string | number
  userId?: string
}

// Community Management Types
export interface Community {
  id: string
  name: string
  handle: string
  description?: string
  status?: 'active' | 'suspended' | 'deleted'
  members?: number
  createdAt?: string
}

export interface CommunityFilters {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'suspended' | 'deleted'
}

// Report Management Types
export interface Report {
  id: string
  type: 'post' | 'user' | 'comment' | 'community'
  targetId: string
  reason: string
  reportedBy: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
  resolvedAt?: string | null
  resolvedBy?: string | null
}

export interface ReportFilters {
  page?: number
  limit?: number
  status?: 'pending' | 'resolved' | 'dismissed'
  type?: 'post' | 'user' | 'comment' | 'community'
}

// Statistics Types
export interface SystemStats {
  users: {
    total: number
    active: number
    new: number
    verified: number
  }
  content: {
    posts: number
    comments: number
    communities: number
    events: number
  }
  engagement: {
    totalLikes: number
    totalReposts: number
    totalComments: number
  }
  moderation: {
    pendingReports: number
    resolvedReports: number
    bannedUsers: number
    deletedPosts: number
  }
  timeRange?: string
}

// Activity Log Types
export interface ActivityLog {
  id: string
  type: string
  userId: string
  targetId: string
  action: string
  details?: Record<string, any>
  timestamp: string
}

export interface ActivityLogFilters {
  page?: number
  limit?: number
  type?: string
  userId?: string
}

// Settings Types
export interface SystemSettings {
  maintenance: {
    enabled: boolean
    message: string
  }
  registration: {
    enabled: boolean
    requireEmailVerification: boolean
  }
  content: {
    maxPostLength: number
    maxImageSize: number
    maxVideoSize: number
    allowedFileTypes: string[]
  }
  moderation: {
    autoModerationEnabled: boolean
    requireApprovalForNewUsers: boolean
  }
}

// Event Management Types
export interface Event {
  id: string
  title: string
  description?: string
  status?: 'upcoming' | 'live' | 'ended'
  startDate?: string
  endDate?: string
  location?: string
}

export interface EventFilters {
  page?: number
  limit?: number
  search?: string
  status?: 'upcoming' | 'live' | 'ended'
}

// Storage Service (for token management)
class StorageService {
  static getAuthToken(): string | null {
    return localStorage.getItem('admin_token')
  }

  static setAuthToken(token: string): void {
    localStorage.setItem('admin_token', token)
  }

  static removeAuthToken(): void {
    localStorage.removeItem('admin_token')
  }
}

// API Service Class
class ApiService {
  private baseURL: string

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
  }

  /**
   * Internal fetch method
   */
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = StorageService.getAuthToken()
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      })

      // Handle 401 Unauthorized
      if (response.status === 401) {
        StorageService.removeAuthToken()
        localStorage.removeItem('admin_authenticated')
        window.location.href = '/login'
        return {
          data: null,
          success: false,
          error: 'Unauthorized',
        }
      }

      const data = await response.json()

      if (!response.ok) {
        return {
          data: null,
          success: false,
          error: data.error || data.message || 'Request failed',
          message: data.message,
        }
      }

      return {
        data: data.data || data,
        success: data.success !== false,
        message: data.message,
        pagination: data.pagination,
      }
    } catch (error) {
      console.error('API Error:', error)
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // ==================== User Management ====================

  /**
   * Get all users with optional filters
   */
  async adminGetUsers(filters?: UserFilters): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.role) params.append('role', filters.role)
    if (filters?.status) params.append('status', filters.status)

    const query = params.toString()
    return this.fetch<User[]>(`/admin/users${query ? `?${query}` : ''}`)
  }

  /**
   * Get single user details
   */
  async adminGetUser(userId: string): Promise<ApiResponse<User>> {
    return this.fetch<User>(`/admin/users/${userId}`)
  }

  /**
   * Ban a user
   */
  async adminBanUser(
    userId: string,
    reason: string,
    duration?: number
  ): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/admin/users/${userId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason, duration }),
    })
  }

  /**
   * Unban a user
   */
  async adminUnbanUser(userId: string): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/admin/users/${userId}/unban`, {
      method: 'POST',
    })
  }

  /**
   * Suspend a user
   */
  async adminSuspendUser(
    userId: string,
    reason: string,
    duration: number
  ): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason, duration }),
    })
  }

  /**
   * Verify a user
   */
  async adminVerifyUser(userId: string): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/admin/users/${userId}/verify`, {
      method: 'POST',
    })
  }

  /**
   * Unverify a user
   */
  async adminUnverifyUser(userId: string): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/admin/users/${userId}/unverify`, {
      method: 'POST',
    })
  }

  /**
   * Delete a user
   */
  async adminDeleteUser(userId: string): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/admin/users/${userId}`, {
      method: 'DELETE',
    })
  }

  // ==================== Content Moderation - Posts ====================

  /**
   * Get all posts with optional filters
   */
  async adminGetPosts(filters?: PostFilters): Promise<ApiResponse<Post[]>> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.userId) params.append('userId', filters.userId)

    const query = params.toString()
    return this.fetch<Post[]>(`/admin/posts${query ? `?${query}` : ''}`)
  }

  /**
   * Get single post
   */
  async adminGetPost(postId: string): Promise<ApiResponse<Post>> {
    return this.fetch<Post>(`/admin/posts/${postId}`)
  }

  /**
   * Delete a post
   */
  async adminDeletePost(
    postId: string,
    reason: string
  ): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/admin/posts/${postId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    })
  }

  /**
   * Hide a post
   */
  async adminHidePost(
    postId: string,
    reason: string
  ): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/admin/posts/${postId}/hide`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  /**
   * Restore a post
   */
  async adminRestorePost(postId: string): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/admin/posts/${postId}/restore`, {
      method: 'POST',
    })
  }

  // ==================== Content Moderation - Comments ====================

  /**
   * Get all comments with optional filters
   */
  async adminGetComments(
    filters?: CommentFilters
  ): Promise<ApiResponse<Comment[]>> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.postId) params.append('postId', filters.postId.toString())
    if (filters?.userId) params.append('userId', filters.userId)

    const query = params.toString()
    return this.fetch<Comment[]>(`/admin/comments${query ? `?${query}` : ''}`)
  }

  /**
   * Delete a comment
   */
  async adminDeleteComment(
    commentId: string,
    reason: string
  ): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/admin/comments/${commentId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    })
  }

  // ==================== Content Moderation - Communities ====================

  /**
   * Get all communities with optional filters
   */
  async adminGetCommunities(
    filters?: CommunityFilters
  ): Promise<ApiResponse<Community[]>> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.status) params.append('status', filters.status)

    const query = params.toString()
    return this.fetch<Community[]>(
      `/admin/communities${query ? `?${query}` : ''}`
    )
  }

  /**
   * Delete a community
   */
  async adminDeleteCommunity(
    communityId: string,
    reason: string
  ): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/admin/communities/${communityId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    })
  }

  /**
   * Suspend a community
   */
  async adminSuspendCommunity(
    communityId: string,
    reason: string,
    duration: number
  ): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/admin/communities/${communityId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason, duration }),
    })
  }

  // ==================== Reports Management ====================

  /**
   * Get all reports with optional filters
   */
  async adminGetReports(
    filters?: ReportFilters
  ): Promise<ApiResponse<Report[]>> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.type) params.append('type', filters.type)

    const query = params.toString()
    return this.fetch<Report[]>(`/admin/reports${query ? `?${query}` : ''}`)
  }

  /**
   * Resolve a report
   */
  async adminResolveReport(
    reportId: string,
    action: 'delete' | 'warn' | 'dismiss',
    reason: string
  ): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/admin/reports/${reportId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    })
  }

  // ==================== Analytics & Statistics ====================

  /**
   * Get system statistics
   */
  async adminGetStats(timeRange?: string): Promise<ApiResponse<SystemStats>> {
    const params = new URLSearchParams()
    if (timeRange) params.append('timeRange', timeRange)

    const query = params.toString()
    return this.fetch<SystemStats>(`/admin/stats${query ? `?${query}` : ''}`)
  }

  /**
   * Get activity log
   */
  async adminGetActivityLog(
    filters?: ActivityLogFilters
  ): Promise<ApiResponse<ActivityLog[]>> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.type) params.append('type', filters.type)
    if (filters?.userId) params.append('userId', filters.userId)

    const query = params.toString()
    return this.fetch<ActivityLog[]>(
      `/admin/activity-log${query ? `?${query}` : ''}`
    )
  }

  // ==================== System Settings ====================

  /**
   * Get system settings
   */
  async adminGetSettings(): Promise<ApiResponse<SystemSettings>> {
    return this.fetch<SystemSettings>('/admin/settings')
  }

  /**
   * Update system settings
   */
  async adminUpdateSettings(
    settings: Partial<SystemSettings>
  ): Promise<ApiResponse<SystemSettings>> {
    return this.fetch<SystemSettings>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  // ==================== Events Management ====================

  /**
   * Get all events with optional filters
   */
  async adminGetEvents(filters?: EventFilters): Promise<ApiResponse<Event[]>> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.status) params.append('status', filters.status)

    const query = params.toString()
    return this.fetch<Event[]>(`/admin/events${query ? `?${query}` : ''}`)
  }

  /**
   * Delete an event
   */
  async adminDeleteEvent(
    eventId: string,
    reason: string
  ): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/admin/events/${eventId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    })
  }
}

// Export singleton instance
export const apiService = new ApiService()

// Export class for testing
export default ApiService
