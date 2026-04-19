import express, { Response, Router } from 'express';
import { Notification } from '../models/Notification.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router: Router = express.Router();

// GET /api/notifications - Get all notifications for logged-in user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(notifications);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, userId: req.userId }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.isRead = true;
        await notification.save();

        res.json(notification);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
