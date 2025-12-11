import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SettingsForm } from "@/components/settings-form"
import {
    saveEmailSettings,
    savePaymentSettings,
    saveTemplateSettings,
    saveNotificationSettings,
    saveAiSettings,
    saveCompanySettings
} from "@/app/actions/settings"
import { serializeData } from "@/lib/utils"

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const settings = await prisma.settings.findFirst()

    return (
        <SettingsForm
            settings={serializeData(settings)}
            saveEmailSettings={saveEmailSettings}
            savePaymentSettings={savePaymentSettings}
            saveTemplateSettings={saveTemplateSettings}
            saveNotificationSettings={saveNotificationSettings}
            saveAiSettings={saveAiSettings}
            saveCompanySettings={saveCompanySettings}
        />
    )
}
