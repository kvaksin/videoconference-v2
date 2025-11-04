import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from './database.service';
import { User } from '../models';
import { config } from '../config';

export class AuthService {
  async register(email: string, password: string, name: string, role: 'admin' | 'user' = 'user', license: 'basic' | 'full' = 'basic'): Promise<User> {
    // Check if user already exists
    const existingUser = await db.findOne<User>('users', (u) => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user: User = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      role,
      license,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.create('users', user);
    return user;
  }

  async login(email: string, password: string): Promise<{ token: string; user: Omit<User, 'password'> }> {
    // Find user
    const user = await db.findOne<User>('users', (u) => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  async verifyToken(token: string): Promise<{ userId: string; email: string; role: string }> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await db.findOne<User>('users', (u) => u.id === userId);
    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, data: { name: string }): Promise<Omit<User, 'password'>> {
    const users = await db.read<User>('users');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex].name = data.name;
    users[userIndex].updatedAt = new Date().toISOString();

    await db.write('users', users);

    const { password: _, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const users = await db.read<User>('users');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const user = users[userIndex];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    users[userIndex].password = hashedNewPassword;
    users[userIndex].updatedAt = new Date().toISOString();

    await db.write('users', users);
  }

  async initializeAdmin(): Promise<void> {
    const adminExists = await db.findOne<User>('users', (u) => u.role === 'admin');
    
    if (!adminExists) {
      console.log('Creating default admin user...');
      await this.register(config.adminEmail, config.adminPassword, 'Administrator', 'admin', 'full');
      console.log(`Admin user created: ${config.adminEmail}`);
    }
  }
}

export const authService = new AuthService();
