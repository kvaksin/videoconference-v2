import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/users', (req, res) => adminController.getAllUsers(req, res));

/**
 * @openapi
 * /api/admin/meetings:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all meetings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all meetings
 */
router.get('/meetings', (req, res) => adminController.getAllMeetings(req, res));

/**
 * @openapi
 * /api/admin/users/{id}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/users/:id', (req, res) => adminController.deleteUser(req, res));

/**
 * @openapi
 * /api/admin/stats:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get system statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 */
router.get('/stats', (req, res) => adminController.getStats(req, res));

/**
 * @openapi
 * /api/admin/users:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create a new user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 default: user
 *               license:
 *                 type: string
 *                 enum: [basic, full]
 *                 default: basic
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/users', (req, res) => adminController.createUser(req, res));

/**
 * @openapi
 * /api/admin/users/{id}/license:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update user license
 *     security:
 *       - bearerAuth: []
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
 *             required:
 *               - license
 *             properties:
 *               license:
 *                 type: string
 *                 enum: [basic, full]
 *     responses:
 *       200:
 *         description: User license updated successfully
 */
router.put('/users/:id/license', (req, res) => adminController.updateUserLicense(req, res));

/**
 * @openapi
 * /api/admin/users/{id}/role:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update user role
 *     security:
 *       - bearerAuth: []
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
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       403:
 *         description: Cannot change default admin user role
 */
router.put('/users/:id/role', (req, res) => adminController.updateUserRole(req, res));

export default router;
