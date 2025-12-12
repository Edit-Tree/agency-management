"use server"

import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const settings = await prisma.settings.upsert({
            where: { id: 'default' },
            update: {},
            create: {
                id: 'default',
                smtpFromName: 'PM System',
                smtpPort: 587,
            },
        })

        return Response.json({ success: true, settings })
    } catch (error) {
        return Response.json({ success: false, error: String(error) }, { status: 500 })
    }
}
