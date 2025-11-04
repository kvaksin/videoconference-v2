import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
  isGuest?: boolean;
}

export const optionalAuthMiddleware = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    // No token provided - continue as guest
    req.isGuest = true;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    req.isGuest = false;
    next();
  } catch (error) {
    // Invalid token - continue as guest
    req.isGuest = true;
    next();
  }
};