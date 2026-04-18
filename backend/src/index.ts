import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './config/database.js';
import reportRoutes from './routes/reports.js';
import authRoutes from './routes/auth.js';
import notificationRoutes from './routes/notifications.js';

console.log('---------------------------------------');
console.log('BACKEND SERVER INITIALIZING...');
console.log('---------------------------------------');

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is reachable' });
});

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Lost Paws API is running', version: '1.1' });
});

// 404 Handler (JSON)
app.use((req: Request, res: Response) => {
    console.log(`404 - Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// Error Handler
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start Server First
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
    // Then Sync Database
    sequelize.sync({ force: false })
        .then(() => {
            console.log('PostgreSQL Database connected and synced');
        })
        .catch((err: any) => {
            console.error('DATABASE CONNECTION ERROR:', err.message);
            console.log('Note: The server is running, but database features will fail until DB is fixed.');
        });
});
