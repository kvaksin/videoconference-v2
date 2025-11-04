import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuthRequest as OptionalAuthRequest } from '../middleware/optional-auth.middleware';
import { availabilityService } from '../services/availability.service';
import { ApiResponse } from '../types';

export class AvailabilityController {
  // Set user availability
  async setAvailability(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        } as ApiResponse);
        return;
      }

      const { availability } = req.body;

      if (!Array.isArray(availability)) {
        res.status(400).json({
          success: false,
          error: 'Availability must be an array',
        } as ApiResponse);
        return;
      }

      const result = await availabilityService.setUserAvailability(
        req.user.userId,
        availability
      );

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

  // Get user availability
  async getAvailability(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        } as ApiResponse);
        return;
      }

      const availability = await availabilityService.getUserAvailability(req.user.userId);

      res.json({
        success: true,
        data: availability,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  // Get available slots for a user (public endpoint for booking)
  async getAvailableSlots(req: OptionalAuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };

      if (!userId || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'userId, startDate, and endDate are required',
        } as ApiResponse);
        return;
      }

      const slots = await availabilityService.getAvailableSlots(
        userId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: slots,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  // Get user's own available slots
  async getMyAvailableSlots(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        } as ApiResponse);
        return;
      }

      const { startDate, endDate } = req.query as { startDate: string; endDate: string };

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'startDate and endDate are required',
        } as ApiResponse);
        return;
      }

      const slots = await availabilityService.getAvailableSlots(
        req.user.userId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: slots,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }
}

export const availabilityController = new AvailabilityController();