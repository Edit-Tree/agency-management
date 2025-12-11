'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateExchangeRates(
    usdToInrRate: number,
    eurToInrRate: number,
    gbpToInrRate: number
) {
    try {
        console.log('[Currency] Updating rates:', { usdToInrRate, eurToInrRate, gbpToInrRate })
        const settings = await prisma.settings.findFirst()

        if (settings) {
            console.log('[Currency] Updating existing settings:', settings.id)
            await prisma.settings.update({
                where: { id: settings.id },
                data: {
                    usdToInrRate,
                    eurToInrRate,
                    gbpToInrRate
                } as any
            })
        } else {
            console.log('[Currency] Creating new settings')
            await prisma.settings.create({
                data: {
                    usdToInrRate,
                    eurToInrRate,
                    gbpToInrRate
                } as any
            })
        }

        console.log('[Currency] Successfully updated rates')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error("[Currency] Error updating exchange rates:", error)
        return { success: false, error: String(error) }
    }
}
