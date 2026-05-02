import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import sequelize from './config/database.js';

// Models (Importing FIRST to ensure registration)
import './models/User.js';
import './models/PetReport.js';
import './models/Notification.js';
import './models/Conversation.js';
import './models/Message.js';

// Routes
import reportRoutes from './routes/reports.js';
import authRoutes from './routes/auth.js';
import notificationRoutes from './routes/notifications.js';
import chatRoutes from './routes/chats.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3005",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chats', chatRoutes);

// Socket.io Real-time Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_conversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`User ${socket.id} joined room: ${conversationId}`);
    });

    socket.on('send_message', (data) => {
        socket.to(data.conversationId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Database Sync & Server Start
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synced');
        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err: any) => {
        console.error('DATABASE ERROR:', err.message);
    });
