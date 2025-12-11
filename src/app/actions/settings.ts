'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveEmailSettings(formData: FormData) {
    try {
        const currentSettings = await prisma.settings.findFirst()
        const data = {
            smtpHost: formData.get('smtpHost') as string || null,
            smtpPort: parseInt(formData.get('smtpPort') as string) || 587,
            smtpUsername: formData.get('smtpUsername') as string || null,
            smtpPassword: formData.get('smtpPassword') as string || null,
            smtpFromEmail: formData.get('smtpFromEmail') as string || null,
            smtpFromName: formData.get('smtpFromName') as string || null,
        }
        if (currentSettings) {
            await prisma.settings.update({ where: { id: currentSettings.id }, data })
        } else {
            await prisma.settings.create({ data })
        }
        revalidatePath('/dashboard/settings')
        return { success: true }
    } catch (error) {
        console.error("Error saving email settings:", error)
        return { success: false, error: "Failed to save settings" }
    }
}

export async function savePaymentSettings(formData: FormData) {
    try {
        const currentSettings = await prisma.settings.findFirst()
        const data = {
            razorpayKeyId: formData.get('razorpayKeyId') as string || null,
            razorpayKeySecret: formData.get('razorpayKeySecret') as string || null,
        }
        if (currentSettings) {
            await prisma.settings.update({ where: { id: currentSettings.id }, data })
        } else {
            await prisma.settings.create({ data })
        }
        revalidatePath('/dashboard/settings')
        return { success: true }
    } catch (error) {
        console.error("Error saving payment settings:", error)
        return { success: false, error: "Failed to save settings" }
    }
}

export async function saveTemplateSettings(formData: FormData) {
    try {
        const currentSettings = await prisma.settings.findFirst()
        const data = {
            enableInvoiceEmails: formData.get('enableInvoiceEmails') === 'on',
            paymentReminderEnabled: formData.get('paymentReminderEnabled') === 'on',
            paymentReminderMessage: formData.get('paymentReminderMessage') as string || null,
        }
        if (currentSettings) {
            await prisma.settings.update({ where: { id: currentSettings.id }, data })
        } else {
            await prisma.settings.create({ data })
        }
        revalidatePath('/dashboard/settings')
        return { success: true }
    } catch (error) {
        console.error("Error saving template settings:", error)
        return { success: false, error: "Failed to save settings" }
    }
}

export async function saveNotificationSettings(formData: FormData) {
    try {
        const currentSettings = await prisma.settings.findFirst()
        const data = {
            emailOnTicketCreated: formData.get('emailOnTicketCreated') === 'on',
            emailOnTicketAssigned: formData.get('emailOnTicketAssigned') === 'on',
            emailOnTicketStatusChange: formData.get('emailOnTicketStatusChange') === 'on',
            emailOnReviewRequested: formData.get('emailOnReviewRequested') === 'on',
            emailOnReviewApproved: formData.get('emailOnReviewApproved') === 'on',
            emailOnCommentAdded: formData.get('emailOnCommentAdded') === 'on',
            emailOnInvoiceCreated: formData.get('emailOnInvoiceCreated') === 'on',
            emailOnInvoicePaid: formData.get('emailOnInvoicePaid') === 'on',
            emailOnDeadlineApproaching: formData.get('emailOnDeadlineApproaching') === 'on',
            emailOnProjectCreated: formData.get('emailOnProjectCreated') === 'on',
        }
        if (currentSettings) {
            await prisma.settings.update({ where: { id: currentSettings.id }, data })
        } else {
            await prisma.settings.create({ data })
        }
        revalidatePath('/dashboard/settings')
        return { success: true }
    } catch (error) {
        console.error("Error saving notification settings:", error)
        return { success: false, error: "Failed to save settings" }
    }
}

export async function saveAiSettings(formData: FormData) {
    try {
        const currentSettings = await prisma.settings.findFirst()
        const data = {
            geminiApiKey: formData.get('geminiApiKey') as string || null,
        }
        if (currentSettings) {
            await prisma.settings.update({ where: { id: currentSettings.id }, data })
        } else {
            await prisma.settings.create({ data })
        }
        revalidatePath('/dashboard/settings')
        return { success: true }
    } catch (error) {
        console.error("Error saving AI settings:", error)
        return { success: false, error: "Failed to save settings" }
    }
}
export async function saveCompanySettings(formData: FormData) {
    try {
        const currentSettings = await prisma.settings.findFirst()
        const data = {
            companyName: formData.get('companyName') as string || null,
            companyAddress: formData.get('companyAddress') as string || null,
            companyGst: formData.get('companyGst') as string || null,
            companyEmail: formData.get('companyEmail') as string || null,
            companyPhone: formData.get('companyPhone') as string || null,
            companyWebsite: formData.get('companyWebsite') as string || null,
        }
        if (currentSettings) {
            await prisma.settings.update({ where: { id: currentSettings.id }, data })
        } else {
            await prisma.settings.create({ data })
        }
        revalidatePath('/dashboard/settings')
        return { success: true }
    } catch (error) {
        console.error("Error saving company settings:", error)
        return { success: false, error: "Failed to save settings" }
    }
}
