'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function deliverWork(ticketId: string, data: { message: string, format: string, attachments?: string[] }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
        if (!ticket) return { error: "Ticket not found" }

        await prisma.$transaction([
            prisma.ticket.update({
                where: { id: ticketId },
                data: { status: 'DONE', reviewStatus: 'REQUESTED' }
            }),
            prisma.revisionHistory.create({
                data: {
                    ticketId,
                    type: 'SUBMITTED',
                    userId: session.user.id,
                    message: data.message,
                    images: data.attachments || [] // Using images field for generic attachments for now, or just images
                }
            })
        ])

        revalidatePath(`/dashboard/projects/${ticket.projectId}/tickets/${ticketId}`)
        return { success: true }
    } catch (error) {
        console.error("Error delivering work:", error)
        return { error: "Failed to deliver work" }
    }
}

export async function requestRevision(ticketId: string, message: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
        if (!ticket) return { error: "Ticket not found" }

        await prisma.$transaction([
            prisma.ticket.update({
                where: { id: ticketId },
                data: { status: 'IN_REVISION', reviewStatus: 'REJECTED' }
            }),
            prisma.revisionHistory.create({
                data: {
                    ticketId,
                    type: 'REVISION_REQUESTED',
                    userId: session.user.id,
                    message
                }
            })
        ])

        revalidatePath(`/dashboard/projects/${ticket.projectId}/tickets/${ticketId}`)
        return { success: true }
    } catch (error) {
        console.error("Error requesting revision:", error)
        return { error: "Failed to request revision" }
    }
}

export async function approveWork(ticketId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
        if (!ticket) return { error: "Ticket not found" }

        await prisma.$transaction([
            prisma.ticket.update({
                where: { id: ticketId },
                data: { status: 'DONE', reviewStatus: 'APPROVED' }
            }),
            prisma.revisionHistory.create({
                data: {
                    ticketId,
                    type: 'APPROVED',
                    userId: session.user.id,
                }
            })
        ])

        revalidatePath(`/dashboard/projects/${ticket.projectId}/tickets/${ticketId}`)
        return { success: true }
    } catch (error) {
        console.error("Error approving work:", error)
        return { error: "Failed to approve work" }
    }
}
