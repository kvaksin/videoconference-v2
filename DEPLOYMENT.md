# Deployment Guide

## Quick Deploy to Render.com

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render automatically detects `render.yaml`
5. Click "Apply" to deploy

### Step 3: Get Admin Credentials
1. Go to your `videoconference-api` service on Render
2. Check "Environment" tab for generated `ADMIN_PASSWORD`
3. Login with: `admin@example.com` / `{password}`
4. Change password immediately in Settings → Security

## Services Created

- **videoconference-api**: Backend server with database
- **videoconference-web**: Frontend static site

## Environment Variables

All required environment variables are auto-configured:
- JWT_SECRET (auto-generated)
- ADMIN_PASSWORD (auto-generated)
- CORS_ORIGIN (auto-configured)
- API endpoints connected automatically

## Post-Deployment Checklist

- [ ] Login with admin credentials
- [ ] Change admin password
- [ ] Test video conferencing
- [ ] Test meeting requests
- [ ] Verify guest access
- [ ] Test availability scheduling

## Troubleshooting

**Build Failures**: Check build logs in Render dashboard
**API Errors**: Verify environment variables are set
**CORS Issues**: Ensure frontend and backend URLs match
**WebRTC Issues**: Verify HTTPS is enabled (automatic on Render)

## Manual Deployment Alternative

If you prefer manual deployment:

1. **Build locally**:
   ```bash
   cd server && npm run build
   cd ../client && npm run build
   ```

2. **Set environment variables**:
   ```bash
   export NODE_ENV=production
   export JWT_SECRET=your-secret-here
   export PORT=3002
   ```

3. **Start server**:
   ```bash
   cd server && npm start
   ```

4. **Serve frontend** (using your preferred static hosting)

## Support

For deployment issues:
- Check Render.com documentation
- Review build logs in service dashboard
- Ensure all environment variables are properly set