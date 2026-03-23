const express = require('express');
const router = express.Router();
const PetReport = require('../models/PetReport');
const multer = require('multer');
const path = require('path');

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

// POST /api/reports - Create a new report
router.post('/', upload.array('photos', 5), async (req, res) => {
    try {
        const {
            petStatus,
            petName,
            petSpecies,
            petSex,
            description,
            location,
            dateLastSeen,
            contactName,
            contactNumber,
            contactEmail
        } = req.body;

        const photoPaths = req.files ? req.files.map(file => ({ url: `/uploads/${file.filename}` })) : [];

        const newReport = new PetReport({
            petStatus,
            petName,
            petSpecies,
            petSex,
            description,
            location: location ? JSON.parse(location) : {},
            dateLastSeen,
            contactName,
            contactNumber,
            contactEmail,
            photos: photoPaths
        });

        const savedReport = await newReport.save();
        res.status(201).json(savedReport);
    } catch (err) {
        console.error('Error creating report:', err);
        res.status(400).json({ message: err.message });
    }
});

// GET /api/reports - Get all reports with optional filters
router.get('/', async (req, res) => {
    try {
        const { status, species, sex, location } = req.query;
        let query = {};

        if (status) query.petStatus = status;
        if (species) query.petSpecies = species;
        if (sex) query.petSex = sex;
        if (location) {
            // Basic text search for address
            query['location.address'] = { $regex: location, $options: 'i' };
        }

        const reports = await PetReport.find(query).sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/reports/:id - Get a specific report
router.get('/:id', async (req, res) => {
    try {
        const report = await PetReport.findById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json(report);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/reports/:id - Update a report
router.patch('/:id', async (req, res) => {
    try {
        const updatedReport = await PetReport.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!updatedReport) return res.status(404).json({ message: 'Report not found' });
        res.json(updatedReport);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/reports/:id - Delete a report
router.delete('/:id', async (req, res) => {
    try {
        const report = await PetReport.findByIdAndDelete(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json({ message: 'Report deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
