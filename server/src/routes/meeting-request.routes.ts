import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { optionalAuthMiddleware } from '../middleware/optional-auth.middleware';
import { meetingRequestController } from '../controllers/meeting-request.controller';

const router = express.Router();

// Create a meeting request (authenticated or guest)
router.post('/', optionalAuthMiddleware, (req, res) => meetingRequestController.createMeetingRequest(req, res));

// Get meeting requests for current user (as host)
router.get('/', authMiddleware, (req, res) => meetingRequestController.getMyMeetingRequests(req, res));

// Get meeting requests made by current user
router.get('/made', authMiddleware, (req, res) => meetingRequestController.getMyRequestsMade(req, res));

// Get pending requests count
router.get('/pending/count', authMiddleware, (req, res) => meetingRequestController.getPendingCount(req, res));

// Get specific meeting request
router.get('/:id', authMiddleware, (req, res) => meetingRequestController.getMeetingRequest(req, res));

// Approve a meeting request
router.post('/:id/approve', authMiddleware, (req, res) => meetingRequestController.approveMeetingRequest(req, res));

// Reject a meeting request
router.post('/:id/reject', authMiddleware, (req, res) => meetingRequestController.rejectMeetingRequest(req, res));

// Cancel a meeting request
router.post('/:id/cancel', authMiddleware, (req, res) => meetingRequestController.cancelMeetingRequest(req, res));

export default router;