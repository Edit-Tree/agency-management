import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ProjectCard } from "@/components/project-card"
import { redirect } from "next/navigation"

export default async function PortalProjectsPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        redirect("/login")
    }

    // Find the client profile for the logged in user
    const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id }
    })

    if (!clientProfile) {
        return <div>Client profile not found. Please contact support.</div>
    }

    const projects = await prisma.project.findMany({
        where: { clientId: clientProfile.id },
        include: {
            client: true,
            _count: {
                select: { tickets: true }
            }
        }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} href={`/portal/projects/${project.id}`} />
                ))}
            </div>
        </div>
    )
}
