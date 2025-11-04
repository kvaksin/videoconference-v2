export interface User {
  id: string;
  email: string;
  password: string;
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
  duration: number; // in minutes
  participants: string[]; // user IDs
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  roomId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Availability {
  id: string;
  userId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timeZone: string; // e.g., 'America/New_York'
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingRequest {
  id: string;
  requesterId: string; // Who is requesting the meeting
  requesterName: string; // Name of requester (could be guest)
  requesterEmail?: string; // Optional email for guests
  hostId: string; // Who the meeting is requested with
  title: string;
  description?: string;
  requestedAt: string; // When they want to meet (ISO string)
  duration: number; // 30 or 60 minutes
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  meetingId?: string; // Created meeting ID if approved
  createdAt: string;
  updatedAt: string;
  isGuestRequest: boolean; // True if requested by non-user
}

export interface AvailabilitySlot {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timeZone: string;
  isBooked: boolean;
  meetingRequestId?: string; // If booked, reference to the request
  createdAt: string;
  updatedAt: string;
}
