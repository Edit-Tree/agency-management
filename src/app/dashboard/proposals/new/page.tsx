import { prisma } from "@/lib/prisma"
import { CreateProposalForm } from "@/components/create-proposal-form"

export default async function NewProposalPage() {
    const clients = await prisma.clientProfile.findMany({
        include: { user: true }
    })

    const projects = await prisma.project.findMany({
        where: { status: 'ACTIVE' }
    })

    const serializedProjects = projects.map(project => ({
        ...project,
        budget: project.budget ? Number(project.budget) : null
    }))

    return (
        <div className="max-w-3xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Create New Proposal</h1>
            <CreateProposalForm clients={clients} projects={serializedProjects as any} />
        </div>
    )
}
