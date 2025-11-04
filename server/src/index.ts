import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { config } from './config';
import { authService } from './services/auth.service';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import meetingRoutes from './routes/meeting.routes';
import adminRoutes from './routes/admin.routes';
import availabilityRoutes from './routes/availability.routes';
import meetingRequestRoutes from './routes/meeting-request.routes';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Health check (before other routes)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/meeting-requests', meetingRequestRoutes);

// API Documentation
try {
  const swaggerDocument = YAML.load(path.join(__dirname, '../docs/openapi.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.warn('OpenAPI documentation not found. API docs will not be available.');
}

// Serve static files in production
if (config.nodeEnv === 'production') {
  // Serve static assets (CSS, JS, images)
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Serve index.html for all non-API routes (SPA routing)
  app.get('*', (_req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(404).json({ 
          success: false, 
          error: 'Frontend not found. Please ensure the build completed successfully.',
          path: indexPath
        });
      }
    });
  });
}

// Error handler (must be last)
app.use(errorHandler);

// Socket.IO for real-time communication
const roomParticipants = new Map<string, Array<{id: string, name: string, isGuest: boolean}>>();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join room
  socket.on('join-room', (roomId: string, userId: string) => {
    socket.join(roomId);
    
    // Add to room participants
    if (!roomParticipants.has(roomId)) {
      roomParticipants.set(roomId, []);
    }
    const participants = roomParticipants.get(roomId)!;
    
    // Check if user already in room (prevent duplicates)
    if (!participants.find(p => p.id === userId)) {
      participants.push({ id: userId, name: userId, isGuest: false });
      roomParticipants.set(roomId, participants);
    }
    
    // Notify others and send updated participant list
    socket.to(roomId).emit('user-joined', userId);
    io.to(roomId).emit('participants-updated', participants);
    
    console.log(`User ${userId} joined room ${roomId}`);
  });

  // WebRTC signaling
  socket.on('offer', (roomId: string, offer: any, targetSocketId?: string) => {
    console.log(`Offer from ${socket.id} to ${targetSocketId || 'room'} in ${roomId}`);
    if (targetSocketId) {
      // Send to specific peer
      io.to(targetSocketId).emit('offer', offer, socket.id);
    } else {
      // Broadcast to room (for backward compatibility)
      socket.to(roomId).emit('offer', offer, socket.id);
    }
  });

  socket.on('answer', (roomId: string, answer: any, targetSocketId?: string) => {
    console.log(`Answer from ${socket.id} to ${targetSocketId || 'room'} in ${roomId}`);
    if (targetSocketId) {
      // Send to specific peer
      io.to(targetSocketId).emit('answer', answer, socket.id);
    } else {
      // Broadcast to room (for backward compatibility)
      socket.to(roomId).emit('answer', answer, socket.id);
    }
  });

  socket.on('ice-candidate', (roomId: string, candidate: any, targetSocketId?: string) => {
    console.log(`ICE candidate from ${socket.id} to ${targetSocketId || 'room'} in ${roomId}`);
    if (targetSocketId) {
      // Send to specific peer
      io.to(targetSocketId).emit('ice-candidate', candidate, socket.id);
    } else {
      // Broadcast to room (for backward compatibility)
      socket.to(roomId).emit('ice-candidate', candidate, socket.id);
    }
  });

  // Chat
  socket.on('chat-message', (roomId: string, message: any) => {
    io.to(roomId).emit('chat-message', message);
  });

  // Name change
  socket.on('name-change', (roomId: string, data: { userId: string; newName: string }) => {
    socket.to(roomId).emit('name-changed', data);
  });

  // Leave room
  socket.on('leave-room', (roomId: string, userId: string) => {
    socket.leave(roomId);
    
    // Remove from room participants
    if (roomParticipants.has(roomId)) {
      const participants = roomParticipants.get(roomId)!;
      const updatedParticipants = participants.filter(p => p.id !== userId);
      roomParticipants.set(roomId, updatedParticipants);
      
      // Send updated participant list
      io.to(roomId).emit('participants-updated', updatedParticipants);
    }
    
    socket.to(roomId).emit('user-left', userId);
    console.log(`User ${userId} left room ${roomId}`);
  });

  // Guest-specific events
  socket.on('guest-joined', (data: { meetingId: string; guestInfo: any }) => {
    const { meetingId, guestInfo } = data;
    
    // Add guest to room participants
    if (!roomParticipants.has(meetingId)) {
      roomParticipants.set(meetingId, []);
    }
    const participants = roomParticipants.get(meetingId)!;
    
    // Check if guest already in room (prevent duplicates)
    if (!participants.find(p => p.id === guestInfo.tempId)) {
      participants.push({ 
        id: guestInfo.tempId, 
        name: guestInfo.name, 
        isGuest: true 
      });
      roomParticipants.set(meetingId, participants);
    }
    
    // Notify others and send updated participant list
    socket.to(meetingId).emit('guest-joined', guestInfo);
    io.to(meetingId).emit('participants-updated', participants);
    
    console.log(`Guest ${guestInfo.name} joined meeting ${meetingId}`);
  });

  socket.on('guest-left', (data: { meetingId: string; guestInfo: any }) => {
    const { meetingId, guestInfo } = data;
    
    // Remove guest from room participants
    if (roomParticipants.has(meetingId)) {
      const participants = roomParticipants.get(meetingId)!;
      const updatedParticipants = participants.filter(p => p.id !== guestInfo.tempId);
      roomParticipants.set(meetingId, updatedParticipants);
      
      // Send updated participant list
      io.to(meetingId).emit('participants-updated', updatedParticipants);
    }
    
    socket.to(meetingId).emit('guest-left', guestInfo);
    console.log(`Guest ${guestInfo.name} left meeting ${meetingId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Clean up participant from all rooms (since we don't track which room this socket was in)
    // This is a simple cleanup - in production you'd want better tracking
    roomParticipants.forEach((participants, roomId) => {
      const initialLength = participants.length;
      // Remove any participants that might be associated with this socket
      // Note: This is a basic cleanup. For better tracking, you'd store socket.id with participants
      roomParticipants.set(roomId, participants);
      
      // If there were changes, update participants
      if (participants.length !== initialLength) {
        io.to(roomId).emit('participants-updated', participants);
      }
    });
  });
});

// Initialize admin user and start server
const startServer = async () => {
  try {
    await authService.initializeAdmin();

    // In production, verify static files exist
    if (config.nodeEnv === 'production') {
      const fs = require('fs');
      const publicDir = path.join(__dirname, 'public');
      const indexPath = path.join(publicDir, 'index.html');
      
      console.log(`Checking for static files in: ${publicDir}`);
      if (fs.existsSync(publicDir)) {
        const files = fs.readdirSync(publicDir);
        console.log(`Found ${files.length} files/folders in public directory:`, files);
        
        if (!fs.existsSync(indexPath)) {
          console.error(`❌ WARNING: index.html not found at ${indexPath}`);
          console.error('The frontend will not be accessible!');
        } else {
          console.log(`✅ Frontend files found - app will serve at /`);
        }
      } else {
        console.error(`❌ WARNING: Public directory not found at ${publicDir}`);
        console.error('Static files were not copied during build. Check build logs.');
      }
    }

    httpServer.listen(config.port, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  🚀 VaxCall Server Running                            ║
║                                                        ║
║  Port:        ${config.port}                              ║
║  Environment: ${config.nodeEnv}                       ║
║  API Docs:    http://localhost:${config.port}/api-docs     ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
