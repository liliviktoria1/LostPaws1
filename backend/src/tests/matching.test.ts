import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// Use unstable_mockModule for ESM mocking
// This must be called before importing the service that uses it
jest.unstable_mockModule('../models/PetReport.js', () => ({
    PetReport: {
        findByPk: jest.fn(),
        findAll: jest.fn()
    }
}));

// Use dynamic import to get the mocked module and the service
const { PetReport } = await import('../models/PetReport.js');
const { findMatchesForReport } = await import('../services/matching.js');

const MockedPetReport = PetReport as jest.Mocked<typeof PetReport>;

describe('Matching Service Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return matches of the same species and opposite status', async () => {
        const mockSource = {
            id: 'report-1',
            petStatus: 'lost',
            petSpecies: 'dog',
            embedding: [0.1, 0.2, 0.3],
            photos: [{ url: '/test.jpg' }]
        };

        const mockCandidates = [
            {
                id: 'report-2',
                petStatus: 'found',
                petSpecies: 'dog',
                embedding: [0.1, 0.2, 0.3], // Perfect match
                photos: [{ url: '/found.jpg' }]
            }
        ];

        MockedPetReport.findByPk.mockResolvedValue(mockSource as any);
        MockedPetReport.findAll.mockResolvedValue(mockCandidates as any);

        const matches = await findMatchesForReport('report-1', 5, false);
        
        expect(matches.length).toBe(1);
        expect(matches[0].report.id).toBe('report-2');
        expect(matches[0].score).toBeGreaterThan(0.9);
    });

    test('should filter out reports with different species', async () => {
        const mockSource = {
            id: 'report-1',
            petStatus: 'lost',
            petSpecies: 'cat',
            embedding: [1, 0, 0]
        };

        MockedPetReport.findByPk.mockResolvedValue(mockSource as any);
        MockedPetReport.findAll.mockResolvedValue([]);

        const matches = await findMatchesForReport('report-1');
        expect(matches.length).toBe(0);
    });

    test('should return empty array if source report has no embedding', async () => {
        MockedPetReport.findByPk.mockResolvedValue({ id: '1', embedding: null } as any);
        const matches = await findMatchesForReport('1');
        expect(matches).toEqual([]);
    });
});
