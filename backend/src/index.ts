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
import contactRoutes from './routes/contact.js';

import fs from 'fs';

const app = express();
const httpServer = createServer(app);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

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

// Health Check for Render/Cloud
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Routes
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/contact', contactRoutes);

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
const startServer = async () => {
    try {
        // Start listening immediately so Render/cloud health checks pass
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server is listening on port ${PORT}`);
            console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // Then sync database
        console.log('⏳ Syncing database...');
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced successfully');
        
    } catch (err: any) {
        console.error('❌ FATAL ERROR DURING STARTUP:');
        console.error(err); // Log the full error object for better debugging
        
        // If it's a database error, provide specific tips
        if (err.name?.includes('SequelizeConnection') || err.name?.includes('ConnectionError')) {
            console.error('👉 Tip: Ensure your PostgreSQL service is running and accessible.');
            console.error('👉 Tip: Check your DATABASE_URL and ensure SSL is enabled if required.');
        }
    }
};

startServer();
