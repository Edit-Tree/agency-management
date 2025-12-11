import { PrismaClient } from '@prisma/client'
import { GoogleGenerativeAI } from "@google/generative-ai"

const prisma = new PrismaClient()

async function main() {
    console.log("Checking Gemini Configuration...")

    const settings = await prisma.settings.findFirst()
    if (!settings) {
        console.error("❌ No settings found in database.")
        return
    }

    if (!settings.geminiApiKey) {
        console.error("❌ Gemini API Key is missing in settings.")
        return
    }

    console.log("✅ Gemini API Key found (starts with):", settings.geminiApiKey.substring(0, 4) + "...")

    try {
        console.log("Testing Gemini API connection...")
        const genAI = new GoogleGenerativeAI(settings.geminiApiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })

        const prompt = "Hello, are you working? Reply with 'Yes, I am working!'"
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        console.log("✅ Gemini API Response:", text)
    } catch (error) {
        console.error("❌ Gemini API Test Failed:", error)
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
