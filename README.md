# Video Conference Application

# VaxCall - Video Conference Platform

A modern, feature-rich video conferencing platform built with React, TypeScript, Node.js, and WebRTC.

## 🚀 Quick Deploy

**One-click deployment to Render.com:**
1. Push to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your repo → Apply (auto-detects `render.yaml`)
4. Get admin credentials from dashboard → Login → Change password

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Features

### Core Video Conferencing
- 🎥 Real-time video and audio conferencing with WebRTC
- 🖥️ Screen sharing capabilities
- 💬 Live chat during meetings with real-time messaging
- 👥 Multi-participant support (authenticated users + guests)
- 🚀 **Ad-hoc meetings** - Start instant meetings with one click
- 📹 Video/audio controls (mute, camera on/off)

### Meeting Management & Scheduling
- 📅 **Advanced calendar system** with monthly view
- ⏰ Meeting scheduling with date/time picker
- 📊 Meeting history and management
- 🔗 **Guest access links** - Allow anyone to join without registration
- 📊 Meeting duration tracking
- 🎯 Room-based meeting organization
- 🗓️ **NEW: Availability Management** - Set weekly available hours
- 📝 **NEW: Meeting Request System** - Accept meeting requests from others
- 🌍 **Enhanced Timezone Support** - 12+ timezones including Paris & Tallinn

### Advanced Availability & Booking System
- ⏰ **Personal Availability** - Set weekly schedule with timezone preferences
- 🔗 **Shareable Booking Links** - Let others request meetings with you
- 📋 **Meeting Request Workflow** - Approve/reject incoming requests
- ⚡ **Smart Slot Generation** - Automatic 30min/1hr time slot creation
- 🌐 **Guest-Friendly Booking** - No account required to request meetings
- 📬 **Request Management** - Real-time notifications for pending requests
- ✅ **One-Click Approval** - Instantly approve and create meetings

### User Management & Authentication
- 🔒 Secure JWT-based authentication
- 👤 User profiles with customizable settings
- 🛡️ **Enhanced security settings** with password change
- 👑 Admin dashboard with user management
- 🏷️ User roles and license management
- 📧 Profile management (name, email updates)

### Advanced Settings & Preferences
- ⚙️ **Comprehensive settings page** with tabbed interface:
  - 👤 **Profile Tab**: Update name, email, view account info
  - 🔐 **Security Tab**: Change password with validation
  - 🎛️ **Preferences Tab**: Meeting defaults, notifications
- 🌙 Dark mode support
- � Responsive design for all devices
- 🔔 Real-time notifications

### Calendar & Scheduling
- 📅 **Interactive calendar** with meeting overview
- �️ **Clickable meeting events** - View details and join meetings directly from calendar
- �📥 **ICS export** for calendar integration
- 🕐 Availability settings and time zone support
- 🔗 Shareable booking links
- 📊 License-based feature access
- ⏰ **NEW: Comprehensive Availability Management**
- 📋 **NEW: Meeting Request System with Approval Workflow**
- 🎥 **NEW: One-click meeting join** from calendar events

### Guest Access System
- 🌐 **Unauthenticated meeting access** via guest links
- 👥 Mixed participant support (registered + guest users)
- 🎭 Guest identification and management
- 💬 Full chat and video features for guests
- 🔗 Easy link sharing for external participants
- 📝 **NEW: Guest Meeting Requests** - Request meetings without accounts

### Admin Features
- 📊 Comprehensive admin dashboard
- 👥 User management and role assignment
- 📈 Usage statistics and analytics
- 🏷️ License management system
- 🗑️ Meeting and user administration

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Socket.io Client
- WebRTC
- React Router
- Axios

### Backend
- Node.js
- Express
- TypeScript
- Socket.io
- JSON file-based database
- JWT Authentication
- OpenAPI/Swagger documentation

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Quick Start

The fastest way to get started:

```bash
# Make start script executable and run
chmod +x start-dev.sh
./start-dev.sh
```

This will:
1. Install all dependencies
2. Start both server and client
3. Open the application at http://localhost:3000

### Manual Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd videoconference-v2
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` and set your configuration (especially JWT_SECRET)

4. Install dependencies:
```bash
npm run install:all
```

## Development

Start both server and client in development mode:
```bash
npm run dev
# or use the convenient script:
./start-dev.sh
```

Or start them separately:
```bash
# Terminal 1 - Server
npm run dev:server

# Terminal 2 - Client
npm run dev:client
```

### URLs and Ports
- **Client**: http://localhost:3000 (or next available port)
- **Server**: http://localhost:3002
- **API Documentation**: http://localhost:3002/api-docs

### Access URLs
- **Main Dashboard**: `http://localhost:3000/dashboard`
- **Availability Management**: `http://localhost:3000/availability`
- **Request Meeting**: `http://localhost:3000/request/{userId}`
- **Book/Join Meeting**: `http://localhost:3000/book/{id}`
- **Guest Meeting Join**: `http://localhost:3000/guest/join/{meetingId}`

### Key Features to Test
1. **Ad-hoc Meetings**: Click "🚀 Start Meeting Now" for instant meetings
2. **Availability Setup**: Go to `/availability` to configure your schedule
3. **Meeting Requests**: Share your booking link and test the request workflow
4. **Guest Access**: Share guest links to allow external participants
5. **Settings Page**: Access via navbar for profile, security, and preferences
6. **Interactive Calendar**: Click calendar events to view details and join meetings
7. **Calendar Meeting Join**: One-click meeting access from calendar interface
8. **Multi-user Support**: Test with multiple browser windows/incognito tabs

## Deployment

### Deploy to Render.com

This application is configured for easy deployment on Render.com using the included `render.yaml` file.

#### Prerequisites
- GitHub repository with your code
- Render.com account

#### Automatic Deployment Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Render**:
   - Go to [Render.com](https://render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Deploy**:
   - Review the services that will be created:
     - `videoconference-api` (Backend API server)
     - `videoconference-web` (Frontend static site)
   - Click "Apply" to start deployment

#### What Gets Deployed

The `render.yaml` configuration creates:

**Backend Service (`videoconference-api`)**:
- Node.js web service on Render's starter plan
- Automatic SSL certificate
- Environment variables auto-generated (JWT_SECRET, ADMIN_PASSWORD)
- Persistent disk storage for data files
- CORS configured to allow frontend domain

**Frontend Service (`videoconference-web`)**:
- Static site hosting for the React application
- Built with Vite for optimal performance
- Custom routing configured for SPA
- Connected to backend API automatically

#### Environment Variables

The following environment variables are automatically configured:

**Backend**:
- `NODE_ENV` → `production`
- `PORT` → Auto-assigned by Render
- `JWT_SECRET` → Auto-generated secure secret
- `CORS_ORIGIN` → Frontend URL (auto-configured)
- `ADMIN_PASSWORD` → Auto-generated (check Render dashboard)

**Frontend**:
- `VITE_API_URL` → Backend API URL (auto-configured)

#### Post-Deployment Setup

1. **Find Admin Credentials**:
   - Go to your `videoconference-api` service dashboard on Render
   - Check "Environment" tab for the generated `ADMIN_PASSWORD`
   - Login with: `admin@example.com` / `{generated-password}`

2. **Update Admin Credentials**:
   - Login to your deployed app
   - Go to Settings → Security
   - Change the admin password immediately

3. **Test Core Features**:
   - Create a test meeting
   - Set up availability schedule
   - Test guest access and meeting requests
   - Verify video/audio functionality

#### Custom Domain (Optional)

To use your own domain:
1. In Render dashboard, go to your `videoconference-web` service
2. Navigate to "Settings" → "Custom Domains"
3. Add your domain and configure DNS
4. Update CORS settings in backend if needed

### Alternative Deployment Options

#### Manual Docker Deployment

Create a `Dockerfile` for containerized deployment:

```dockerfile
# Frontend build stage
FROM node:18-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Backend stage
FROM node:18-alpine AS backend
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Final stage
FROM node:18-alpine
WORKDIR /app
COPY --from=backend /app/server ./server
COPY --from=frontend-builder /app/client/dist ./client/dist
COPY server/ ./server/

EXPOSE 3002
CMD ["npm", "run", "start"]
```

#### Environment Variables for Manual Deployment

Required environment variables for production:

```bash
NODE_ENV=production
PORT=3002
JWT_SECRET=your-secure-jwt-secret-here
CORS_ORIGIN=https://your-frontend-domain.com
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-admin-password
DATA_DIR=/app/data
```

#### HTTPS Requirements

**Important**: WebRTC requires HTTPS in production. Ensure your deployment platform provides:
- SSL/TLS certificates
- Secure WebSocket connections (WSS)
- HTTPS for all API endpoints

Most platforms like Render, Vercel, Netlify provide automatic HTTPS.

## Building for Production

Build both server and client:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Default Admin User

On first run, an admin user will be created with:
- **Email**: admin@example.com
- **Password**: admin123

**⚠️ Important**: Change these credentials immediately after first login via Settings > Security!

### Testing Guest Access

1. Create a meeting as an authenticated user
2. Copy the guest link from the meeting card
3. Open an incognito/private browser window
4. Navigate to the guest link
5. Enter a guest name and join the meeting
6. Test video, audio, and chat functionality

### NEW: Testing Availability & Meeting Requests

**Setting Up Availability**:
1. Login and navigate to `/availability`
2. Configure your weekly schedule
3. Copy your booking link

**Testing Meeting Requests**:
1. Open incognito window
2. Visit your booking link: `/request/{your-user-id}`
3. Select available time slot and submit request
4. Return to main window and approve/reject in `/availability`
5. Test automatic meeting creation for approved requests

**Multi-Timezone Testing**:
- Test availability in different timezones
- Verify time slot display accuracy
- Check meeting time conversions

## Usage Guide

### Creating Meetings

**Instant Meeting (Ad-hoc)**:
- Click "🚀 Start Meeting Now" from the dashboard
- Immediately joins a new meeting room
- Perfect for spontaneous conversations

**Scheduled Meeting**:
- Click "Schedule Meeting" to open the form
- Set title, description, date/time, and duration
- Use "Guest Link" button to share with external participants

### NEW: Availability & Meeting Requests

**Setting Up Your Availability**:
1. Navigate to "⏰ Availability" in the dashboard navbar
2. Configure your weekly schedule (select days and hours)
3. Choose your timezone (supports 12+ timezones including Paris & Tallinn)
4. Copy your personal booking link to share with others

**Managing Meeting Requests**:
- View pending requests in the Availability page
- Approve or reject requests with one click
- Approved meetings automatically create video conference rooms
- Get real-time notifications for new requests

**Requesting Meetings with Others**:
1. Visit someone's booking link: `/request/{userId}` or `/book/{userId}`
2. Browse their available time slots (displayed in your timezone)
3. Select preferred duration (30 minutes or 1 hour)
4. Fill in meeting details and submit request
5. Wait for host approval - no account required!

### Enhanced Timezone Support
All scheduling features now support 12+ major timezones:
- Americas: Eastern, Central, Mountain, Pacific
- Europe: London, Paris, Tallinn, Berlin
- Asia: Tokyo, Shanghai
- Pacific: Sydney
- UTC

### Settings Management

Access comprehensive settings via the navbar:

**Profile Tab**:
- Update name and email
- View account information
- Manage personal details

**Security Tab**:
- Change password with current password verification
- Secure account management

**Preferences Tab**:
- Set default meeting duration
- Configure notification preferences
- Customize meeting defaults

### Calendar Features

- **Monthly View**: Navigate through months to see all meetings
- **Clickable Events**: Click any meeting event to view details and join
- **Meeting Details Modal**: Shows comprehensive meeting information including:
  - Date, time, and duration
  - Description and participants
  - Meeting status and ID
  - One-click join button for scheduled/active meetings
- **Meeting Creation**: Click any date to create new meetings
- **ICS Export**: Download calendar files for external apps
- **Availability Settings**: Configure your available time slots
- **Admin Features**: Delete any meeting (admin users only)

## Project Structure

```
videoconference-v2/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   │   ├── DashboardPage.tsx    # Main dashboard with ad-hoc meetings
│   │   │   ├── SettingsPage.tsx     # Enhanced settings (Profile/Security/Preferences)
│   │   │   ├── CalendarPage.tsx     # Calendar with ICS export
│   │   │   ├── AvailabilityPage.tsx # NEW: Availability management
│   │   │   ├── RequestMeetingPage.tsx # NEW: Meeting request interface
│   │   │   ├── BookingPage.tsx      # Enhanced booking/joining page
│   │   │   ├── GuestJoinPage.tsx    # Guest meeting entry point
│   │   │   ├── GuestMeetingPage.tsx # Guest meeting interface
│   │   │   ├── MeetingPage.tsx      # Main meeting room
│   │   │   └── ...
│   │   ├── services/    # API and WebRTC services
│   │   │   ├── api.service.ts       # API client with availability endpoints
│   │   │   └── socket.service.ts    # WebSocket client
│   │   ├── contexts/    # React contexts
│   │   │   └── AuthContext.tsx      # Authentication context
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Utility functions
│   └── package.json
├── server/              # Express backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   │   ├── auth.routes.ts         # Auth + profile endpoints
│   │   │   ├── meeting.routes.ts      # Meeting management
│   │   │   ├── availability.routes.ts # NEW: Availability management
│   │   │   ├── meeting-request.routes.ts # NEW: Meeting request workflow
│   │   │   └── admin.routes.ts        # Admin functionality
│   │   ├── controllers/ # Request handlers
│   │   │   ├── availability.controller.ts    # NEW: Availability logic
│   │   │   ├── meeting-request.controller.ts # NEW: Request management
│   │   │   └── ...
│   │   ├── services/    # Business logic
│   │   │   ├── availability.service.ts       # NEW: Availability & slot generation
│   │   │   ├── meeting-request.service.ts    # NEW: Request workflow
│   │   │   └── ...
│   │   ├── middleware/  # Express middleware
│   │   │   ├── auth.middleware.ts          # JWT authentication
│   │   │   └── optional-auth.middleware.ts # Guest access support
│   │   ├── models/      # Data models
│   │   ├── types/       # TypeScript types
│   │   └── config/      # Configuration
│   ├── data/            # JSON database files
│   │   ├── users.json         # User accounts and profiles
│   │   ├── meetings.json      # Meeting data and history
│   │   ├── availability.json  # NEW: User availability schedules
│   │   ├── availabilitySlots.json # NEW: Generated time slots
│   │   └── meetingRequests.json   # NEW: Meeting request workflow
│   └── package.json
├── docs/                # API documentation
├── start-dev.sh         # Quick start script
├── QUICK-START.sh       # Setup and start script
└── README.md
```

## Scripts

### Development
- `npm run dev` - Start development environment (both server and client)
- `./start-dev.sh` - Quick start script with automatic setup
- `npm run dev:server` - Start server only
- `npm run dev:client` - Start client only

### Production
- `npm run build` - Build for production
- `npm start` - Start production server

### Maintenance
- `npm run lint` - Lint all code
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking
- `npm run install:all` - Install dependencies for both client and server

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Meetings
- `GET /api/meetings` - Get user meetings
- `POST /api/meetings` - Create new meeting
- `GET /api/meetings/:id` - Get meeting details (supports guest access)
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting
- `POST /api/meetings/:id/start` - Start meeting
- `POST /api/meetings/:id/end` - End meeting

### NEW: Availability Management
- `PUT /api/availability` - Set user availability schedule
- `GET /api/availability` - Get user's availability
- `GET /api/availability/slots` - Get user's available time slots
- `GET /api/availability/:userId/slots` - Get available slots for specific user (public)

### NEW: Meeting Requests
- `POST /api/meeting-requests` - Create meeting request (authenticated or guest)
- `GET /api/meeting-requests` - Get requests received by user
- `GET /api/meeting-requests/made` - Get requests made by user
- `GET /api/meeting-requests/pending/count` - Get pending request count
- `GET /api/meeting-requests/:id` - Get specific request
- `POST /api/meeting-requests/:id/approve` - Approve request (creates meeting)
- `POST /api/meeting-requests/:id/reject` - Reject request
- `POST /api/meeting-requests/:id/cancel` - Cancel request (by requester)

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/meetings` - Get all meetings
- `GET /api/admin/stats` - Get system statistics
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id/license` - Update user license
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user

## WebSocket Events

### Meeting Room Events
- `join-room` - Join a meeting room
- `leave-room` - Leave a meeting room
- `offer` - WebRTC offer for video connection
- `answer` - WebRTC answer for video connection
- `ice-candidate` - ICE candidate for WebRTC
- `chat-message` - Send chat message
- `user-joined` - User joined notification
- `user-left` - User left notification

## Troubleshooting

### Common Issues

**Port Conflicts**:
- If ports 3000/3001 are in use, the system will automatically find available ports
- Check terminal output for actual URLs

**Socket Connection Issues**:
- Ensure both server and client are running
- Check browser console for WebSocket errors
- Verify proxy configuration in `vite.config.ts`

**Guest Access Not Working**:
- Verify guest URLs use format: `/guest/join/MEETING_ID`
- For meeting requests, use: `/request/USER_ID` or `/book/USER_ID`
- Check that optional-auth middleware is working
- Test with incognito/private browser windows

**Meeting Requests Not Working**:
- Ensure user has set up availability first
- Check API endpoints are properly connected to backend (localhost:3001)
- Verify timezone handling in availability slots
- Test approval workflow completely

**API Connection Issues**:
- Ensure backend is running on port 3002
- Check that API service points to correct backend URL
- Verify CORS settings allow frontend-backend communication

**WebRTC Issues**:
- Ensure HTTPS in production (WebRTC requires secure context)
- Check browser permissions for camera/microphone
- Test with different browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (especially guest access and multi-user scenarios)
5. Submit a pull request

## Deployment Files

- `render.yaml` - Render.com Blueprint configuration
- `DEPLOYMENT.md` - Detailed deployment guide
- Environment variables automatically configured for production

## License

ISC
