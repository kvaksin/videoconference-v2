import { v4 as uuidv4 } from 'uuid';
import { db } from './database.service';
import { Availability, AvailabilitySlot } from '../models';

export class AvailabilityService {
  // Create or update user's weekly availability
  async setUserAvailability(
    userId: string,
    availability: Omit<Availability, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]
  ): Promise<Availability[]> {
    // Delete existing availability for user
    const existingAvailability = await db.findMany<Availability>(
      'availability',
      (a) => a.userId === userId
    );

    for (const existing of existingAvailability) {
      await db.delete('availability', existing.id);
    }

    // Create new availability slots
    const newAvailability: Availability[] = [];
    for (const slot of availability) {
      const availabilitySlot: Availability = {
        id: uuidv4(),
        userId,
        ...slot,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.create('availability', availabilitySlot);
      newAvailability.push(availabilitySlot);
    }

    return newAvailability;
  }

  // Get user's availability
  async getUserAvailability(userId: string): Promise<Availability[]> {
    return await db.findMany<Availability>(
      'availability',
      (a) => a.userId === userId && a.isActive
    );
  }

  // Generate available slots for a date range
  async generateAvailableSlots(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<AvailabilitySlot[]> {
    const availability = await this.getUserAvailability(userId);
    const existingSlots = await db.findMany<AvailabilitySlot>(
      'availabilitySlots',
      (s) => s.userId === userId && s.date >= startDate && s.date <= endDate
    );

    const slots: AvailabilitySlot[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      const dateStr = current.toISOString().split('T')[0];

      // Find availability for this day of week
      const dayAvailability = availability.filter(a => a.dayOfWeek === dayOfWeek);

      for (const avail of dayAvailability) {
        // Check if slots already exist for this date and time
        const existingSlot = existingSlots.find(s => 
          s.date === dateStr && 
          s.startTime === avail.startTime && 
          s.endTime === avail.endTime
        );

        if (!existingSlot) {
          // Create time slots (30min and 60min options)
          const startHour = parseInt(avail.startTime.split(':')[0]);
          const startMin = parseInt(avail.startTime.split(':')[1]);
          const endHour = parseInt(avail.endTime.split(':')[0]);
          const endMin = parseInt(avail.endTime.split(':')[1]);

          const startTime = startHour * 60 + startMin;
          const endTime = endHour * 60 + endMin;

          // Generate 30-minute slots
          for (let time = startTime; time < endTime; time += 30) {
            const slotStartHour = Math.floor(time / 60);
            const slotStartMin = time % 60;
            const slot30EndTime = time + 30;
            const slot60EndTime = time + 60;

            // 30-minute slot
            if (slot30EndTime <= endTime) {
              const slot30: AvailabilitySlot = {
                id: uuidv4(),
                userId,
                date: dateStr,
                startTime: `${slotStartHour.toString().padStart(2, '0')}:${slotStartMin.toString().padStart(2, '0')}`,
                endTime: `${Math.floor(slot30EndTime / 60).toString().padStart(2, '0')}:${(slot30EndTime % 60).toString().padStart(2, '0')}`,
                timeZone: avail.timeZone,
                isBooked: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              slots.push(slot30);
            }

            // 60-minute slot (if there's space)
            if (slot60EndTime <= endTime) {
              const slot60: AvailabilitySlot = {
                id: uuidv4(),
                userId,
                date: dateStr,
                startTime: `${slotStartHour.toString().padStart(2, '0')}:${slotStartMin.toString().padStart(2, '0')}`,
                endTime: `${Math.floor(slot60EndTime / 60).toString().padStart(2, '0')}:${(slot60EndTime % 60).toString().padStart(2, '0')}`,
                timeZone: avail.timeZone,
                isBooked: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              slots.push(slot60);
            }
          }
        } else {
          slots.push(existingSlot);
        }
      }

      current.setDate(current.getDate() + 1);
    }

    // Save new slots to database
    for (const slot of slots) {
      const existing = await db.findOne<AvailabilitySlot>(
        'availabilitySlots',
        (s) => s.id === slot.id
      );
      if (!existing) {
        await db.create('availabilitySlots', slot);
      }
    }

    return slots.filter(s => !s.isBooked);
  }

  // Book a slot
  async bookSlot(slotId: string, meetingRequestId: string): Promise<boolean> {
    const slot = await db.findOne<AvailabilitySlot>(
      'availabilitySlots',
      (s) => s.id === slotId
    );

    if (!slot || slot.isBooked) {
      return false;
    }

    const updatedSlot = {
      ...slot,
      isBooked: true,
      meetingRequestId,
      updatedAt: new Date().toISOString(),
    };

    await db.update('availabilitySlots', slotId, updatedSlot);
    return true;
  }

  // Release a booked slot
  async releaseSlot(slotId: string): Promise<boolean> {
    const slot = await db.findOne<AvailabilitySlot>(
      'availabilitySlots',
      (s) => s.id === slotId
    );

    if (!slot) {
      return false;
    }

    const updatedSlot = {
      ...slot,
      isBooked: false,
      meetingRequestId: undefined,
      updatedAt: new Date().toISOString(),
    };

    await db.update('availabilitySlots', slotId, updatedSlot);
    return true;
  }

  // Get available slots for a user in date range
  async getAvailableSlots(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<AvailabilitySlot[]> {
    return await this.generateAvailableSlots(userId, startDate, endDate);
  }
}

export const availabilityService = new AvailabilityService();