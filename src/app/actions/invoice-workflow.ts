'use server'

import { prisma } from "@/lib/prisma"
import { InvoiceStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

// Share invoice as proforma (assign proforma number)
export async function shareProforma(invoiceId: string) {
    // Get the next proforma number
    const lastProforma = await prisma.invoice.findFirst({
        where: { proformaNumber: { not: null } },
        orderBy: { proformaNumber: 'desc' }
    })

    const nextProformaNumber = (lastProforma?.proformaNumber || 0) + 1

    await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            status: InvoiceStatus.PROFORMA,
            proformaNumber: nextProformaNumber
        }
    })

    revalidatePath(`/dashboard/invoices/${invoiceId}`)
    revalidatePath('/dashboard/invoices')
    return { success: true, proformaNumber: nextProformaNumber }
}

// Send invoice email (simulation)
export async function sendInvoiceEmail(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { client: { include: { user: true } } }
    })

    if (!invoice) {
        return { error: "Invoice not found" }
    }

    // Update status to SENT
    await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: InvoiceStatus.SENT }
    })

    revalidatePath(`/dashboard/invoices/${invoiceId}`)
    revalidatePath('/dashboard/invoices')

    // Simulate email sending
    console.log(`📧 Email sent to ${invoice.client.user.email}`)
    console.log(`Subject: Invoice ${invoice.proformaNumber ? `PRO-${String(invoice.proformaNumber).padStart(3, '0')}` : 'Draft'}`)

    return { success: true, email: invoice.client.user.email }
}

// Mark invoice as paid and assign invoice number
export async function markAsPaid(invoiceId: string, formData: FormData) {
    const paymentMethod = formData.get('paymentMethod') as string
    const paymentNotes = formData.get('paymentNotes') as string
    const paidDate = new Date(formData.get('paidDate') as string || new Date())

    // Get the next invoice number
    const lastInvoice = await prisma.invoice.findFirst({
        where: { invoiceNumber: { not: null } },
        orderBy: { invoiceNumber: 'desc' }
    })

    const nextInvoiceNumber = (lastInvoice?.invoiceNumber || 0) + 1

    // Validate chronological order
    const validation = await validateInvoiceSequence(nextInvoiceNumber, paidDate)
    if (!validation.valid) {
        return { error: validation.error }
    }

    await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            status: InvoiceStatus.PAID,
            invoiceNumber: nextInvoiceNumber,
            paidDate,
            paymentMethod,
            paymentNotes
        }
    })

    revalidatePath(`/dashboard/invoices/${invoiceId}`)
    revalidatePath('/dashboard/invoices')

    return { success: true, invoiceNumber: nextInvoiceNumber }
}

// Validate invoice number chronological sequence
async function validateInvoiceSequence(newInvoiceNumber: number, newPaidDate: Date) {
    // Get all paid invoices
    const paidInvoices = await prisma.invoice.findMany({
        where: {
            invoiceNumber: { not: null },
            paidDate: { not: null }
        },
        orderBy: { invoiceNumber: 'asc' }
    })

    // Check invoices with lower numbers
    const lowerInvoices = paidInvoices.filter(inv => inv.invoiceNumber! < newInvoiceNumber)
    for (const inv of lowerInvoices) {
        if (inv.paidDate! > newPaidDate) {
            return {
                valid: false,
                error: `Invoice number ${newInvoiceNumber} cannot have an earlier date than INV-${String(inv.invoiceNumber).padStart(3, '0')} (${inv.paidDate!.toLocaleDateString()})`
            }
        }
    }

    // Check invoices with higher numbers
    const higherInvoices = paidInvoices.filter(inv => inv.invoiceNumber! > newInvoiceNumber)
    for (const inv of higherInvoices) {
        if (inv.paidDate! < newPaidDate) {
            return {
                valid: false,
                error: `Invoice number ${newInvoiceNumber} cannot have a later date than INV-${String(inv.invoiceNumber).padStart(3, '0')} (${inv.paidDate!.toLocaleDateString()})`
            }
        }
    }

    return { valid: true }
}
