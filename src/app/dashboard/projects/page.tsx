import { prisma } from "@/lib/prisma"
import { ProjectCard } from "@/components/project-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface ProjectsPageProps {
    searchParams: Promise<{
        status?: string
    }>
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
    const { status } = await searchParams
    const where: any = {}

    if (status) {
        where.status = status
    }

    const projects = await prisma.project.findMany({
        where,
        include: {
            client: true,
            _count: {
                select: { tickets: true }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                <Button asChild>
                    <Link href="/dashboard/projects/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Link>
                </Button>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-medium">No projects found</h3>
                    <p className="text-sm text-muted-foreground mt-1">Get started by creating a new project.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}
        </div>
    )
}
