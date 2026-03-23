const express = require('express');
const router = express.Router();
const PetReport = require('../models/PetReport');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');

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
            locationAddress,
            locationLat,
            locationLng,
            dateLastSeen,
            contactName,
            contactNumber,
            contactEmail
        } = req.body;

        const photoPaths = req.files ? req.files.map(file => ({ url: `/uploads/${file.filename}` })) : [];

        const newReport = await PetReport.create({
            petStatus,
            petName,
            petSpecies,
            petSex,
            description,
            locationAddress,
            locationLat: locationLat ? parseFloat(locationLat) : null,
            locationLng: locationLng ? parseFloat(locationLng) : null,
            dateLastSeen,
            contactName,
            contactNumber,
            contactEmail,
            photos: photoPaths
        });

        res.status(201).json(newReport);
    } catch (err) {
        console.error('Error creating report:', err);
        res.status(400).json({ message: err.message });
    }
});

// GET /api/reports - Get all reports with optional filters
router.get('/', async (req, res) => {
    try {
        const { status, species, sex, location } = req.query;
        let where = {};

        if (status) where.petStatus = status;
        if (species) where.petSpecies = species;
        if (sex) where.petSex = sex;
        if (location) {
            where.locationAddress = { [Op.iLike]: `%${location}%` };
        }

        const reports = await PetReport.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/reports/:id - Get a specific report
router.get('/:id', async (req, res) => {
    try {
        const report = await PetReport.findByPk(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json(report);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/reports/:id - Update a report
router.patch('/:id', async (req, res) => {
    try {
        const [updated] = await PetReport.update(req.body, {
            where: { id: req.params.id }
        });
        if (!updated) return res.status(404).json({ message: 'Report not found' });

        const updatedReport = await PetReport.findByPk(req.params.id);
        res.json(updatedReport);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/reports/:id - Delete a report
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await PetReport.destroy({
            where: { id: req.params.id }
        });
        if (!deleted) return res.status(404).json({ message: 'Report not found' });
        res.json({ message: 'Report deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
