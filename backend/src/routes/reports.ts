import express, { Request, Response, Router } from 'express';
import PetReport from '../models/PetReport.js';
import multer from 'multer';
import path from 'path';
import { Op } from 'sequelize';
import { analyzePetImage, generatePetEmbedding } from '../config/ai.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

import { geocodeAddress } from '../services/geocoding.js';
import { findMatchesForReport } from '../services/matching.js';

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

// POST /api/reports - Create a new report
router.post('/', [authMiddleware, upload.array('photos', 5)], async (req: AuthRequest, res: Response) => {
    try {
        const {
            petStatus,
            petName,
            petSpecies,
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

        // Find potential matches
        const matches = await findMatchesForReport(newReport.id);

        res.status(201).json({
            report: newReport,
            potentialMatches: matches
        });
    } catch (err: any) {
        console.error('Error creating report:', err);
        res.status(400).json({ message: err.message });
    }
});

// GET /api/reports - Get all reports with optional filters
router.get('/', async (req: Request, res: Response) => {
    try {
        const { petStatus, petSpecies, petSex, location } = req.query;
        let where: any = {};

        if (petStatus) where.petStatus = petStatus;
        if (petSpecies) where.petSpecies = petSpecies;
        if (petSex) where.petSex = petSex;
        if (location) {
            where.locationAddress = { [Op.iLike]: `%${location}%` };
        }

        const reports = await PetReport.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });
        res.json(reports);
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
