
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

export async function generateContent(prompt: string) {
    const settings = await prisma.settings.findFirst();
    const apiKey = settings?.geminiApiKey;

    if (!apiKey) {
        throw new Error("Gemini API Key not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        console.log("Gemini Lib: Sending prompt to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log("Gemini Lib: Received response");
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}
