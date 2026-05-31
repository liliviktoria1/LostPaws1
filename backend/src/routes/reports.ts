import express, { Request, Response, Router } from 'express';
import { PetReport } from '../models/PetReport.js';
import multer from 'multer';
import path from 'path';
import { Op, fn, col, where as sequelizeWhere } from 'sequelize';
import { analyzePetImage, generatePetEmbedding } from '../config/ai.js';
import { authMiddleware, verifiedMiddleware, AuthRequest } from '../middleware/auth.js';
import { geocodeAddress } from '../services/geocoding.js';
import { findMatchesForReport } from '../services/matching.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { sendMatchAlertEmail } from '../services/email.js';

import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

const router: Router = express.Router();

// Configure Multer for photo uploads (Temporary local storage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Helper to upload to Cloudinary and delete local file
const uploadToCloudinary = async (filePath: string) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'lost_paws_reports',
        });
        // Delete local file after upload
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw error;
    }
};

// POST /api/reports/analyze - Analyze pet image with AI
router.post('/analyze', upload.single('photo'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No photo provided' });
        }

        const lang = (req.headers['x-lang'] as string) || 'en';
        const analysis = await analyzePetImage(req.file.path, lang);
        
        // We don't save to Cloudinary here as it's just for analysis during report creation
        // But we should delete the temp file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.json(analysis);
    } catch (err) {
        console.error('AI Analysis Route Error:', err);
        res.status(500).json({ message: 'AI Analysis failed' });
    }
});

// Async background watcher
const runPassiveWatcher = async (newReportId: string, lang: string = 'en') => {
    try {
        console.log(`[Passive Watcher] Starting deep scan for report ${newReportId} with lang ${lang}`);
        const matches = await findMatchesForReport(newReportId, 3, true, lang); 
        
        if (matches.length > 0) {
            const newReport = await PetReport.findByPk(newReportId);
            if (!newReport) return;

            for (const match of matches) {
                // Only notify if confidence is 80% or higher
                if (match.score < 0.8) {
                    console.log(`[Passive Watcher] Skipping match for ${newReportId} due to low confidence: ${(match.score * 100).toFixed(1)}%`);
                    continue;
                }

                console.log(`[Passive Watcher] High confidence match found: ${(match.score * 100).toFixed(1)}%`);

                let targetUserId = null;
                let targetReportId = null;
                let petName = '';

                // Case A: Someone found a pet -> Notify the person who lost a similar pet
                if (newReport.petStatus === 'found' && match.report.userId) {
                    targetUserId = match.report.userId;
                    targetReportId = newReport.id; // Link to the found report
                    petName = match.report.petName;
                } 
                // Case B: Someone lost a pet -> Notify them about existing found matches
                else if (newReport.petStatus === 'lost' && newReport.userId) {
                    targetUserId = newReport.userId;
                    targetReportId = match.report.id; // Link to the found report
                    petName = newReport.petName;
                }

                if (targetUserId && targetReportId) {
                    const confidence = (match.score * 100).toFixed(0);
                    const message = lang === 'ua' 
                        ? `Знайдено потенційний збіг (${confidence}%) для вашого улюбленця ${petName}!`
                        : `High confidence match (${confidence}%) found for your pet ${petName}!`;

                    await Notification.create({
                        userId: targetUserId,
                        message,
                        reportId: targetReportId,
                        type: 'match_alert'
                    });

                    const owner = await User.findByPk(targetUserId);
                    if (owner) {
                        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3005';
                        const matchUrl = `${frontendUrl.replace(/\/$/, '')}/pet/${targetReportId}`;
                        await sendMatchAlertEmail(owner.email, petName, matchUrl);
                    }
                }
            }
        }
    } catch (error) {
        console.error(`[Passive Watcher] Error running watcher for ${newReportId}:`, error);
    }
};

// POST /api/reports - Create a new report
router.post('/', [authMiddleware, verifiedMiddleware, upload.array('photos', 20)], async (req: AuthRequest, res: Response) => {
    try {
        const {
            petStatus, petName, petSpecies, petBreed, petColor, petAge, petSex,
            description, locationAddress, locationLat, locationLng, dateLastSeen,
            contactName, contactNumber, contactEmail
        } = req.body;

        const lang = (req.headers['x-lang'] as string) || 'en';
        const files = req.files as Express.Multer.File[];
        
        // Upload each file to Cloudinary
        const photoPaths = [];
        if (files) {
            for (const file of files) {
                const url = await uploadToCloudinary(file.path);
                photoPaths.push({ url });
            }
        }

        let finalLat = locationLat ? parseFloat(locationLat) : undefined;
        let finalLng = locationLng ? parseFloat(locationLng) : undefined;

        if (!finalLat || !finalLng) {
            if (locationAddress) {
                const geo = await geocodeAddress(locationAddress);
                if (geo) {
                    finalLat = geo.lat;
                    finalLng = geo.lng;
                }
            }
        }

        const embedding = await generatePetEmbedding({ petSpecies, description });

        const newReport = await PetReport.create({
            petStatus, 
            petName: petName || 'Unknown', 
            petSpecies, 
            petBreed, 
            petColor, 
            petAge, 
            petSex,
            description, locationAddress, locationLat: finalLat, locationLng: finalLng,
            dateLastSeen, contactName, contactNumber, contactEmail,
            photos: photoPaths,
            userId: req.userId,
            embedding,
            isReunited: false
        });

        // Trigger passive watcher (AI matching)
        runPassiveWatcher(newReport.id, lang);

        res.status(201).json({
            report: newReport,
            message: "Report created successfully."
        });
    } catch (err: any) {
        // Cleanup files if error occurred
        const files = req.files as Express.Multer.File[];
        if (files) {
            files.forEach(f => {
                if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
            });
        }
        res.status(400).json({ message: err.message });
    }
});

// GET /api/reports/:id/deep-scan
router.get('/:id/deep-scan', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const reportId = req.params.id as string;
        const lang = (req.headers['x-lang'] as string) || 'en';
        const report = await PetReport.findByPk(reportId);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        if (!report.photos || report.photos.length === 0) return res.status(400).json({ message: 'No photos to analyze' });

        const matches = await findMatchesForReport(reportId, 5, true, lang); 
        res.json({ matches });
    } catch (err: any) {
        res.status(500).json({ message: `AI Scan failed: ${err.message}` });
    }
});

// GET /api/reports - Get all reports with filters, pagination, and reunited status
router.get('/', async (req: Request, res: Response) => {
    try {
        const { petStatus, petSpecies, petSex, petBreed, petColor, petAge, city, location, userId, page, limit, isReunited } = req.query;
        let where: any = {};

        if (isReunited === 'true') {
            where.isReunited = true;
        } else if (isReunited === 'false') {
            where.isReunited = false;
        } else if (!userId) {
            where.isReunited = false;
        }

        if (petStatus) where.petStatus = petStatus;
        if (petSpecies) where.petSpecies = petSpecies;
        if (petSex) where.petSex = petSex;
        if (petAge) where.petAge = petAge;

        if (petBreed) {
            where.petBreed = sequelizeWhere(fn('LOWER', col('petBreed')), 'LIKE', `%${(petBreed as string).toLowerCase()}%`);
        }
        if (petColor) {
            where.petColor = sequelizeWhere(fn('LOWER', col('petColor')), 'LIKE', `%${(petColor as string).toLowerCase()}%`);
        }
        
        if (userId && userId !== 'undefined') {
            where.userId = userId as string;
        }

        const locQuery = (city || location) as string;
        if (locQuery) {
            where.locationAddress = sequelizeWhere(fn('LOWER', col('locationAddress')), 'LIKE', `%${locQuery.toLowerCase()}%`);
        }

        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 50;
        const offset = (pageNum - 1) * limitNum;

        const { count, rows: reports } = await PetReport.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset: offset
        });
        
        res.json({
            total: count,
            totalPages: Math.ceil(count / limitNum),
            currentPage: pageNum,
            reports
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/reports/:id/reunited - Owners only
router.patch('/:id/reunited', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const reportId = req.params.id as string;
        const report = await PetReport.findOne({
            where: { id: reportId, userId: req.userId }
        });

        if (!report) return res.status(404).json({ message: 'Unauthorized or report not found' });

        report.isReunited = true;
        await report.save();

        res.json({ message: 'Pet marked as reunited!', report });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const reportId = req.params.id as string;
        const report = await PetReport.findByPk(reportId, {
            include: [{ model: User, as: 'user', attributes: ['name', 'phoneNumber', 'email'] }]
        });
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json(report);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/:id', [authMiddleware, upload.array('photos', 20)], async (req: AuthRequest, res: Response) => {
    try {
        const reportId = req.params.id as string;
        const report = await PetReport.findOne({
            where: { id: reportId, userId: req.userId }
        });

        if (!report) return res.status(404).json({ message: 'Report not found or unauthorized' });

        const updateData = { ...req.body };
        
        const files = req.files as Express.Multer.File[];
        
        let currentPhotos = report.photos || [];
        if (req.body.existingPhotos) {
            try {
                currentPhotos = JSON.parse(req.body.existingPhotos);
            } catch (e) {
                console.error("Error parsing existingPhotos:", e);
            }
        }

        const newFilesCount = files ? files.length : 0;

        if (currentPhotos.length + newFilesCount > 20) {
            // Cleanup uploaded files if limit exceeded
            if (files) {
                files.forEach(f => {
                    if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
                });
            }
            return res.status(400).json({ message: 'Maximum 20 photos allowed per report' });
        }

        if (files && files.length > 0) {
            const newPhotos = [];
            for (const file of files) {
                const url = await uploadToCloudinary(file.path);
                newPhotos.push({ url });
            }
            currentPhotos = [...currentPhotos, ...newPhotos];
        }

        updateData.photos = currentPhotos;
        delete updateData.existingPhotos; // Don't save this field to DB

        await report.update(updateData);
        res.json(report);
    } catch (err: any) {
        // Cleanup files if error occurred
        const files = req.files as Express.Multer.File[];
        if (files) {
            files.forEach(f => {
                if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
            });
        }
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const reportId = req.params.id as string;
        const userId = req.userId;

        // Fetch the user to check their role
        const user = await User.findByPk(userId);
        const isAdmin = user && user.role === 'admin';

        const whereCondition: any = { id: reportId };
        
        // If not admin, restrict to reports owned by this user
        if (!isAdmin) {
            whereCondition.userId = userId;
        }

        const deleted = await PetReport.destroy({
            where: whereCondition
        });

        if (!deleted) return res.status(404).json({ message: 'Report not found or unauthorized' });
        res.json({ message: 'Deleted' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
