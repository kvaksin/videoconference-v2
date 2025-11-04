# Render.com Deployment Guide

## ⚠️ IMPORTANT: Deployment Method

This application **MUST** be deployed using **Render Blueprint** (from `render.yaml`), NOT as a single web service.

The application consists of:
1. **Backend API** - Node.js Express server (videoconference-api)
2. **Frontend Web App** - Static React site (videoconference-web)

## 🚀 Correct Deployment Steps

### Step 1: Delete Existing Deployment (if incorrect)

If you deployed as a single web service:
1. Go to your Render Dashboard
2. Delete the incorrect service(s)
3. Start fresh with Blueprint deployment below

### Step 2: Deploy Using Blueprint

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Render Blueprint deployment"
   git push origin main
   ```

2. **Create New Blueprint:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub repository: `kvaksin/videoconference-v2`
   - Render will automatically detect `render.yaml`
   - Click **"Apply"**

3. **Monitor Deployment:**
   - Two services will be created:
     - `videoconference-api` (Node.js backend)
     - `videoconference-web` (Static frontend)
   - Wait for both to complete building
   - Backend URL: `https://videoconference-api.onrender.com`
   - Frontend URL: `https://videoconference-web.onrender.com`

### Step 3: Verify Environment Variables

After deployment, check that these are auto-configured:

**Backend (videoconference-api):**
- `NODE_ENV` = `production`
- `PORT` = (auto-assigned by Render)
- `JWT_SECRET` = (auto-generated)
- `CORS_ORIGIN` = `https://videoconference-web.onrender.com`
- `DATA_DIR` = `/var/data`
- `ADMIN_EMAIL` = `admin@example.com`
- `ADMIN_PASSWORD` = (auto-generated - **copy this!**)

**Frontend (videoconference-web):**
- `VITE_API_URL` = `https://videoconference-api.onrender.com`

### Step 4: Access Your Application

- **Frontend URL:** `https://videoconference-web.onrender.com`
- **API Health Check:** `https://videoconference-api.onrender.com/health`
- **API Docs:** `https://videoconference-api.onrender.com/api-docs`

## 🔧 If You See File Not Found Errors

If you see errors like:
```
ENOENT: no such file or directory, stat '/opt/render/project/src/server/client/dist/index.html'
```

**This means you deployed incorrectly as a single service.** Follow these steps:

1. **Delete the incorrect service** in Render Dashboard
2. **Use Blueprint deployment** (Step 2 above)
3. **Never deploy as a single web service** - always use Blueprint

## 📋 Architecture Overview

```
┌─────────────────────────────────────┐
│  Frontend (Static Site)              │
│  videoconference-web.onrender.com   │
│  - React + Vite build                │
│  - Served as static files            │
│  - Makes API calls to backend        │
└─────────────────┬───────────────────┘
                  │
                  │ HTTP Requests
                  │
                  ▼
┌─────────────────────────────────────┐
│  Backend (Node.js API)               │
│  videoconference-api.onrender.com   │
│  - Express + Socket.io               │
│  - REST API endpoints                │
│  - WebSocket connections             │
│  - Persistent data storage           │
└─────────────────────────────────────┘
```

## 🔒 Security Configuration

### CORS
The backend automatically allows requests from the frontend URL specified in `CORS_ORIGIN`.

### JWT Secret
Auto-generated during Blueprint deployment. Used for authentication tokens.

### Admin Credentials
- **Email:** `admin@example.com`
- **Password:** Check environment variables in Render Dashboard
- **Important:** Change the admin password after first login!

## 📊 Monitoring & Logs

### View Logs
- **Backend:** Dashboard → videoconference-api → Logs
- **Frontend:** Dashboard → videoconference-web → Logs

### Health Checks
- Backend health: `GET https://videoconference-api.onrender.com/health`
- Should return: `{"status":"ok","timestamp":"..."}`

### Common Issues

1. **CORS Errors:**
   - Verify `CORS_ORIGIN` env var points to correct frontend URL
   - Check that requests are going to the correct API URL

2. **Authentication Errors:**
   - Ensure `JWT_SECRET` is set
   - Clear browser localStorage and try logging in again

3. **Data Not Persisting:**
   - Check that disk is mounted at `/var/data`
   - Verify `DATA_DIR` env var matches disk mount path

## 🔄 Redeployment

To redeploy after code changes:

1. **Push changes to GitHub:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Render auto-deploys** when you push to `main` branch
3. Both services will rebuild automatically

## 📈 Scaling Considerations

### Free/Starter Plan Limitations
- Services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- 512MB RAM, 0.1 CPU per service

### Upgrading
If you need:
- No sleep time → Upgrade to **Standard** plan
- More resources → Scale CPU/RAM in service settings
- Custom domain → Add in service settings

## 🆘 Troubleshooting

### Issue: "Cannot find client files"
**Solution:** You deployed as single service. Delete and redeploy using Blueprint.

### Issue: "CORS policy error"
**Solution:** Check `CORS_ORIGIN` env var matches your frontend URL exactly.

### Issue: "Connection refused"
**Solution:** Check that both services are running in Dashboard.

### Issue: "JWT malformed"
**Solution:** Clear browser localStorage, ensure `JWT_SECRET` is set in backend.

## ✅ Deployment Checklist

Before deploying:
- [ ] Code pushed to GitHub `main` branch
- [ ] `render.yaml` present in repository root
- [ ] All local builds passing (`npm run build`)
- [ ] No TypeScript errors

During deployment:
- [ ] Used Blueprint deployment (not single web service)
- [ ] Both services created successfully
- [ ] All environment variables auto-configured
- [ ] Copied admin password from env vars

After deployment:
- [ ] Frontend loads at `videoconference-web.onrender.com`
- [ ] Backend health check returns 200 OK
- [ ] Can login with admin credentials
- [ ] Can create and join meetings
- [ ] WebSocket connections working

## 📞 Support

If you encounter issues:
1. Check Render Dashboard logs for both services
2. Verify all environment variables are set
3. Test backend health endpoint
4. Check browser console for errors
5. Review [Render Documentation](https://render.com/docs)