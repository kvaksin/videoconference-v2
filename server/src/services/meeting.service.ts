import { v4 as uuidv4 } from 'uuid';
import { db } from './database.service';
import { Meeting } from '../models';

export class MeetingService {
  async createMeeting(
    title: string,
    hostId: string,
    scheduledAt: string,
    duration: number,
    description?: string,
    participants?: string[]
  ): Promise<Meeting> {
    const meeting: Meeting = {
      id: uuidv4(),
      title,
      description,
      hostId,
      scheduledAt,
      duration,
      participants: participants || [],
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.create('meetings', meeting);
    return meeting;
  }

  async getMeetingById(id: string): Promise<Meeting | null> {
    return await db.findOne<Meeting>('meetings', (m) => m.id === id);
  }

  async getMeetingsByUser(userId: string): Promise<Meeting[]> {
    return await db.findMany<Meeting>(
      'meetings',
      (m) => m.hostId === userId || m.participants.includes(userId)
    );
  }

  async getAllMeetings(): Promise<Meeting[]> {
    return await db.read<Meeting>('meetings');
  }

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting | null> {
    const updatedMeeting = await db.update<Meeting>('meetings', id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return updatedMeeting;
  }

  async deleteMeeting(id: string): Promise<boolean> {
    return await db.delete<Meeting>('meetings', id);
  }

  async startMeeting(id: string): Promise<Meeting | null> {
    const roomId = uuidv4();
    return await this.updateMeeting(id, {
      status: 'active',
      roomId,
    });
  }

  async endMeeting(id: string): Promise<Meeting | null> {
    return await this.updateMeeting(id, {
      status: 'completed',
    });
  }

  async addParticipant(meetingId: string, userId: string): Promise<Meeting | null> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) {
      return null;
    }

    if (!meeting.participants.includes(userId)) {
      meeting.participants.push(userId);
      return await this.updateMeeting(meetingId, { participants: meeting.participants });
    }

    return meeting;
  }

  async removeParticipant(meetingId: string, userId: string): Promise<Meeting | null> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) {
      return null;
    }

    const participants = meeting.participants.filter((id) => id !== userId);
    return await this.updateMeeting(meetingId, { participants });
  }
}

export const meetingService = new MeetingService();
