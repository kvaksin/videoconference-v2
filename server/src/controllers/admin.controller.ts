import { Response } from 'express';
import { db } from '../services/database.service';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { User, Meeting } from '../models';
import { ApiResponse } from '../types';

export class AdminController {
  async getAllUsers(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await db.read<User>('users');
      res.json({
        success: true,
        data: users,
      } as ApiResponse<User[]>);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async getAllMeetings(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const meetings = await db.read<Meeting>('meetings');

      res.json({
        success: true,
        data: meetings,
      } as ApiResponse<Meeting[]>);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Prevent deleting self
      if (req.user?.userId === id) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete your own account',
        } as ApiResponse);
        return;
      }

      const deleted = await db.delete<User>('users', id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async getStats(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await db.read<User>('users');
      const meetings = await db.read<Meeting>('meetings');

      const stats = {
        totalUsers: users.length,
        basicUsers: users.filter((u) => u.license === 'basic').length,
        fullUsers: users.filter((u) => u.license === 'full').length,
        totalMeetings: meetings.length,
        activeMeetings: meetings.filter((m) => m.status === 'active').length,
        scheduledMeetings: meetings.filter((m) => m.status === 'scheduled').length,
        completedMeetings: meetings.filter((m) => m.status === 'completed').length,
      };

      res.json({
        success: true,
        data: stats,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async createUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, name, role = 'user', license = 'basic' } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          error: 'Email, password, and name are required',
        } as ApiResponse);
        return;
      }

      const user = await authService.register(email, password, name, role, license);
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        data: userWithoutPassword,
      } as ApiResponse);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async updateUserLicense(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { license } = req.body;

      if (!['basic', 'full'].includes(license)) {
        res.status(400).json({
          success: false,
          error: 'Invalid license type',
        } as ApiResponse);
        return;
      }

      const users = await db.read<User>('users');
      const userIndex = users.findIndex(u => u.id === id);
      
      if (userIndex === -1) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        } as ApiResponse);
        return;
      }

      users[userIndex].license = license;
      users[userIndex].updatedAt = new Date().toISOString();

      await db.write('users', users);

      res.json({
        success: true,
        message: 'User license updated successfully',
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async updateUserRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['user', 'admin', 'agent', 'supervisor'].includes(role)) {
        res.status(400).json({
          success: false,
          error: 'Invalid role type. Must be one of: user, agent, supervisor, admin',
        } as ApiResponse);
        return;
      }

      const users = await db.read<User>('users');
      const userIndex = users.findIndex(u => u.id === id);
      
      if (userIndex === -1) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        } as ApiResponse);
        return;
      }

      const user = users[userIndex];

      // Protect the default admin user (admin@ex.com) from role changes
      if (user.email === 'admin@ex.com' && role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Cannot change the default admin user role',
        } as ApiResponse);
        return;
      }

      users[userIndex].role = role;
      users[userIndex].updatedAt = new Date().toISOString();

      await db.write('users', users);

      res.json({
        success: true,
        message: 'User role updated successfully',
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }
}

export const adminController = new AdminController();
