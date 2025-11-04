import { v4 as uuidv4 } from 'uuid';
import { db } from './database.service';
import { MeetingRequest, Meeting } from '../models';
import { meetingService } from './meeting.service';

export class MeetingRequestService {
  // Create a meeting request
  async createMeetingRequest(
    requestData: Omit<MeetingRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<MeetingRequest> {
    const request: MeetingRequest = {
      id: uuidv4(),
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.create('meetingRequests', request);
    return request;
  }

  // Get meeting requests for a user (as host)
  async getMeetingRequestsForUser(userId: string): Promise<MeetingRequest[]> {
    return await db.findMany<MeetingRequest>(
      'meetingRequests',
      (r) => r.hostId === userId
    );
  }

  // Get meeting requests by requester
  async getMeetingRequestsByRequester(requesterId: string): Promise<MeetingRequest[]> {
    return await db.findMany<MeetingRequest>(
      'meetingRequests',
      (r) => r.requesterId === requesterId
    );
  }

  // Get a specific meeting request
  async getMeetingRequest(requestId: string): Promise<MeetingRequest | null> {
    return await db.findOne<MeetingRequest>(
      'meetingRequests',
      (r) => r.id === requestId
    );
  }

  // Approve a meeting request
  async approveMeetingRequest(
    requestId: string,
    hostId: string
  ): Promise<{ request: MeetingRequest; meeting: Meeting } | null> {
    const request = await this.getMeetingRequest(requestId);
    
    if (!request || request.hostId !== hostId || request.status !== 'pending') {
      return null;
    }

    try {
      // Create the meeting
      const meeting = await meetingService.createMeeting(
        request.title,
        request.hostId,
        request.requestedAt,
        request.duration,
        request.description,
        [] // Will add participants after creation
      );

      // Update the request status
      const updatedRequest = {
        ...request,
        status: 'approved' as const,
        meetingId: meeting.id,
        updatedAt: new Date().toISOString(),
      };

      await db.update('meetingRequests', requestId, updatedRequest);

      // Add requester as participant if not a guest
      if (!request.isGuestRequest) {
        await meetingService.addParticipant(meeting.id, request.requesterId);
      }

      return { request: updatedRequest, meeting };
    } catch (error) {
      console.error('Failed to approve meeting request:', error);
      return null;
    }
  }

  // Reject a meeting request
  async rejectMeetingRequest(
    requestId: string,
    hostId: string
  ): Promise<MeetingRequest | null> {
    const request = await this.getMeetingRequest(requestId);
    
    if (!request || request.hostId !== hostId || request.status !== 'pending') {
      return null;
    }

    const updatedRequest = {
      ...request,
      status: 'rejected' as const,
      updatedAt: new Date().toISOString(),
    };

    await db.update('meetingRequests', requestId, updatedRequest);
    return updatedRequest;
  }

  // Cancel a meeting request (by requester)
  async cancelMeetingRequest(
    requestId: string,
    requesterId: string
  ): Promise<MeetingRequest | null> {
    const request = await this.getMeetingRequest(requestId);
    
    if (!request || request.requesterId !== requesterId || request.status !== 'pending') {
      return null;
    }

    const updatedRequest = {
      ...request,
      status: 'cancelled' as const,
      updatedAt: new Date().toISOString(),
    };

    await db.update('meetingRequests', requestId, updatedRequest);
    return updatedRequest;
  }

  // Update meeting request status
  async updateMeetingRequestStatus(
    requestId: string,
    status: MeetingRequest['status']
  ): Promise<MeetingRequest | null> {
    const request = await this.getMeetingRequest(requestId);
    
    if (!request) {
      return null;
    }

    const updatedRequest = {
      ...request,
      status,
      updatedAt: new Date().toISOString(),
    };

    await db.update('meetingRequests', requestId, updatedRequest);
    return updatedRequest;
  }

  // Get pending requests count for a user
  async getPendingRequestsCount(userId: string): Promise<number> {
    const requests = await db.findMany<MeetingRequest>(
      'meetingRequests',
      (r) => r.hostId === userId && r.status === 'pending'
    );
    return requests.length;
  }

  // Get all meeting requests (admin only)
  async getAllMeetingRequests(): Promise<MeetingRequest[]> {
    return await db.findMany<MeetingRequest>('meetingRequests', () => true);
  }
}

export const meetingRequestService = new MeetingRequestService();