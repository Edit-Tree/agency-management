import { prisma } from "@/lib/prisma"
import { TicketBoard } from "@/components/ticket-board"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface PortalProjectDetailsPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function PortalProjectDetailsPage({ params }: PortalProjectDetailsPageProps) {
    const { id } = await params

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            tickets: {
                include: {
                    assignedTo: true
                }
            }
        }
    })

    if (!project) {
        notFound()
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                    <p className="text-muted-foreground">Project Board</p>
                </div>
                {/* Placeholder for "Raise Ticket" - to be implemented later if needed */}
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Raise Ticket
                </Button>
            </div>

            <div className="flex-1 overflow-hidden">
                <TicketBoard tickets={project.tickets} projectId={project.id} isClientPortal={true} />
            </div>
        </div>
    )
}
