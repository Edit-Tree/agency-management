'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { notifyTicketAssigned } from "@/lib/notifications"

export async function updateTicketAssignments(
    ticketId: string,
    assigneeId: string | null,
    managerId: string | null
) {
    await prisma.ticket.update({
        where: { id: ticketId },
        data: {
            assignedToId: assigneeId === "unassigned" ? null : assigneeId,
            managerId: managerId === "unassigned" ? null : managerId
        }
    })

    // Send email notifications
    if (assigneeId && assigneeId !== "unassigned") {
        await notifyTicketAssigned(ticketId, assigneeId, managerId || undefined)
    }

    revalidatePath('/dashboard/projects')
    return { success: true }
}
