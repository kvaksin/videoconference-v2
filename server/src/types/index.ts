export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  participants?: string[];
}

export interface UpdateMeetingRequest {
  title?: string;
  description?: string;
  scheduledAt?: string;
  duration?: number;
  status?: 'scheduled' | 'active' | 'completed' | 'cancelled';
}
