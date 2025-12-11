'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createTicket(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const projectId = formData.get('projectId') as string

    if (!title || !projectId) {
        return { error: "Title and Project ID are required" }
    }

    try {
        await prisma.ticket.create({
            data: {
                title,
                description,
                projectId,
                createdById: session.user.id,
                status: 'OPEN'
            }
        })
    } catch (error) {
        console.error("Error creating ticket:", error)
        return { error: "Failed to create ticket" }
    }

    revalidatePath(`/dashboard/projects/${projectId}`)
    redirect(`/dashboard/projects/${projectId}`)
}

export async function updateTicketStatus(ticketId: string, status: any, projectId: string) {
    await prisma.ticket.update({
        where: { id: ticketId },
        data: { status }
    })
    revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function updateTicket(ticketId: string, data: { title: string, description: string }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    try {
        const ticket = await prisma.ticket.update({
            where: { id: ticketId },
            data: {
                title: data.title,
                description: data.description
            },
            include: { project: true }
        })
        revalidatePath(`/dashboard/projects/${ticket.projectId}/tickets/${ticketId}`)
        revalidatePath(`/dashboard/projects/${ticket.projectId}`)
        return { success: true }
    } catch (error) {
        console.error("Error updating ticket:", error)
        return { error: "Failed to update ticket" }
    }
}
