import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

function fileToGenerativePart(filePath: string, mimeType: string) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

export const analyzePetImage = async (imagePath: string): Promise<any> => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const imageData = fs.readFileSync(imagePath);
        const imagePart = {
            inlineData: {
                data: imageData.toString("base64"),
                mimeType: "image/jpeg",
            },
        };

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

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        
        // Clean up the response if it contains markdown formatting
        const cleanJson = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("AI Analysis Error:", error);
        throw new Error("Failed to analyze image with AI");
    }
};

export const generatePetEmbedding = async (petData: any): Promise<number[]> => {
    try {
        // Since we are using Gemini, we can use the embedding model
        // We'll create a text string that describes the pet based on analysis and form data
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        
        const textToEmbed = `
            Species: ${petData.petSpecies}
            Breed: ${petData.suggestedBreed || 'Unknown'}
            Color: ${petData.primaryColor || ''} ${petData.secondaryColor || ''}
            Features: ${petData.distinctiveFeatures || ''}
            Description: ${petData.description || ''}
        `.trim();

        const result = await model.embedContent(textToEmbed);
        return result.embedding.values;
    } catch (error) {
        console.error("Embedding Generation Error:", error);
        return []; // Return empty array if embedding fails
    }
};

export const verifyPetMatch = async (imagePath1: string, imagePath2: string): Promise<{ score: number, reasoning: string }> => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Act as an expert pet identifier and forensic analyst. 
            I am providing you with two images of pets. 
            Compare them carefully. Look at the fur patterns, snout shape, ear shape, distinctive markings, and overall build.
            Are these two images of the SAME pet? 
            Provide a strict confidence score from 0 to 100 representing the likelihood that they are the same animal. 
            Also provide a brief 1-2 sentence reasoning.
            Respond ONLY with a JSON object in this exact format:
            {
                "score": 85,
                "reasoning": "Both dogs share the exact same white patch on the left eye and identical ear shapes."
            }
        `;

        const imageParts = [
            fileToGenerativePart(imagePath1, "image/jpeg"), // Simplified mime, Gemini handles standard images well
            fileToGenerativePart(imagePath2, "image/jpeg"),
        ];

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();

        const cleanJson = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        
        return {
            score: parsed.score || 0,
            reasoning: parsed.reasoning || "Could not generate reasoning."
        };
    } catch (error) {
        console.error("AI Visual Verification Error:", error);
        return { score: 0, reasoning: "Error occurred during visual verification." };
    }
};
