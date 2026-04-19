import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import sharp from "sharp";
import https from "https";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

async function fileToGenerativePart(filePath: string) {
  const extension = filePath.split('.').pop()?.toLowerCase();
  let mimeType = "image/jpeg";
  if (extension === 'png') mimeType = "image/png";
  if (extension === 'webp') mimeType = "image/webp";
  
  const resizedBuffer = await sharp(filePath)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();
    
  return {
    inlineData: {
      data: resizedBuffer.toString("base64"),
      mimeType
    },
  };
}

/**
 * Common helper for manual HTTPS requests to Gemini API
 */
const callGeminiAPI = (model: string, payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.GEMINI_API_KEY;
        const body = JSON.stringify(payload);
        
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    return reject(new Error(`API Error ${res.statusCode}: ${responseBody}`));
                }
                try {
                    resolve(JSON.parse(responseBody));
                } catch (e) {
                    reject(new Error("Failed to parse AI response"));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(body);
        req.end();
    });
};

export const analyzePetImage = async (imagePath: string): Promise<any> => {
    try {
        const imagePart = await fileToGenerativePart(imagePath);
        const prompt = `
            Analyze this image of a pet and return a JSON object with the following fields:
            - species: (cat, dog, or other)
            - suggestedBreed: (be specific)
            - primaryColor: (main color)
            - secondaryColor: (secondary color if any)
            - distinctiveFeatures: (e.g. spots, blue eyes, missing ear)
            - estimatedAge: (baby, young, adult, senior)
            
            Return ONLY the JSON object.
        `;

        const payload = {
            contents: [{
                parts: [{ text: prompt }, imagePart]
            }]
        };

        // Using gemini-1.5-flash for better free-tier availability
        const data = await callGeminiAPI("gemini-flash-latest", payload);
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON in response");
        return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
        console.error("AI Analysis Error:", error.message);
        throw new Error(`AI Analysis failed: ${error.message}`);
    }
};

export const generatePetEmbedding = async (petData: any): Promise<number[]> => {
    try {
        // Use the standard embedding model
        const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        
        const textToEmbed = `
            Species: ${petData.petSpecies}
            Breed: ${petData.suggestedBreed || 'Unknown'}
            Color: ${petData.primaryColor || ''}
            Description: ${petData.description || ''}
        `.trim();

        const result = await model.embedContent(textToEmbed);
        return result.embedding.values;
    } catch (error) {
        console.error("Embedding Generation Error, using fallback.");
        const combinedTraits = `${petData.petSpecies}-${petData.suggestedBreed}-${petData.primaryColor}`.toLowerCase();
        const mockVector = new Array(768).fill(0).map((_, i) => {
            let hash = 0;
            for (let j = 0; j < combinedTraits.length; j++) {
                hash = ((hash << 5) - hash) + combinedTraits.charCodeAt(j);
                hash |= 0;
            }
            return Math.sin(hash + i);
        });
        return mockVector;
    }
};

export const verifyPetMatch = async (imagePath1: string, imagePath2: string): Promise<{ score: number, reasoning: string }> => {
    try {
        if (!fs.existsSync(imagePath1) || !fs.existsSync(imagePath2)) {
            return { score: 0, reasoning: "Files not found" };
        }

        const part1 = await fileToGenerativePart(imagePath1);
        const part2 = await fileToGenerativePart(imagePath2);

        const prompt = "Compare these two images. Are they the same pet? Respond ONLY with JSON: {\"score\": number, \"reasoning\": string}";
        
        const payload = {
            contents: [{
                parts: [{ text: prompt }, part1, part2]
            }]
        };

        const data = await callGeminiAPI("gemini-flash-latest", payload);
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON in response");

        const parsed = JSON.parse(jsonMatch[0]);
        return {
            score: parsed.score || 0,
            reasoning: parsed.reasoning || "No reasoning."
        };
    } catch (error: any) {
        console.error("AI Visual Verification Error:", error.message);
        return { score: 0, reasoning: `Error: ${error.message}` };
    }
};
