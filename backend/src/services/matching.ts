import PetReport from '../models/PetReport.js';
import { Op } from 'sequelize';

/**
 * Matching Service to find similar pet reports
 */

// Simple cosine similarity calculation for embeddings
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const findMatchesForReport = async (reportId: string, limit = 5) => {
    try {
        const sourceReport = await PetReport.findByPk(reportId);
        if (!sourceReport || !sourceReport.embedding) return [];

        const targetStatus = sourceReport.petStatus === 'lost' ? 'found' : 'lost';

        // Find potential candidates of the same species and opposite status
        const where: any = {
            petStatus: targetStatus,
            petSpecies: sourceReport.petSpecies,
            id: { [Op.ne]: reportId },
            embedding: { [Op.not]: null }
        };

        const candidates = await PetReport.findAll({ where });

        // Calculate similarity and sort
        const matches = candidates.map(candidate => {
            const score = cosineSimilarity(sourceReport.embedding, candidate.embedding);
            return {
                report: candidate,
                score
            };
        });

        // Return top matches above a threshold
        return matches
            .filter(m => m.score > 0.7) // Threshold for matching
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

    } catch (error) {
        console.error('Matching Error:', error);
        return [];
    }
};
