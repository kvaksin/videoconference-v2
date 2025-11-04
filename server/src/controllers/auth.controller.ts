import { Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { LoginRequest, RegisterRequest, ApiResponse, AuthResponse } from '../types';

export class AuthController {
  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body as RegisterRequest;

      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          error: 'Email, password, and name are required',
        } as ApiResponse);
        return;
      }

      await authService.register(email, password, name);
      const { token, user: userWithoutPassword } = await authService.login(email, password);

      res.status(201).json({
        success: true,
        data: { token, user: userWithoutPassword },
      } as ApiResponse<AuthResponse>);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginRequest;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required',
        } as ApiResponse);
        return;
      }

      const { token, user } = await authService.login(email, password);

      res.json({
        success: true,
        data: { token, user },
      } as ApiResponse<AuthResponse>);
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        } as ApiResponse);
        return;
      }

      const user = await authService.getUserById(req.user.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: user,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        } as ApiResponse);
        return;
      }

      const { name } = req.body;

      if (!name) {
        res.status(400).json({
          success: false,
          error: 'Name is required',
        } as ApiResponse);
        return;
      }

      const updatedUser = await authService.updateProfile(req.user.userId, { name });

      res.json({
        success: true,
        data: updatedUser,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        } as ApiResponse);
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'Current password and new password are required',
        } as ApiResponse);
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          error: 'New password must be at least 6 characters long',
        } as ApiResponse);
        return;
      }

      await authService.changePassword(req.user.userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
      } as ApiResponse);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }
}

export const authController = new AuthController();
