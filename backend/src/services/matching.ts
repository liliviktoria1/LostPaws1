import { PetReport } from '../models/PetReport.js';
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

export const findMatchesForReport = async (reportId: string, limit = 5, useDeepScan = false, lang: string = 'en') => {
    try {
        const sourceReport = await PetReport.findByPk(reportId);
        if (!sourceReport || !sourceReport.embedding) return [];

        const targetStatus = sourceReport.petStatus === 'lost' ? 'found' : 'lost';
        
        console.log(`[Matching] Running scan for ${sourceReport.petName}. Target Status: ${targetStatus}, Species: ${sourceReport.petSpecies}, Lang: ${lang}`);

        // Step 1: Fast Vector Search (Candidate filtering)
        const where: any = {
            petStatus: targetStatus,
            petSpecies: sourceReport.petSpecies,
            id: { [Op.ne]: reportId }
        };
        
        const candidates = await PetReport.findAll({ where });

        // Calculate text/embedding similarity
        let textMatches = candidates.map(candidate => {
            if (!candidate.embedding || !sourceReport.embedding) return null;
            const score = cosineSimilarity(sourceReport.embedding, candidate.embedding);
            return {
                report: candidate,
                score,
                reasoning: lang === 'ua' ? 'Збіг за описом та параметрами.' : 'Matches by description and parameters.'
            };
        }).filter(m => m !== null) as any[];

        // Sort by text similarity - only take top 2 for deep scan to respect rate limits
        let topCandidates = textMatches.sort((a, b) => b.score - a.score).slice(0, 2);
            
        // Step 2: Deep Visual Scan
        if (useDeepScan && sourceReport.photos && sourceReport.photos.length > 0) {
            console.log(`[Matching] Starting Deep Visual Scan (Top 2 Candidates)...`);
            const sourcePhotoUrl = (sourceReport.photos[0] as any).url;
            const sourcePhotoPath = path.resolve(process.cwd(), sourcePhotoUrl.replace(/^\//, ''));
            
            const verificationResults = [];
            
            // Utility for rate limiting
            const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

            for (const candidate of topCandidates) {
                if (candidate.report.photos && candidate.report.photos.length > 0) {
                    try {
                        const targetPhotoUrl = (candidate.report.photos[0] as any).url;
                        const targetPhotoPath = path.resolve(process.cwd(), targetPhotoUrl.replace(/^\//, ''));
                        
                        const verification = await verifyPetMatch(sourcePhotoPath, targetPhotoPath, lang);
                        
                        const rawScore = verification.score;
                        const normalizedScore = rawScore <= 1 ? rawScore : rawScore / 100;
                        
                        verificationResults.push({
                            report: candidate.report,
                            score: normalizedScore,
                            reasoning: verification.reasoning
                        });
                    } catch (err) {
                        console.error(`[Matching] Visual scan failed for ${candidate.report.id}`, err);
                    }
                }
            }
            
            if (verificationResults.length > 0) {
                return verificationResults.sort((a, b) => b.score - a.score);
            }
        }

        return topCandidates;

    } catch (error) {
        console.error('Matching Error:', error);
        return [];
    }
};
