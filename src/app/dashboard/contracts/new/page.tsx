import { prisma } from "@/lib/prisma"
import { CreateContractForm } from "@/components/create-contract-form"

export default async function NewContractPage() {
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
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Create New Contract</h1>
            <CreateContractForm clients={clients} projects={serializedProjects as any} />
        </div>
    )
}
