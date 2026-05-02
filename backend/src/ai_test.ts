import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelId: string) {
    console.log(`\n--- Testing model: ${modelId} ---`);
    try {
        const model = genAI.getGenerativeModel({ model: modelId });
        
        // Simple text test
        const result = await model.generateContent("Say 'AI is working'");
        console.log(`✅ Text Test: ${result.response.text()}`);

        // Vision test if text passed
        const imgPath = path.resolve('uploads', 'Ben.jpeg');
        if (fs.existsSync(imgPath)) {
            const imgData = fs.readFileSync(imgPath).toString('base64');
            const visionResult = await model.generateContent([
                "Describe this pet in 5 words",
                { inlineData: { data: imgData, mimeType: 'image/jpeg' } }
            ]);
            console.log(`✅ Vision Test: ${visionResult.response.text()}`);
        } else {
            console.log("⚠️ uploads/Ben.jpeg not found, skipping vision test.");
        }
        
        return true;
    } catch (error: any) {
        console.error(`❌ Model ${modelId} failed: ${error.message}`);
        return false;
    }
}

async function runAllTests() {
    console.log("🚀 Starting AI Self-Test...");
    
    // Candidates to try based on 2026 information
    const candidates = [
        "gemini-flash-latest",
        "gemini-2.5-flash",
        "gemini-3.1-flash",
        "gemini-2.0-flash", // Deprecated but might work
        "gemini-1.5-flash"  // Should be shutdown but checking fallback
    ];

    let successModel = null;

    for (const id of candidates) {
        const ok = await testModel(id);
        if (ok) {
            successModel = id;
            break; // Stop at first working one
        }
    }

    if (successModel) {
        console.log(`\n✨ SUCCESS! Working model found: ${successModel}`);
        console.log(`RECOMMENDATION: Use "${successModel}" in ai.ts`);
    } else {
        console.log("\n💀 ALL MODELS FAILED. Please check your API key, internet connection, and Billing settings at Google AI Studio.");
    }
}

runAllTests();
