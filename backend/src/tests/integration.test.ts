import { jest, describe, beforeAll, afterAll, test, expect } from '@jest/globals';

// Mock external services before importing routes
jest.unstable_mockModule('../services/geocoding.js', () => ({
    geocodeAddress: jest.fn().mockResolvedValue({ lat: 50.45, lng: 30.52 })
}));

jest.unstable_mockModule('../config/ai.js', () => ({
    analyzePetImage: jest.fn().mockResolvedValue({ species: 'dog' }),
    generatePetEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    verifyPetMatch: jest.fn().mockResolvedValue({ score: 90, reasoning: 'Looks identical' }),
    fileToGenerativePart: jest.fn()
}));

// Mock email service to avoid network calls
jest.unstable_mockModule('../services/email.js', () => ({
    sendMatchAlertEmail: jest.fn().mockResolvedValue(true)
}));

// Import everything else after mocking
const { default: request } = await import('supertest');
const { default: express } = await import('express');
const { default: reportRoutes } = await import('../routes/reports.js');
const { default: authRoutes } = await import('../routes/auth.js');
const { default: sequelize } = await import('../config/database.js');
const { PetReport } = await import('../models/PetReport.js');
const { User } = await import('../models/User.js');

// Setup app for testing
const app = express();
app.use(express.json());
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);

describe('Lost Paws Integration Tests', () => {
    let token: string;
    let userId: string;

    beforeAll(async () => {
        // Sync database
        await sequelize.sync({ force: true });

        // Register a test user
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Tester',
                email: 'test@example.com',
                password: 'password123'
            });
        
        token = (res.body as any).token;
        userId = (res.body as any).user.id;
    }, 10000);

    afterAll(async () => {
        await sequelize.close();
    });

    test('POST /api/reports - should create a report and fire watcher', async () => {
        const res = await request(app)
            .post('/api/reports')
            .set('Authorization', `Bearer ${token}`)
            .send({
                petStatus: 'lost',
                petName: 'TestPet',
                petSpecies: 'dog',
                contactEmail: 'test@example.com',
                locationAddress: 'Kyiv'
            });

        expect(res.status).toBe(201);
        expect((res.body as any).report.petName).toBe('TestPet');
        expect((res.body as any).message).toContain('AI is scanning');
    }, 20000);

    test('GET /api/reports - should fetch reports with filters', async () => {
        const res = await request(app).get('/api/reports?petStatus=lost');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect((res.body as any)[0].petStatus).toBe('lost');
    });
});
