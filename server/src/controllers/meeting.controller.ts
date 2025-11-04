import { Response } from 'express';
import { meetingService } from '../services/meeting.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuthRequest as OptionalAuthRequest } from '../middleware/optional-auth.middleware';
import { CreateMeetingRequest, UpdateMeetingRequest, ApiResponse } from '../types';

export class MeetingController {
  async createMeeting(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, description, scheduledAt, duration, participants } = req.body as CreateMeetingRequest;

      if (!title || !scheduledAt || !duration) {
        res.status(400).json({
          success: false,
          error: 'Title, scheduledAt, and duration are required',
        } as ApiResponse);
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        } as ApiResponse);
        return;
      }

      const meeting = await meetingService.createMeeting(
        title,
        req.user.userId,
        scheduledAt,
        duration,
        description,
        participants
      );

      res.status(201).json({
        success: true,
        data: meeting,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async getMeetings(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        } as ApiResponse);
        return;
      }

      const meetings = await meetingService.getMeetingsByUser(req.user.userId);

      res.json({
        success: true,
        data: meetings,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async getMeeting(req: OptionalAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const meeting = await meetingService.getMeetingById(id);

      if (!meeting) {
        res.status(404).json({
          success: false,
          error: 'Meeting not found',
        } as ApiResponse);
        return;
      }

      // For guest users, return limited meeting info (but include roomId for joining)
      const meetingData = req.isGuest ? {
        id: meeting.id,
        title: meeting.title,
        description: meeting.description,
        scheduledAt: meeting.scheduledAt,
        duration: meeting.duration,
        status: meeting.status,
        roomId: meeting.roomId, // Guests need this to join the correct room
      } : meeting;

      res.json({
        success: true,
        data: meetingData,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async joinMeeting(req: OptionalAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { guestName } = req.body;

      const meeting = await meetingService.getMeetingById(id);

      if (!meeting) {
        res.status(404).json({
          success: false,
          error: 'Meeting not found',
        } as ApiResponse);
        return;
      }

      // Validate guest name if user is joining as guest
      if (req.isGuest && (!guestName || guestName.trim().length === 0)) {
        res.status(400).json({
          success: false,
          error: 'Guest name is required',
        } as ApiResponse);
        return;
      }

      // Return participant info
      const participantInfo = {
        meetingId: meeting.id,
        participantName: req.isGuest ? guestName.trim() : req.user?.email,
        isGuest: req.isGuest,
        userId: req.user?.userId || null,
        joinedAt: new Date().toISOString(),
      };

      res.json({
        success: true,
        data: {
          meeting: {
            id: meeting.id,
            title: meeting.title,
            description: meeting.description,
            status: meeting.status,
          },
          participant: participantInfo,
        },
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async updateMeeting(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body as UpdateMeetingRequest;

      const meeting = await meetingService.updateMeeting(id, updates);

      if (!meeting) {
        res.status(404).json({
          success: false,
          error: 'Meeting not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: meeting,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async deleteMeeting(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await meetingService.deleteMeeting(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Meeting not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Meeting deleted successfully',
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async startMeeting(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const meeting = await meetingService.startMeeting(id);

      if (!meeting) {
        res.status(404).json({
          success: false,
          error: 'Meeting not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: meeting,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async endMeeting(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const meeting = await meetingService.endMeeting(id);

      if (!meeting) {
        res.status(404).json({
          success: false,
          error: 'Meeting not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: meeting,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }
}

export const meetingController = new MeetingController();
