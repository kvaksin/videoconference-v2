export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user' | 'agent' | 'supervisor';
  license: 'basic' | 'full';
  agentStatus?: 'available' | 'busy' | 'away' | 'offline';
  department?: string;
  skills?: string[]; // For call routing
  maxConcurrentCalls?: number;
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

// Contact Center Models

export interface CallQueue {
  id: string;
  name: string;
  description?: string;
  department?: string;
  maxQueueSize: number;
  maxWaitTime: number; // in seconds
  priority: number; // 1-10, higher = more priority
  routingStrategy: 'round-robin' | 'longest-idle' | 'skill-based' | 'priority';
  requiredSkills?: string[];
  assignedAgents: string[]; // User IDs
  isActive: boolean;
  businessHours?: {
    enabled: boolean;
    schedule: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Call {
  id: string;
  queueId?: string;
  callerId: string; // Guest or User ID
  callerName: string;
  callerPhone?: string;
  callerEmail?: string;
  assignedAgentId?: string;
  status: 'waiting' | 'ringing' | 'active' | 'completed' | 'missed' | 'abandoned';
  priority: number;
  startTime: string;
  endTime?: string;
  waitTime?: number; // in seconds
  talkTime?: number; // in seconds
  roomId?: string;
  callNotes?: string;
  tags?: string[];
  satisfaction?: number; // 1-5 rating
  recordingUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CallFlowNode {
  id: string;
  type: 'start' | 'ivr' | 'queue' | 'agent' | 'voicemail' | 'transfer' | 'hangup' | 'time-condition' | 'skill-check';
  label: string;
  config: {
    message?: string;
    options?: { key: string; label: string; nextNodeId: string }[];
    queueId?: string;
    agentId?: string;
    transferNumber?: string;
    timeCondition?: {
      days: number[];
      startTime: string;
      endTime: string;
      nextNodeIdTrue: string;
      nextNodeIdFalse: string;
    };
    requiredSkills?: string[];
  };
  position: { x: number; y: number };
  nextNodeId?: string;
}

export interface CallFlow {
  id: string;
  name: string;
  description?: string;
  phoneNumber?: string;
  isActive: boolean;
  nodes: CallFlowNode[];
  startNodeId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentActivity {
  id: string;
  agentId: string;
  activityType: 'login' | 'logout' | 'status-change' | 'call-received' | 'call-completed' | 'break-start' | 'break-end';
  status?: string;
  callId?: string;
  duration?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SupervisorDashboard {
  id: string;
  supervisorId: string;
  widgets: {
    id: string;
    type: 'active-calls' | 'queue-stats' | 'agent-status' | 'performance-metrics' | 'call-history';
    position: { x: number; y: number; w: number; h: number };
    config?: Record<string, any>;
  }[];
  createdAt: string;
  updatedAt: string;
}

