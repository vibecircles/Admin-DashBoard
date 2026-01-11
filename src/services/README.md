# API Services

This directory contains API service implementations for the admin dashboard.

## apiService.ts (Recommended)

The new TypeScript API service (`apiService.ts`) implements all endpoints as documented in `ADMIN_DASHBOARD_API.md`. It provides:

- Full TypeScript support with type definitions
- Consistent `ApiResponse<T>` response format
- All admin endpoints from the documentation
- Automatic authentication token handling
- Built-in error handling and 401 redirect

### Usage Example

```typescript
import { apiService } from './services/apiService'

// Get users with filters
const response = await apiService.adminGetUsers({
  page: 1,
  limit: 20,
  search: 'john',
  status: 'active'
})

if (response.success && response.data) {
  const users = response.data
  const pagination = response.pagination
  // Use users...
}
```

## api.js (Legacy)

The existing `api.js` file uses axios and provides a different API structure. It's maintained for backward compatibility with existing components.

### Migration Path

To migrate from `api.js` to `apiService.ts`:

1. Replace imports:
   ```javascript
   // Old
   import { usersAPI } from '../services/api'
   
   // New
   import { apiService } from '../services/apiService'
   ```

2. Update method calls:
   ```javascript
   // Old
   const response = await usersAPI.getAll({ page: 1 })
   const users = response.data
   
   // New
   const response = await apiService.adminGetUsers({ page: 1 })
   if (response.success && response.data) {
     const users = response.data
   }
   ```

3. Handle response structure:
   - `apiService` returns `{ data, success, error, pagination }`
   - Always check `response.success` before using `response.data`

## Environment Variables

Both services use the same environment variable:

- `VITE_API_BASE_URL`: Base URL for the API (defaults to `/api`)

Set in your `.env` file:
```
VITE_API_BASE_URL=http://localhost:3000/api
```
