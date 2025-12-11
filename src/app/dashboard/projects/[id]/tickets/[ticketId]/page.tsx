import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { TicketThreadView } from "@/components/ticket-thread-view"

interface TicketThreadPageProps {
    params: Promise<{
        id: string
        ticketId: string
    }>
}

export default async function TicketThreadPage({ params }: TicketThreadPageProps) {
    const { id, ticketId } = await params
    const session = await getServerSession(authOptions)

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
            assignedTo: true,
            manager: true,
            comments: {
                include: {
                    author: true,
                    reactions: {
                        include: { user: true }
                    }
                },
                orderBy: { createdAt: 'asc' }
            },
            revisionHistory: {
                include: { user: true },
                orderBy: { createdAt: 'desc' }
            },
            createdBy: true,
            project: { include: { client: { include: { user: true } } } }
        }
    }) as any

    if (!ticket) notFound()

    const teamMembers = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'TEAM'] } }
    })

    const members = [
        ...teamMembers.map(u => ({ id: u.id, name: u.name || 'User', image: null })),
        ...(ticket.project.client?.user ? [{
            id: ticket.project.client.user.id,
            name: ticket.project.client.user.name || ticket.project.client.companyName,
            image: null
        }] : [])
    ]

    return (
        <TicketThreadView
            ticket={ticket}
            members={members}
            currentUser={session?.user}
            teamMembers={teamMembers}
        />
    )
}
