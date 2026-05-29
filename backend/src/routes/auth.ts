import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { sendVerificationEmail } from '../services/email.js';
import { Op } from 'sequelize';

const router: Router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

// Helper to generate 6-digit code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, password, phoneNumber } = req.body;
        if (!req.body.email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const email = req.body.email.toLowerCase();
        console.log(`[Register] Attempting registration for: ${email}`);

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            if (existingUser.isVerified) {
                console.log(`[Register] Verified user already exists: ${email}`);
                return res.status(400).json({ message: 'User already exists and is verified' });
            } else {
                console.log(`[Register] Unverified user exists, resending code to: ${email}`);
                const newCode = generateVerificationCode();
                existingUser.verificationCode = newCode;
                existingUser.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
                await existingUser.save();
                
                const emailSent = await sendVerificationEmail(email, newCode);
                return res.status(403).json({ 
                    message: emailSent ? 'User exists but is unverified. A new code has been sent.' : 'User exists but is unverified. Email failed to send, please try resending.', 
                    email: existingUser.email, 
                    isVerified: false 
                });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification code
        const verificationCode = generateVerificationCode();
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Create user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            isVerified: false,
            verificationCode,
            verificationCodeExpires
        });
        console.log(`[Register] User created in DB: ${newUser.id}`);

        // Send verification email
        console.log(`[Register] Attempting to send verification email to: ${email}`);
        const emailSent = await sendVerificationEmail(email, verificationCode);
        
        console.log(`[Register] Registration successful for: ${email}`);
        return res.status(201).json({
            email: newUser.email,
            isVerified: false,
            message: emailSent ? 'Verification code sent to your email.' : 'Registration successful, but verification email failed to send. Please use the resend button.'
        });
    } catch (err: any) {
        console.error('[Register] Critical Error:', err);
        return res.status(500).json({ message: 'Internal Server Error during registration' });
    }
});

// Verify Email
router.post('/verify-email', async (req: Request, res: Response) => {
    try {
        let { email, code } = req.body;
        if (email) email = email.toLowerCase();
        console.log(`[VerifyEmail] Attempting verification for email: ${email} with code: ${code}`);
        
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log(`[VerifyEmail] User not found: ${email}`);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`[VerifyEmail] Stored code: ${user.verificationCode}, Expires: ${user.verificationCodeExpires}`);

        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        if (user.verificationCode !== code) {
            console.log(`[VerifyEmail] Code mismatch: stored=${user.verificationCode}, provided=${code}`);
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) {
            console.log(`[VerifyEmail] Code expired: ${user.verificationCodeExpires}`);
            return res.status(400).json({ message: 'Verification code expired' });
        }

        user.isVerified = true;
        user.verificationCode = null as any;
        user.verificationCodeExpires = null as any;
        await user.save();

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

        console.log(`[VerifyEmail] Verification successful for user ${user.id}`);
        res.json({ message: 'Email verified successfully', token, user: { id: user.id, name: user.name, email: user.email, isVerified: true } });
    } catch (err) {
        console.error('[VerifyEmail] Error:', err);
        res.status(500).json({ message: 'Verification failed' });
    }
});

// Resend Verification Code
router.post('/resend-verification', async (req: Request, res: Response) => {
    try {
        let { email } = req.body;
        if (email) email = email.toLowerCase();
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        const verificationCode = generateVerificationCode();
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        await sendVerificationEmail(user.email, verificationCode);

        res.json({ message: 'Verification code resent' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to resend code' });
    }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const password = req.body.password;
        const email = req.body.email.toLowerCase();

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

        // Check verification
        if (!user.isVerified) {
            return res.status(403).json({ 
                message: 'Please verify your email to continue', 
                email: user.email, 
                isVerified: false 
            });
        }

        // Generate token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, isVerified: true }
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
            attributes: ['id', 'name', 'email', 'phoneNumber', 'isVerified']
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
            attributes: ['id', 'name', 'email', 'phoneNumber', 'createdAt', 'isVerified']
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
            user: { id: user.id, name: user.name, email: user.email, phoneNumber: user.phoneNumber, isVerified: user.isVerified }
        });
    } catch (err) {
        res.status(500).json({ message: 'Update failed' });
    }
});

export default router;
