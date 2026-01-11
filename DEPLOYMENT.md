# Deploying to Railway

This guide will walk you through deploying the Admin Dashboard to Railway.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. A GitHub account (for connecting your repository)
3. Node.js 18+ installed locally (for testing)

## Step 1: Prepare Your Repository

Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

## Step 2: Create a New Project on Railway

1. Go to [railway.app](https://railway.app) and log in
2. Click "New Project"
3. Select "Deploy from GitHub repo" (or your Git provider)
4. Select your repository
5. Railway will automatically detect it's a Node.js project

## Step 3: Configure Environment Variables

1. In your Railway project dashboard, go to the "Variables" tab
2. Add the following environment variables:

```
VITE_API_BASE_URL=https://your-backend-api.railway.app/api
VITE_WS_URL=wss://your-backend-api.railway.app
PORT=4174
```

**Important Notes:**
- Replace `your-backend-api.railway.app` with your actual backend API URL
- If your backend is also on Railway, you can use the generated Railway domain
- The `PORT` variable is automatically set by Railway, but you can set a default if needed
- For WebSocket URLs, use `wss://` (secure WebSocket) in production

## Step 4: Configure Build Settings

Railway will automatically detect the build process from the `railway.json` file, which:
- Runs `npm install` and `npm run build` during build
- Runs `npm start` to serve the production build

## Step 5: Deploy

1. Railway will automatically trigger a deployment when you:
   - Connect the repository (first time)
   - Push changes to your main branch (if auto-deploy is enabled)

2. You can also manually trigger a deployment:
   - Go to the "Deployments" tab
   - Click "Redeploy"

## Step 6: Access Your Application

Once deployed, Railway will provide you with a public URL:
- Go to the "Settings" tab
- Under "Domains", you'll see your Railway-provided domain
- Click on it to access your deployed application

## Optional: Custom Domain

1. In Railway project settings, go to "Settings" → "Domains"
2. Click "Add Domain"
3. Follow the instructions to configure your custom domain

## Troubleshooting

### Build Fails

- Check the build logs in Railway dashboard
- Ensure all dependencies are listed in `package.json`
- Verify Node.js version is compatible (Railway defaults to Node 18+)

### Application Won't Start

- Check that environment variables are set correctly
- Verify the `PORT` environment variable is available
- Review the deployment logs for errors

### API Connection Issues

- Ensure your backend API is deployed and accessible
- Verify `VITE_API_BASE_URL` and `VITE_WS_URL` are correct
- Check CORS settings on your backend API
- Make sure WebSocket connections are supported in production

### Environment Variables Not Working

- Remember: Vite environment variables must be prefixed with `VITE_`
- After adding/updating environment variables, trigger a new deployment
- Variables are injected at build time, not runtime

## Deployment Commands Reference

Railway uses these commands (configured in `railway.json`):

- **Build**: `npm install && npm run build`
- **Start**: `npm start` (which runs `vite preview --port $PORT --host`)

## Production Checklist

- [ ] All environment variables are set in Railway
- [ ] Backend API is deployed and accessible
- [ ] WebSocket URL uses `wss://` for secure connections
- [ ] CORS is configured on the backend
- [ ] Build completes successfully
- [ ] Application is accessible via Railway domain
- [ ] Login functionality works with production API

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Vite Production Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode.html)
