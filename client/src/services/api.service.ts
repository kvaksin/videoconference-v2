import axios from 'axios';
import type {
  User,
  Meeting,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  CreateMeetingData,
  UpdateMeetingData,
  Availability,
  AvailabilitySlot,
  MeetingRequest,
  CreateMeetingRequestData,
} from '../types';

class ApiService {
  private api: any;

  constructor() {
    // Use environment variable in production, localhost in development
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let baseURL: string;
    
    if (isDevelopment) {
      baseURL = 'http://localhost:3002/api';
    } else {
      // In production, use the VITE_API_URL if available, otherwise construct from current domain
      baseURL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}/api`;
      // Remove any trailing slash and ensure we have /api
      baseURL = baseURL.replace(/\/+$/, '') + (baseURL.endsWith('/api') ? '' : '/api');
    }
    
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout for production
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config: any) => {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle 401 errors
    this.api.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data.data!;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post('/auth/register', data);
    return response.data.data!;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/auth/me');
    return response.data.data!;
  }

  async updateProfile(data: { name: string; email: string }): Promise<User> {
    const response = await this.api.put('/auth/profile', data);
    return response.data.data!;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.api.put('/auth/password', { currentPassword, newPassword });
  }

  // Meeting endpoints
  async getMeetings(): Promise<Meeting[]> {
    const response = await this.api.get('/meetings');
    return response.data.data || [];
  }

  async getMeeting(id: string): Promise<Meeting> {
    const response = await this.api.get(`/meetings/${id}`);
    return response.data.data!;
  }

  async createMeeting(data: CreateMeetingData): Promise<Meeting> {
    const response = await this.api.post('/meetings', data);
    return response.data.data!;
  }

  async updateMeeting(id: string, data: UpdateMeetingData): Promise<Meeting> {
    const response = await this.api.put(`/meetings/${id}`, data);
    return response.data.data!;
  }

  async deleteMeeting(id: string): Promise<void> {
    await this.api.delete(`/meetings/${id}`);
  }

  async startMeeting(id: string): Promise<Meeting> {
    const response = await this.api.post(`/meetings/${id}/start`);
    return response.data.data!;
  }

  async endMeeting(id: string): Promise<Meeting> {
    const response = await this.api.post(`/meetings/${id}/end`);
    return response.data.data!;
  }

  // Admin endpoints
  async getAllUsers(): Promise<User[]> {
    const response = await this.api.get('/admin/users');
    return response.data.data || [];
  }

  async getAllMeetings(): Promise<Meeting[]> {
    const response = await this.api.get('/admin/meetings');
    return response.data.data || [];
  }

  // Availability endpoints
  async setAvailability(availability: Omit<Availability, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]): Promise<Availability[]> {
    const response = await this.api.put('/availability', { availability });
    return response.data.data!;
  }

  async getMyAvailability(): Promise<Availability[]> {
    const response = await this.api.get('/availability');
    return response.data.data || [];
  }

  async getAvailableSlots(userId: string, startDate: string, endDate: string): Promise<AvailabilitySlot[]> {
    const response = await this.api.get(
      `/availability/${userId}/slots?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data.data || [];
  }

  async getMyAvailableSlots(startDate: string, endDate: string): Promise<AvailabilitySlot[]> {
    const response = await this.api.get(
      `/availability/slots?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data.data || [];
  }

  // Meeting Request endpoints
  async createMeetingRequest(data: CreateMeetingRequestData): Promise<MeetingRequest> {
    const response = await this.api.post('/meeting-requests', data);
    return response.data.data!;
  }

  async getMyMeetingRequests(): Promise<MeetingRequest[]> {
    const response = await this.api.get('/meeting-requests');
    return response.data.data || [];
  }

  async getMyRequestsMade(): Promise<MeetingRequest[]> {
    const response = await this.api.get('/meeting-requests/made');
    return response.data.data || [];
  }

  async getMeetingRequest(id: string): Promise<MeetingRequest> {
    const response = await this.api.get(`/meeting-requests/${id}`);
    return response.data.data!;
  }

  async approveMeetingRequest(id: string): Promise<{ request: MeetingRequest; meeting: Meeting }> {
    const response = await this.api.post(
      `/meeting-requests/${id}/approve`
    );
    return response.data.data!;
  }

  async rejectMeetingRequest(id: string): Promise<MeetingRequest> {
    const response = await this.api.post(`/meeting-requests/${id}/reject`);
    return response.data.data!;
  }

  async cancelMeetingRequest(id: string): Promise<MeetingRequest> {
    const response = await this.api.post(`/meeting-requests/${id}/cancel`);
    return response.data.data!;
  }

  async getPendingRequestsCount(): Promise<number> {
    const response = await this.api.get('/meeting-requests/pending/count');
    return response.data.data?.count || 0;
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/admin/users/${id}`);
  }

  async getStats(): Promise<any> {
    const response = await this.api.get('/admin/stats');
    return response.data.data;
  }

  async createUser(userData: { email: string; password: string; name: string; role?: string; license?: string }): Promise<User> {
    const response = await this.api.post('/admin/users', userData);
    return response.data.data!;
  }

  async updateUserLicense(id: string, license: string): Promise<User> {
    const response = await this.api.put(`/admin/users/${id}/license`, { license });
    return response.data.data!;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const response = await this.api.put(`/admin/users/${id}/role`, { role });
    return response.data.data!;
  }
}

export const apiService = new ApiService();
