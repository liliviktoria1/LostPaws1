import PetReport from '../models/PetReport.js';
import { Op } from 'sequelize';
import { verifyPetMatch } from '../config/ai.js';
import path from 'path';

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

export const findMatchesForReport = async (reportId: string, limit = 5, useDeepScan = false) => {
    try {
        const sourceReport = await PetReport.findByPk(reportId);
        if (!sourceReport || !sourceReport.embedding) return [];

        const targetStatus = sourceReport.petStatus === 'lost' ? 'found' : 'lost';

        // Step 1: Fast Vector Search (Candidate filtering)
        const where: any = {
            petStatus: targetStatus,
            petSpecies: sourceReport.petSpecies,
            id: { [Op.ne]: reportId },
            embedding: { [Op.not]: null }
        };

        const candidates = await PetReport.findAll({ where });

        // Calculate text/embedding similarity
        let textMatches = candidates.map(candidate => {
            const score = cosineSimilarity(sourceReport.embedding, candidate.embedding);
            return {
                report: candidate,
                score,
                reasoning: ''
            };
        });

        // Filter and get top candidates (e.g., top 10)
        let topCandidates = textMatches
            .filter(m => m.score > 0.6) // Lower threshold for initial pass
            .sort((a, b) => b.score - a.score)
            .slice(0, Math.max(limit, 10));

        // Step 2: Deep Visual Scan (Optional, slower)
        if (useDeepScan && sourceReport.photos && sourceReport.photos.length > 0) {
            const sourcePhotoPath = path.join(process.cwd(), (sourceReport.photos[0] as any).url);
            
            const verifiedMatches = [];

            for (const candidate of topCandidates) {
                if (candidate.report.photos && candidate.report.photos.length > 0) {
                    try {
                        const targetPhotoPath = path.join(process.cwd(), (candidate.report.photos[0] as any).url);
                        const verification = await verifyPetMatch(sourcePhotoPath, targetPhotoPath);
                        
                        // Only keep matches where visual confidence > 75%
                        if (verification.score > 75) {
                            verifiedMatches.push({
                                report: candidate.report,
                                score: verification.score / 100, // Normalize to 0-1 for UI consistency
                                reasoning: verification.reasoning
                            });
                        }
                    } catch (err) {
                        console.error(`Visual scan failed for candidate ${candidate.report.id}`, err);
                    }
                }
            }
            
            // Return visual matches sorted by score
            return verifiedMatches.sort((a, b) => b.score - a.score).slice(0, limit);
        }

        // If no deep scan, just return the text matches
        return topCandidates
            .filter(m => m.score > 0.7) // Stricter threshold if no visual check
            .slice(0, limit);

    } catch (error) {
        console.error('Matching Error:', error);
        return [];
    }
};
