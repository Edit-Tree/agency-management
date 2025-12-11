'use server'

import { prisma } from "@/lib/prisma"
import { InvoiceStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { notifyInvoiceCreated } from "@/lib/notifications"

export async function finalizeInvoice(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId }
    })

    if (!invoice || invoice.status !== InvoiceStatus.DRAFT) {
        return { success: false, message: "Invoice not found or already finalized." }
    }

    // 1. Get the last issued invoice to determine the next number
    const lastInvoice = await prisma.invoice.findFirst({
        where: {
            invoiceNumber: { not: null }
        },
        orderBy: {
            invoiceNumber: 'desc'
        }
    })

    const nextInvoiceNumber = (lastInvoice?.invoiceNumber ?? 0) + 1

    // 2. Update the invoice
    await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            status: InvoiceStatus.PAID, // As per user req: "clears payment -> auto issue number"
            invoiceNumber: nextInvoiceNumber
        }
    })

    // Send email notification to client
    await notifyInvoiceCreated(invoiceId)

    revalidatePath(`/dashboard/invoices/${invoiceId}`)
    revalidatePath('/dashboard/invoices')

    return { success: true, message: `Invoice #${nextInvoiceNumber} finalized and marked as PAID.` }
}
