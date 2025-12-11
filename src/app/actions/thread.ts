'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { notifyTicketAssigned, notifyReviewRequested, notifyCommentAdded } from "@/lib/notifications"

export async function updateTicketAssignment(ticketId: string, assigneeId: string) {
    await prisma.ticket.update({
        where: { id: ticketId },
        data: { assignedToId: assigneeId === "unassigned" ? null : assigneeId }
    })

    // Send email notification
    if (assigneeId !== "unassigned") {
        await notifyTicketAssigned(ticketId, assigneeId)
    }

    revalidatePath('/dashboard/projects')
    return { success: true }
}

export async function updateReviewStatus(ticketId: string, status: 'REQUESTED' | 'APPROVED' | 'REJECTED') {
    await prisma.ticket.update({
        where: { id: ticketId },
        data: { reviewStatus: status }
    })

    // Send email notification when review is requested
    if (status === 'REQUESTED') {
        await notifyReviewRequested(ticketId)
    }

    revalidatePath('/dashboard/projects')
    return { success: true }
}

export async function addComment(ticketId: string, content: string, imageUrl?: string, parentId?: string) {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        throw new Error('Unauthorized')
    }

    console.log('=== SAVING COMMENT ===')
    console.log('Content:', content)
    console.log('Content type:', typeof content)
    console.log('First 100 chars:', content.substring(0, 100))

    const comment = await prisma.comment.create({
        data: {
            content,
            imageUrl: imageUrl || null,
            ticketId,
            authorId: session.user.id,
            parentId: parentId || null
        },
        include: {
            author: true
        }
    })

    console.log('Saved comment content:', comment.content.substring(0, 100))

    // Send email notification
    await notifyCommentAdded(ticketId, session.user.id, content)

    revalidatePath(`/dashboard/projects`)
    return comment
}

export async function toggleReaction(commentId: string, emoji: string) {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        throw new Error('Unauthorized')
    }

    const existingReaction = await prisma.commentReaction.findUnique({
        where: {
            commentId_userId_emoji: {
                commentId,
                userId: session.user.id,
                emoji
            }
        }
    })

    if (existingReaction) {
        await prisma.commentReaction.delete({
            where: { id: existingReaction.id }
        })
    } else {
        await prisma.commentReaction.create({
            data: {
                commentId,
                userId: session.user.id,
                emoji
            }
        })
    }

    revalidatePath('/dashboard/projects')
    return { success: true }
}

export async function deleteComment(commentId: string) {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        throw new Error('Unauthorized')
    }

    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: { author: true }
    })

    if (!comment) {
        throw new Error('Comment not found')
    }

    // Check permissions: Author or Admin
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    const isAdmin = user?.role === 'ADMIN'

    if (comment.authorId !== session.user.id && !isAdmin) {
        throw new Error('Forbidden')
    }

    await prisma.comment.delete({
        where: { id: commentId }
    })

    revalidatePath('/dashboard/projects')
    return { success: true }
}
