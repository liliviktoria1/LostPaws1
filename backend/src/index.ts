import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import sequelize from './config/database';
import reportRoutes from './routes/reports';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/reports', reportRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('Lost Paws API (PostgreSQL) is running...');
});

// Database Sync and Server Start
sequelize.sync({ force: false }) // Use { force: true } during development if you need to drop/recreate tables
    .then(() => {
        console.log('PostgreSQL Database connected and synced');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err: any) => {
        console.error('Unable to connect to the database:', err);
    });
