import { prisma } from "@/lib/prisma"
import { TicketBoard } from "@/components/ticket-board"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ProjectAiInsights } from "@/components/project-ai-insights"

interface ProjectDetailsPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
    const { id } = await params
    const session = await getServerSession(authOptions)

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            client: true,
            tickets: {
                include: {
                    assignedTo: true,
                    _count: {
                        select: { comments: true }
                    }
                }
            }
        }
    })

    if (!project) {
        notFound()
    }

    const canSeeBudget = session?.user?.role === 'ADMIN' || session?.user?.role === 'CLIENT'
    const canSeeClient = session?.user?.role === 'ADMIN'

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <Link
                        href="/dashboard/projects"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Projects
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                    <p className="text-muted-foreground mt-1">{project.description}</p>
                    {canSeeClient && (
                        <p className="text-sm text-muted-foreground mt-2">Client: {project.client.companyName}</p>
                    )}
                    {canSeeBudget && project.budget && (
                        <p className="text-sm text-muted-foreground">Budget: ${Number(project.budget).toLocaleString()} {project.currency}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <ProjectAiInsights projectId={project.id} />
                    <Button asChild variant="outline">
                        <Link href={`/dashboard/projects/${project.id}/edit`}>
                            Edit Project
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/dashboard/projects/${project.id}/tickets/new`}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Ticket
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <TicketBoard tickets={project.tickets} projectId={project.id} />
            </div>
        </div>
    )
}
