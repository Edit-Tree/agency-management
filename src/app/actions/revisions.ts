'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createRevisionHistory(
    ticketId: string,
    userId: string,
    type: 'SUBMITTED' | 'REVISION_REQUESTED' | 'APPROVED',
    message?: string,
    images?: string[]
) {
    await prisma.revisionHistory.create({
        data: {
            ticketId,
            userId,
            type,
            message,
            images: images || []
        }
    })

    revalidatePath(`/dashboard/projects`)
    return { success: true }
}

export async function requestRevision(
    ticketId: string,
    userId: string,
    message: string,
    images: string[]
) {
    // Create revision history entry
    await createRevisionHistory(ticketId, userId, 'REVISION_REQUESTED', message, images)

    // Update ticket review status back to IN_PROGRESS
    await prisma.ticket.update({
        where: { id: ticketId },
        data: { reviewStatus: 'NONE' }
    })

    revalidatePath(`/dashboard/projects`)
    return { success: true }
}

export async function submitForReview(ticketId: string, userId: string) {
    // Create revision history entry
    await createRevisionHistory(ticketId, userId, 'SUBMITTED')

    revalidatePath(`/dashboard/projects`)
    return { success: true }
}
