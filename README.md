# Admin Dashboard - Truth Social

A separate admin dashboard application for managing the Truth Social platform.

## Features

- **Dashboard**: Overview of platform statistics and recent activity
- **User Management**: View, edit, and manage all platform users
- **Post Management**: Moderate and manage all posts/truths
- **Community Management**: Manage communities and their settings
- **Event Management**: Create and manage platform events
- **Location Management**: Manage location data
- **Analytics**: View platform analytics and insights
- **Advertising**: Manage advertising campaigns, budgets, and performance metrics
- **Settings**: Configure admin panel settings

## Getting Started

### Installation

1. Navigate to the admin dashboard directory:
```bash
cd admin-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The admin dashboard will be available at `http://localhost:5174`

### Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## Project Structure

```
admin-dashboard/
├── src/
│   ├── components/
│   │   ├── Layout.jsx      # Main layout wrapper
│   │   ├── Sidebar.jsx     # Navigation sidebar
│   │   └── Header.jsx      # Top header bar
│   ├── pages/
│   │   ├── Login.tsx       # Login page with API auth
│   │   ├── Dashboard.jsx   # Main dashboard with real-time stats
│   │   ├── Users.jsx       # User management with real-time updates
│   │   ├── Posts.jsx       # Post management with real-time updates
│   │   ├── Communities.jsx # Community management
│   │   ├── Events.jsx      # Event management
│   │   ├── Locations.jsx   # Location management
│   │   ├── Analytics.jsx   # Analytics page with API integration
│   │   ├── Reports.jsx     # Reports management
│   │   ├── Advertising.jsx # Advertising management
│   │   └── Settings.jsx    # Settings page
│   ├── services/
│   │   ├── api.js          # API service layer with axios
│   │   └── websocket.js    # WebSocket service for real-time updates
│   ├── App.tsx             # Main app component with WebSocket init
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env                    # Environment variables (create this)
```

## Development

### Available Scripts

- `npm run dev` - Start development server (port 5174)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Port Configuration

The admin dashboard runs on port **5174** by default (different from the main app which runs on 5173) to allow both applications to run simultaneously.

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Axios** - HTTP client for API requests
- **Socket.IO Client** - Real-time WebSocket communication
- **Ant Design** - UI component library

## API Integration & Real-Time Updates

The dashboard is now fully integrated with backend APIs and supports real-time updates via WebSockets.

### Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

### API Service Layer

All API calls are managed through `src/services/api.js` with:
- Automatic authentication token injection
- Request/response interceptors
- Error handling and 401 redirects

### WebSocket Integration

Real-time updates are handled via `src/services/websocket.js`:
- Automatic connection management
- Event subscriptions for users, posts, communities, events, stats, and reports
- Reconnection handling

### Supported Features

✅ **Real-time data fetching** from backend APIs
✅ **WebSocket subscriptions** for live updates
✅ **JWT authentication** with token management
✅ **Auto-refresh** on data changes
✅ **Error handling** with user-friendly messages
✅ **Loading states** for better UX
✅ **Fallback to demo mode** if API is unavailable

### API Endpoints Required

Your backend should implement these endpoints:

- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/dashboard/activity` - Recent activity
- `GET /api/admin/users` - List users
- `PATCH /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `PATCH /api/admin/users/:id/ban` - Ban user
- `GET /api/admin/posts` - List posts
- `DELETE /api/admin/posts/:id` - Delete post
- `PATCH /api/admin/posts/:id/approve` - Approve post
- And more... (see `src/services/api.js` for full list)

### WebSocket Events

Your backend should emit these events:

- `stats:updated` - Dashboard stats changed
- `user:new`, `user:updated`, `user:deleted` - User events
- `post:new`, `post:updated`, `post:deleted` - Post events
- `community:new`, `community:updated`, `community:deleted` - Community events
- `event:new`, `event:updated`, `event:deleted` - Event events
- `report:new`, `report:resolved`, `report:deleted` - Report events
- `analytics:updated` - Analytics data changed

## Notes

- This is a separate application from the main Truth Social app
- Authentication uses JWT tokens stored in localStorage
- Falls back to demo mode (admin/admin123) if API is unavailable
- All components are configured for real-time updates

## Deployment

### Railway Deployment

For detailed instructions on deploying to Railway, see [DEPLOYMENT.md](./DEPLOYMENT.md).

**Quick Start:**
1. Push your code to GitHub
2. Create a new Railway project
3. Connect your GitHub repository
4. Set environment variables:
   - `VITE_API_BASE_URL` - Your backend API URL
   - `VITE_WS_URL` - Your WebSocket URL (use `wss://` in production)
5. Railway will automatically build and deploy

The application will be available at your Railway-provided domain.

## Future Enhancements

- Add chart visualizations using Recharts (already in dependencies)
- Add export functionality for reports
- Implement advanced filtering and search
- Add bulk actions for managing multiple items
- Add pagination for large datasets

