import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

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
