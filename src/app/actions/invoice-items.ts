'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Add a manual invoice item
export async function addInvoiceItem(invoiceId: string, formData: FormData) {
    const description = formData.get('description') as string
    const quantity = parseFloat(formData.get('quantity') as string) || 1
    const rate = parseFloat(formData.get('rate') as string)

    if (!description || !rate) {
        return { error: "Description and rate are required" }
    }

    const amount = quantity * rate

    await prisma.invoiceItem.create({
        data: {
            invoiceId,
            description,
            quantity,
            rate,
            amount
        }
    })

    // Recalculate total
    await recalculateInvoiceTotal(invoiceId)

    revalidatePath(`/dashboard/invoices/${invoiceId}`)
    return { success: true }
}

// Update an invoice item
export async function updateInvoiceItem(itemId: string, formData: FormData) {
    const description = formData.get('description') as string
    const quantity = parseFloat(formData.get('quantity') as string) || 1
    const rate = parseFloat(formData.get('rate') as string)

    if (!description || !rate) {
        return { error: "Description and rate are required" }
    }

    const amount = quantity * rate

    const item = await prisma.invoiceItem.update({
        where: { id: itemId },
        data: {
            description,
            quantity,
            rate,
            amount
        }
    })

    // Recalculate total
    await recalculateInvoiceTotal(item.invoiceId)

    revalidatePath(`/dashboard/invoices/${item.invoiceId}`)
    return { success: true }
}

// Delete an invoice item
export async function deleteInvoiceItem(itemId: string) {
    const item = await prisma.invoiceItem.findUnique({
        where: { id: itemId }
    })

    if (!item) {
        return { error: "Item not found" }
    }

    await prisma.invoiceItem.delete({
        where: { id: itemId }
    })

    // Recalculate total
    await recalculateInvoiceTotal(item.invoiceId)

    revalidatePath(`/dashboard/invoices/${item.invoiceId}`)
    return { success: true }
}

// Helper function to recalculate invoice total
async function recalculateInvoiceTotal(invoiceId: string) {
    const items = await prisma.invoiceItem.findMany({
        where: { invoiceId }
    })

    const total = items.reduce((sum, item) => sum + Number(item.amount), 0)

    await prisma.invoice.update({
        where: { id: invoiceId },
        data: { totalAmount: total }
    })
}
