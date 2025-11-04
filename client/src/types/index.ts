export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  license: 'basic' | 'full';
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  scheduledAt: string;
  duration: number;
  participants: string[];
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  roomId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateMeetingData {
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  participants?: string[];
}

export interface UpdateMeetingData {
  title?: string;
  description?: string;
  scheduledAt?: string;
  duration?: number;
  status?: 'scheduled' | 'active' | 'completed' | 'cancelled';
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

export interface Availability {
  id: string;
  userId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timeZone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail?: string;
  hostId: string;
  title: string;
  description?: string;
  requestedAt: string;
  duration: number; // 30 or 60 minutes
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  meetingId?: string;
  createdAt: string;
  updatedAt: string;
  isGuestRequest: boolean;
}

export interface AvailabilitySlot {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timeZone: string;
  isBooked: boolean;
  meetingRequestId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingRequestData {
  hostId: string;
  title: string;
  description?: string;
  requestedAt: string;
  duration: number;
  requesterName: string;
  requesterEmail?: string;
  isGuestRequest?: boolean;
}
