'use server'

import { prisma } from "@/lib/prisma"
import { generatePaymentLink } from "@/lib/razorpay"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createInvoicePayment(invoiceId: string) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return { error: "Unauthorized" }
    }

    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
            client: {
                include: {
                    user: true
                }
            }
        }
    })

    if (!invoice) {
        return { error: "Invoice not found" }
    }

    if (invoice.status === 'PAID') {
        return { error: "Invoice is already paid" }
    }

    // Generate payment link
    const result = await generatePaymentLink({
        amount: Number(invoice.totalAmount),
        currency: invoice.currency,
        description: `Invoice #${invoice.invoiceNumber || invoice.proformaNumber}`,
        customer: {
            name: invoice.client.companyName,
            email: invoice.client.user.email,
            contact: invoice.client.phone || undefined
        },
        reference_id: invoice.id,
        callback_url: `${process.env.NEXTAUTH_URL}/dashboard/invoices/${invoice.id}?payment=success`
    })

    if (!result.success || !result.paymentLink) {
        return { error: result.error || "Failed to generate payment link" }
    }

    return { success: true, paymentLink: result.paymentLink }
}
