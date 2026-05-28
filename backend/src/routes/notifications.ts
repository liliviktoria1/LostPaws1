import express, { Response, Router } from 'express';
import { Notification } from '../models/Notification.js';
import { authMiddleware, verifiedMiddleware, AuthRequest } from '../middleware/auth.js';

const router: Router = express.Router();

// GET /api/notifications - Get all notifications for logged-in user
router.get('/', [authMiddleware, verifiedMiddleware], async (req: AuthRequest, res: Response) => {
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

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        await Notification.update(
            { isRead: true },
            { where: { userId: req.userId, isRead: false } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const deleted = await Notification.destroy({
            where: { id: req.params.id, userId: req.userId }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/notifications - Clear all notifications
router.delete('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        await Notification.destroy({
            where: { userId: req.userId }
        });
        res.json({ message: 'All notifications cleared' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
