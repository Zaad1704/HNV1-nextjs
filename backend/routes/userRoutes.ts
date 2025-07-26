import express from 'express';
import { requireRole, requireOrganization } from '../middleware/auth';

const router = express.Router();

// All routes are protected by authMiddleware (applied in server.ts)

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users in organization
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', requireOrganization, async (req, res) => {
  res.json({
    success: true,
    message: 'Users endpoint - Coming soon',
    data: []
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User details
 */
router.get('/:id', requireOrganization, async (req, res) => {
  res.json({
    success: true,
    message: 'User details endpoint - Coming soon',
    data: null
  });
});

export default router;