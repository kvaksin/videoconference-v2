import { Router } from 'express';
import { meetingController } from '../controllers/meeting.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { optionalAuthMiddleware } from '../middleware/optional-auth.middleware';

const router = Router();

// Routes that require authentication
router.get('/', authMiddleware, (req, res) => meetingController.getMeetings(req, res));
router.post('/', authMiddleware, (req, res) => meetingController.createMeeting(req, res));
router.put('/:id', authMiddleware, (req, res) => meetingController.updateMeeting(req, res));
router.delete('/:id', authMiddleware, (req, res) => meetingController.deleteMeeting(req, res));
router.post('/:id/start', authMiddleware, (req, res) => meetingController.startMeeting(req, res));
router.post('/:id/end', authMiddleware, (req, res) => meetingController.endMeeting(req, res));

// Routes that allow guest access
router.get('/:id', optionalAuthMiddleware, (req, res) => meetingController.getMeeting(req, res));
router.post('/:id/join', optionalAuthMiddleware, (req, res) => meetingController.joinMeeting(req, res));

/**
 * @openapi
 * /api/meetings:
 *   get:
 *     tags:
 *       - Meetings
 *     summary: Get user's meetings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of meetings
 */

/**
 * @openapi
 * /api/meetings:
 *   post:
 *     tags:
 *       - Meetings
 *     summary: Create a new meeting
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - scheduledAt
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: number
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Meeting created successfully
 */

/**
 * @openapi
 * /api/meetings/{id}:
 *   get:
 *     tags:
 *       - Meetings
 *     summary: Get meeting by ID (guest access allowed)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meeting details
 */

/**
 * @openapi
 * /api/meetings/{id}/join:
 *   post:
 *     tags:
 *       - Meetings
 *     summary: Join meeting as guest or authenticated user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               guestName:
 *                 type: string
 *                 description: Name for guest users
 *     responses:
 *       200:
 *         description: Successfully joined meeting
 */

export default router;
