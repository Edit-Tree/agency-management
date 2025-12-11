'use server'

import { prisma } from "@/lib/prisma"
import { TicketStatus, InvoiceStatus, Ticket, Project, ClientProfile, InvoiceItem } from "@prisma/client"
import { revalidatePath } from "next/cache"

type TicketWithProject = Ticket & {
    project: Project & {
        client: ClientProfile
    }
}

export async function generateMonthEndInvoices() {
    // 1. Find all billable, completed tickets that are NOT yet invoiced
    const billableTickets = await prisma.ticket.findMany({
        where: {
            status: TicketStatus.DONE,
            isBillable: true,
            invoiceItems: {
                none: {} // Ensure not linked to any invoice item
            }
        },
        include: {
            project: {
                include: {
                    client: true
                }
            }
        }
    }) as TicketWithProject[]

    if (billableTickets.length === 0) {
        return { success: false, message: "No billable tickets found." }
    }

    // 2. Group tickets by Client
    const ticketsByClient = billableTickets.reduce((acc: Record<string, TicketWithProject[]>, ticket: TicketWithProject) => {
        const clientId = ticket.project.clientId
        if (!acc[clientId]) {
            acc[clientId] = []
        }
        acc[clientId].push(ticket)
        return acc
    }, {} as Record<string, TicketWithProject[]>)

    // 3. Create Draft Invoice for each Client
    let createdCount = 0

    for (const [clientId, tickets] of Object.entries(ticketsByClient)) {
        // Check if there's already a DRAFT invoice for this client for this month?
        // For simplicity, we'll just create a new one or append to existing DRAFT if we wanted to be fancy.
        // Let's create a new DRAFT for now.

        const totalAmount = tickets.length * 100 // Placeholder pricing: $100 per ticket. 
        // In real app, we'd calculate based on hours or fixed price.

        await prisma.invoice.create({
            data: {
                clientId,
                status: InvoiceStatus.DRAFT,
                totalAmount,
                items: {
                    create: tickets.map((ticket: TicketWithProject) => ({
                        description: `[${ticket.project.title}] ${ticket.title}`,
                        quantity: 1,
                        rate: 100, // Placeholder amount
                        amount: 100,
                        ticketId: ticket.id
                    }))
                }
            }
        })
        createdCount++
    }

    revalidatePath('/dashboard/invoices')
    return { success: true, message: `Generated ${createdCount} draft invoices.` }
}

export async function updateInvoiceItems(invoiceId: string, items: InvoiceItem[]) {
    for (const item of items) {
        await prisma.invoiceItem.update({
            where: { id: item.id },
            data: {
                description: item.description,
                amount: item.amount
            }
        })
    }

    const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0)
    await prisma.invoice.update({
        where: { id: invoiceId },
        data: { totalAmount }
    })

    revalidatePath(`/dashboard/invoices/${invoiceId}`)
}
