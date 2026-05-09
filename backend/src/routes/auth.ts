import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router: Router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

// Register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, email, password, phoneNumber } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber
        });

        // Generate token
        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });
    } catch (err: any) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (err: any) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Verify Token
router.get('/verify', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: ['id', 'name', 'email', 'phoneNumber']
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err: any) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: ['id', 'name', 'email', 'phoneNumber', 'createdAt']
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Profile
router.patch('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { name, phoneNumber, password } = req.body;
        const user = await User.findByPk(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        
        res.json({
            message: 'Profile updated successfully',
            user: { id: user.id, name: user.name, email: user.email, phoneNumber: user.phoneNumber }
        });
    } catch (err) {
        res.status(500).json({ message: 'Update failed' });
    }
});

export default router;
