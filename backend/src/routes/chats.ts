import express, { Response, Router } from 'express';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { authMiddleware, verifiedMiddleware, AuthRequest } from '../middleware/auth.js';
import { sendNotificationEmail } from '../services/email.js';
import { Op } from 'sequelize';

const router: Router = express.Router();

// GET /api/chats - Get user's conversations
router.get('/', [authMiddleware, verifiedMiddleware], async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId as string;
        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { user1Id: userId },
                    { user2Id: userId }
                ]
            },
            order: [['lastMessageAt', 'DESC']]
        });

        // Enrich with participant info
        const enriched = await Promise.all(conversations.map(async (conv) => {
            const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
            const otherUser = await User.findByPk(otherUserId, {
                attributes: ['id', 'name', 'email']
            });
            return {
                ...conv.toJSON(),
                otherUser
            };
        }));

        res.json(enriched);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/chats - Start or get a conversation
router.post('/', [authMiddleware, verifiedMiddleware], async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId as string;
        const { recipientId, reportId } = req.body;

        if (recipientId === userId) {
            return res.status(400).json({ message: "Cannot chat with yourself" });
        }

        // Check if exists
        let conversation = await Conversation.findOne({
            where: {
                [Op.or]: [
                    { user1Id: userId, user2Id: recipientId },
                    { user1Id: recipientId, user2Id: userId }
                ]
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                user1Id: userId,
                user2Id: recipientId,
                reportId
            });
        }

        res.status(201).json(conversation);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/chats/:id/messages - Get messages
router.get('/:id/messages', [authMiddleware, verifiedMiddleware], async (req: AuthRequest, res: Response) => {
    try {
        const conversationId = req.params.id as string;
        const messages = await Message.findAll({
            where: { conversationId },
            order: [['createdAt', 'ASC']]
        });
        res.json(messages);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/chats/:id/messages - Send message
router.post('/:id/messages', [authMiddleware, verifiedMiddleware], async (req: AuthRequest, res: Response) => {
    try {
        const conversationId = req.params.id as string;
        const userId = req.userId as string;
        const { content } = req.body;
        
        const message = await Message.create({
            conversationId,
            senderId: userId,
            content
        });

        // Update conversation last message
        await Conversation.update({
            lastMessage: content,
            lastMessageAt: new Date()
        }, {
            where: { id: conversationId }
        });

        // NOTIFICATION LOGIC: Notify recipient
        const conversation = await Conversation.findByPk(conversationId);
        if (conversation) {
            const recipientId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
            const sender = await User.findByPk(userId, { attributes: ['name'] });
            const recipient = await User.findByPk(recipientId, { attributes: ['email'] });

            await Notification.create({
                userId: recipientId,
                message: `New message from ${sender?.name || 'User'}`,
                type: 'chat_message',
                reportId: conversation.reportId
            });

            if (recipient) {
                await sendNotificationEmail(
                    recipient.email,
                    'New Message on Lost Paws',
                    `You have received a new message from <strong>${sender?.name || 'User'}</strong>.`
                );
            }
        }

        res.status(201).json(message);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
