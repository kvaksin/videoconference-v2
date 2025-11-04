import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { optionalAuthMiddleware } from '../middleware/optional-auth.middleware';
import { availabilityController } from '../controllers/availability.controller';

const router = express.Router();

// Set user availability (authenticated only)
router.put('/', authMiddleware, (req, res) => availabilityController.setAvailability(req, res));

// Get user's own availability
router.get('/', authMiddleware, (req, res) => availabilityController.getAvailability(req, res));

// Get user's own available slots
router.get('/slots', authMiddleware, (req, res) => availabilityController.getMyAvailableSlots(req, res));

// Get available slots for a specific user (public for booking)
router.get('/:userId/slots', optionalAuthMiddleware, (req, res) => availabilityController.getAvailableSlots(req, res));

export default router;