import express, { Request, Response, Router } from 'express';
import { PetReport } from '../models/PetReport.js';
import multer from 'multer';
import path from 'path';
import { Op, fn, col, where as sequelizeWhere } from 'sequelize';
import { analyzePetImage, generatePetEmbedding } from '../config/ai.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { geocodeAddress } from '../services/geocoding.js';
import { findMatchesForReport } from '../services/matching.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { sendMatchAlertEmail } from '../services/email.js';

const router: Router = express.Router();

// Configure Multer for photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// POST /api/reports/analyze - Analyze pet image with AI
router.post('/analyze', upload.single('photo'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No photo provided' });
        }

        const analysis = await analyzePetImage(req.file.path);
        res.json(analysis);
    } catch (err) {
        console.error('AI Analysis Route Error:', err);
        res.status(500).json({ message: 'AI Analysis failed' });
    }
});

// Async background watcher
const runPassiveWatcher = async (newReportId: string) => {
    try {
        console.log(`[Passive Watcher] Starting deep scan for report ${newReportId}`);
        const matches = await findMatchesForReport(newReportId, 3, true); // Use deep scan, limit 3
        
        if (matches.length > 0) {
            const newReport = await PetReport.findByPk(newReportId);
            if (!newReport) return;

            for (const match of matches) {
                // If new report is 'found', notify the 'lost' report owner
                if (newReport.petStatus === 'found' && match.report.userId) {
                    await Notification.create({
                        userId: match.report.userId,
                        message: `High confidence match (${(match.score * 100).toFixed(0)}%) found for ${match.report.petName}!`,
                        reportId: newReport.id,
                        type: 'match_alert'
                    });

                    // Send email
                    const owner = await User.findByPk(match.report.userId);
                    if (owner) {
                        const matchUrl = `http://localhost:3005/pet/${newReport.id}`; // Hardcoded frontend URL for now, could be env
                        await sendMatchAlertEmail(owner.email, match.report.petName, matchUrl);
                    }
                }
            }
            console.log(`[Passive Watcher] Found ${matches.length} high-confidence matches.`);
        } else {
             console.log(`[Passive Watcher] No high-confidence matches found.`);
        }
    } catch (error) {
        console.error(`[Passive Watcher] Error running watcher for ${newReportId}:`, error);
    }
};

// POST /api/reports - Create a new report
router.post('/', [authMiddleware, upload.array('photos', 5)], async (req: AuthRequest, res: Response) => {
    try {
        const {
            petStatus,
            petName,
            petSpecies,
            petBreed,
            petColor,
            petAge,
            petSex,
            description,
            locationAddress,
            locationLat,
            locationLng,
            dateLastSeen,
            contactName,
            contactNumber,
            contactEmail
        } = req.body;

        const files = req.files as Express.Multer.File[];
        const photoPaths = files ? files.map(file => ({ url: `/uploads/${file.filename}` })) : [];

        // Automatic Geocoding if coordinates are missing but address is present
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

        // Generate Embedding for matching
        const embedding = await generatePetEmbedding({
            petSpecies,
            description,
            // Include other fields if they were analyzed
        });

        const newReport = await PetReport.create({
            petStatus,
            petName,
            petSpecies,
            petBreed,
            petColor,
            petAge,
            petSex,
            description,
            locationAddress,
            locationLat: finalLat,
            locationLng: finalLng,
            dateLastSeen,
            contactName,
            contactNumber,
            contactEmail,
            photos: photoPaths,
            userId: req.userId, // Associate with logged in user
            embedding
        });

        // Fire and forget the background watcher
        runPassiveWatcher(newReport.id).catch(console.error);

        // Immediate response for fast UI
        res.status(201).json({
            report: newReport,
            message: "Report created. AI is scanning for matches in the background."
        });
    } catch (err: any) {
        console.error('Error creating report:', err);
        res.status(400).json({ message: err.message });
    }
});

// GET /api/reports/:id/deep-scan - Synchronously perform deep visual scan
router.get('/:id/deep-scan', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const reportId = req.params.id as string;
        const report = await PetReport.findByPk(reportId);
        
        if (!report) {
            return res.status(404).json({ message: 'Report not found in database.' });
        }

        if (!report.photos || report.photos.length === 0) {
            return res.status(400).json({ message: 'This report has no photos to analyze.' });
        }

        const matches = await findMatchesForReport(reportId, 5, true); 
        res.json({ matches });
    } catch (err: any) {
        console.error('Deep Scan Route Error:', err);
        res.status(500).json({ message: `AI Scan failed: ${err.message}` });
    }
});

// GET /api/reports - Get all reports with optional filters and pagination
router.get('/', async (req: Request, res: Response) => {
    try {
        const { petStatus, petSpecies, petSex, petBreed, petColor, petAge, location, city, userId, page, limit } = req.query;
        let where: any = {};

        // ... filters ...
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
            where.userId = userId;
        }

        const locationQuery = (city || location) as string;
        if (locationQuery) {
            where.locationAddress = sequelizeWhere(fn('LOWER', col('locationAddress')), 'LIKE', `%${locationQuery.toLowerCase()}%`);
        }

        // Pagination Logic
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 50; // Default to all if not provided, or a high number
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

// GET /api/reports/:id - Get a specific report
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const report = await PetReport.findByPk(req.params.id as string);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json(report);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/reports/:id - Update a report
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const [updated] = await PetReport.update(req.body, {
            where: { id: req.params.id as string }
        });
        if (!updated) return res.status(404).json({ message: 'Report not found' });

        const updatedReport = await PetReport.findByPk(req.params.id as string);
        res.json(updatedReport);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/reports/:id - Delete a report
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const report = await PetReport.findByPk(req.params.id as string);
        if (!report) return res.status(404).json({ message: 'Report not found' });

        // Check ownership
        if (report.userId !== req.userId) {
            return res.status(403).json({ message: 'User not authorized to delete this report' });
        }

        await report.destroy();
        res.json({ message: 'Report deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
