'use server'

import { sendInvoiceToClient, sendPaymentReminder } from '@/lib/invoice-emails'
import { revalidatePath } from 'next/cache'

export async function sendInvoiceEmailAction(invoiceId: string) {
    try {
        const result = await sendInvoiceToClient(invoiceId)
        revalidatePath('/dashboard/invoices')
        return result
    } catch (error) {
        console.error('Error sending invoice email:', error)
        return { success: false, error: 'Failed to send invoice email' }
    }
}

export async function sendPaymentReminderAction(invoiceId: string) {
    try {
        const result = await sendPaymentReminder(invoiceId)
        revalidatePath('/dashboard/invoices')
        return result
    } catch (error) {
        console.error('Error sending payment reminder:', error)
        return { success: false, error: 'Failed to send payment reminder' }
    }
}
