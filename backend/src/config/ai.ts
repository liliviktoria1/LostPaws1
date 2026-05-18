import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import fs from "fs";
import sharp from "sharp";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Simplified Global Queue
let isAiBusy = false;
const queue: Array<() => void> = [];

async function aiLock() {
    if (isAiBusy) await new Promise<void>(resolve => queue.push(resolve));
    isAiBusy = true;
}

async function aiUnlock() {
    await new Promise(res => setTimeout(res, 2000)); // 2s cooldown is enough for Flash models
    isAiBusy = false;
    if (queue.length > 0) {
        const next = queue.shift();
        if (next) next();
    }
}

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

import axios from 'axios';

async function fileToGenerativePart(input: string) {
  let buffer: Buffer;

  if (input.startsWith('http')) {
    const response = await axios.get(input, { responseType: 'arraybuffer' });
    buffer = Buffer.from(response.data);
  } else {
    buffer = fs.readFileSync(input);
  }

  const resizedBuffer = await sharp(buffer)
    .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();
    
  return {
    inlineData: {
      data: resizedBuffer.toString("base64"),
      mimeType: "image/jpeg"
    },
  };
}

export const analyzePetImage = async (imagePath: string, lang: string = 'en'): Promise<any> => {
    await aiLock();
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", safetySettings });
        const imagePart = await fileToGenerativePart(imagePath);
        const langPrompt = lang === 'ua' ? "Відповідай українською." : "Respond in English.";
        const prompt = `Analyze pet image. Return JSON: {"species", "suggestedBreed", "primaryColor", "secondaryColor", "distinctiveFeatures", "estimatedAge"}. ${langPrompt}`;

        const result = await model.generateContent([prompt, imagePart]);
        return JSON.parse(result.response.text().match(/\{[\s\S]*\}/)![0]);
    } catch (error: any) {
        console.error("AI Analysis Error:", error.message);
        return { species: 'other', suggestedBreed: 'Unknown' };
    } finally {
        await aiUnlock();
    }
};

export const generatePetEmbedding = async (petData: any): Promise<number[]> => {
    // Keep embedding local or simple to save quota for vision
    const combinedTraits = `${petData.petSpecies}-${petData.suggestedBreed}`.toLowerCase();
    return new Array(768).fill(0).map((_, i) => Math.sin(combinedTraits.charCodeAt(i % combinedTraits.length) + i));
};

export const verifyPetMatch = async (imagePath1: string, imagePath2: string, lang: string = 'en'): Promise<{ score: number, reasoning: string }> => {
    await aiLock();
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", safetySettings });
        const part1 = await fileToGenerativePart(imagePath1);
        const part2 = await fileToGenerativePart(imagePath2);
        
        const langPrompt = lang === 'ua' 
            ? "Відповідай СУВОРО УКРАЇНСЬКОЮ МОВОЮ." 
            : "Respond STRICTLY IN ENGLISH.";

        const prompt = `Compare these two pets. Are they the same? Respond ONLY JSON: {"score": 0.0-1.0, "reasoning": "text"}. ${langPrompt}`;
        
        const result = await model.generateContent([prompt, part1, part2]);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) throw new Error("AI returned invalid data format");
        const parsed = JSON.parse(jsonMatch[0]);
        
        return { 
            score: parsed.score || 0, 
            reasoning: parsed.reasoning || (lang === 'ua' ? "Збіг знайдено." : "Visual match found.")
        };
    } catch (error: any) {
        console.error(`[AI Error] ${error.message}`);
        const errorMsg = lang === 'ua' ? `Помилка ШІ: ${error.message}` : `AI Error: ${error.message}`;
        return { score: 0, reasoning: errorMsg };
    } finally {
        await aiUnlock();
    }
};
