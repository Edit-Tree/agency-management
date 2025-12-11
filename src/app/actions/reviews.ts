'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { notifyReviewApproved } from "@/lib/notifications"

export async function approveWithReview(ticketId: string, rating: number, review: string) {
    await prisma.ticket.update({
        where: { id: ticketId },
        data: {
            reviewStatus: 'APPROVED',
            rating,
            clientReview: review
        }
    })

    // Send email notification
    await notifyReviewApproved(ticketId, rating, review)

    revalidatePath(`/dashboard/projects`)
    return { success: true }
}

export async function addCommentWithImage(ticketId: string, content: string, imageUrl?: string) {
    const comment = await prisma.comment.create({
        data: {
            ticketId,
            content,
            imageUrl,
            authorId: '' // This should come from session
        }
    })

    revalidatePath(`/dashboard/projects`)
    return { success: true, comment }
}
