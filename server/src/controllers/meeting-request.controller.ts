import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuthRequest as OptionalAuthRequest } from '../middleware/optional-auth.middleware';
import { meetingRequestService } from '../services/meeting-request.service';
import { ApiResponse } from '../types';

export class MeetingRequestController {
  // Create a meeting request
  async createMeetingRequest(req: OptionalAuthRequest, res: Response): Promise<void> {
    try {
      const {
        hostId,
        title,
        description,
        requestedAt,
        duration,
        requesterName,
        requesterEmail,
        isGuestRequest
      } = req.body;

      if (!hostId || !title || !requestedAt || !duration || !requesterName) {
        res.status(400).json({
          success: false,
          error: 'hostId, title, requestedAt, duration, and requesterName are required',
        } as ApiResponse);
        return;
      }

      if (![30, 60].includes(duration)) {
        res.status(400).json({
          success: false,
          error: 'Duration must be 30 or 60 minutes',
        } as ApiResponse);
        return;
      }

      const requesterId = req.user?.userId || `guest-${Date.now()}`;

      const request = await meetingRequestService.createMeetingRequest({
        requesterId,
        requesterName,
        requesterEmail,
        hostId,
        title,
        description,
        requestedAt,
        duration,
        isGuestRequest: isGuestRequest || !req.user,
      });

      res.status(201).json({
        success: true,
        data: request,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  // Get meeting requests for current user (as host)
  async getMyMeetingRequests(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        } as ApiResponse);
        return;
      }

      const requests = await meetingRequestService.getMeetingRequestsForUser(req.user.userId);

      res.json({
        success: true,
        data: requests,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  // Get meeting requests made by current user
  async getMyRequestsMade(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        } as ApiResponse);
        return;
      }

      const requests = await meetingRequestService.getMeetingRequestsByRequester(req.user.userId);

      res.json({
        success: true,
        data: requests,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  // Get a specific meeting request
  async getMeetingRequest(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        } as ApiResponse);
        return;
      }

      const request = await meetingRequestService.getMeetingRequest(id);

      if (!request) {
        res.status(404).json({
          success: false,
          error: 'Meeting request not found',
        } as ApiResponse);
        return;
      }

      // Check if user has permission to view this request
      if (request.hostId !== req.user.userId && request.requesterId !== req.user.userId) {
        res.status(403).json({
          success: false,
          error: 'Not authorized to view this request',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: request,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  // Approve a meeting request
  async approveMeetingRequest(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        } as ApiResponse);
        return;
      }

      const result = await meetingRequestService.approveMeetingRequest(id, req.user.userId);

      if (!result) {
        res.status(400).json({
          success: false,
          error: 'Cannot approve this request',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: result,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  // Reject a meeting request
  async rejectMeetingRequest(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        } as ApiResponse);
        return;
      }

      const request = await meetingRequestService.rejectMeetingRequest(id, req.user.userId);

      if (!request) {
        res.status(400).json({
          success: false,
          error: 'Cannot reject this request',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: request,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  // Cancel a meeting request (by requester)
  async cancelMeetingRequest(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        } as ApiResponse);
        return;
      }

      const request = await meetingRequestService.cancelMeetingRequest(id, req.user.userId);

      if (!request) {
        res.status(400).json({
          success: false,
          error: 'Cannot cancel this request',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: request,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  // Get pending requests count
  async getPendingCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        } as ApiResponse);
        return;
      }

      const count = await meetingRequestService.getPendingRequestsCount(req.user.userId);

      res.json({
        success: true,
        data: { count },
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }
}

export const meetingRequestController = new MeetingRequestController();