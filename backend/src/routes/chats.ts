import express, { Response, Router } from 'express';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router: Router = express.Router();

// GET /api/chats - Get user's conversations
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { user1Id: req.userId },
                    { user2Id: req.userId }
                ]
            },
            order: [['lastMessageAt', 'DESC']]
        });

        // Enrich with participant info
        const enriched = await Promise.all(conversations.map(async (conv) => {
            const otherUserId = conv.user1Id === req.userId ? conv.user2Id : conv.user1Id;
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
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { recipientId, reportId } = req.body;

        if (recipientId === req.userId) {
            return res.status(400).json({ message: "Cannot chat with yourself" });
        }

        // Check if exists
        let conversation = await Conversation.findOne({
            where: {
                [Op.or]: [
                    { user1Id: req.userId, user2Id: recipientId },
                    { user1Id: recipientId, user2Id: req.userId }
                ]
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                user1Id: req.userId!,
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
router.get('/:id/messages', authMiddleware, async (req: AuthRequest, res: Response) => {
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
router.post('/:id/messages', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const conversationId = req.params.id as string;
        const { content } = req.body;
        
        const message = await Message.create({
            conversationId,
            senderId: req.userId!,
            content
        });

        // Update conversation last message
        await Conversation.update({
            lastMessage: content,
            lastMessageAt: new Date()
        }, {
            where: { id: conversationId }
        });

        res.status(201).json(message);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
