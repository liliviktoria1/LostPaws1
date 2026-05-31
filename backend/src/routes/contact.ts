import { Router, Request, Response } from 'express';
import { sendSupportEmail } from '../services/email.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const success = await sendSupportEmail(email, name, subject, message);

        if (success) {
            res.status(200).json({ message: 'Message sent successfully' });
        } else {
            res.status(500).json({ message: 'Failed to send message. Please try again later.' });
        }
    } catch (error) {
        console.error('Contact route error:', error);
        res.status(500).json({ message: 'An internal error occurred' });
    }
});

export default router;
