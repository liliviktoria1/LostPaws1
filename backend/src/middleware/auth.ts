import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

export interface AuthRequest extends Request {
    userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            console.log('Auth Failed: No token provided');
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);
        console.log('Auth Success: User ID', decoded.userId);
        req.userId = decoded.userId;
        next();
    } catch (err: any) {
        console.error('Auth Middleware Error:', err.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export const verifiedMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await User.findByPk(req.userId);
        if (!user || !user.isVerified) {
            return res.status(403).json({ message: 'Email verification required' });
        }

        next();
    } catch (err: any) {
        res.status(500).json({ message: 'Server Error' });
    }
};
