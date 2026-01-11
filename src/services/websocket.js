import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000'

let socket = null

export const connectSocket = (token) => {
  if (socket?.connected) {
    return socket
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  })

  socket.on('connect', () => {
    console.log('WebSocket connected')
  })

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected')
  })

  socket.on('error', (error) => {
    console.error('WebSocket error:', error)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => socket

export const isConnected = () => socket?.connected || false

// Subscribe to user events
export const subscribeToUsers = (callbacks) => {
  if (!socket) return

  const { onNew, onUpdated, onDeleted } = callbacks

  if (onNew) {
    socket.on('user:new', onNew)
  }
  if (onUpdated) {
    socket.on('user:updated', onUpdated)
  }
  if (onDeleted) {
    socket.on('user:deleted', onDeleted)
  }
}

export const unsubscribeFromUsers = (callbacks) => {
  if (!socket) return

  const { onNew, onUpdated, onDeleted } = callbacks

  if (onNew) {
    socket.off('user:new', onNew)
  }
  if (onUpdated) {
    socket.off('user:updated', onUpdated)
  }
  if (onDeleted) {
    socket.off('user:deleted', onDeleted)
  }
}

// Subscribe to post events
export const subscribeToPosts = (callbacks) => {
  if (!socket) return

  const { onNew, onUpdated, onDeleted } = callbacks

  if (onNew) {
    socket.on('post:new', onNew)
  }
  if (onUpdated) {
    socket.on('post:updated', onUpdated)
  }
  if (onDeleted) {
    socket.on('post:deleted', onDeleted)
  }
}

export const unsubscribeFromPosts = (callbacks) => {
  if (!socket) return

  const { onNew, onUpdated, onDeleted } = callbacks

  if (onNew) {
    socket.off('post:new', onNew)
  }
  if (onUpdated) {
    socket.off('post:updated', onUpdated)
  }
  if (onDeleted) {
    socket.off('post:deleted', onDeleted)
  }
}

// Subscribe to community events
export const subscribeToCommunities = (callbacks) => {
  if (!socket) return

  const { onNew, onUpdated, onDeleted } = callbacks

  if (onNew) {
    socket.on('community:new', onNew)
  }
  if (onUpdated) {
    socket.on('community:updated', onUpdated)
  }
  if (onDeleted) {
    socket.on('community:deleted', onDeleted)
  }
}

export const unsubscribeFromCommunities = (callbacks) => {
  if (!socket) return

  const { onNew, onUpdated, onDeleted } = callbacks

  if (onNew) {
    socket.off('community:new', onNew)
  }
  if (onUpdated) {
    socket.off('community:updated', onUpdated)
  }
  if (onDeleted) {
    socket.off('community:deleted', onDeleted)
  }
}

// Subscribe to stats updates
export const subscribeToStats = (callback) => {
  if (!socket) return

  socket.on('stats:updated', callback)
}

export const unsubscribeFromStats = (callback) => {
  if (!socket) return

  socket.off('stats:updated', callback)
}

// Subscribe to analytics updates
export const subscribeToAnalytics = (callback) => {
  if (!socket) return

  socket.on('analytics:updated', callback)
}

export const unsubscribeFromAnalytics = (callback) => {
  if (!socket) return

  socket.off('analytics:updated', callback)
}

// Subscribe to event updates
export const subscribeToEvents = (callbacks) => {
  if (!socket) return

  const { onNew, onUpdated, onDeleted } = callbacks

  if (onNew) {
    socket.on('event:new', onNew)
  }
  if (onUpdated) {
    socket.on('event:updated', onUpdated)
  }
  if (onDeleted) {
    socket.on('event:deleted', onDeleted)
  }
}

export const unsubscribeFromEvents = (callbacks) => {
  if (!socket) return

  const { onNew, onUpdated, onDeleted } = callbacks

  if (onNew) {
    socket.off('event:new', onNew)
  }
  if (onUpdated) {
    socket.off('event:updated', onUpdated)
  }
  if (onDeleted) {
    socket.off('event:deleted', onDeleted)
  }
}

// Subscribe to report updates
export const subscribeToReports = (callbacks) => {
  if (!socket) return

  const { onNew, onResolved, onDeleted } = callbacks

  if (onNew) {
    socket.on('report:new', onNew)
  }
  if (onResolved) {
    socket.on('report:resolved', onResolved)
  }
  if (onDeleted) {
    socket.on('report:deleted', onDeleted)
  }
}

export const unsubscribeFromReports = (callbacks) => {
  if (!socket) return

  const { onNew, onResolved, onDeleted } = callbacks

  if (onNew) {
    socket.off('report:new', onNew)
  }
  if (onResolved) {
    socket.off('report:resolved', onResolved)
  }
  if (onDeleted) {
    socket.off('report:deleted', onDeleted)
  }
}
