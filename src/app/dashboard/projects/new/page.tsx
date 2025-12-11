import { prisma } from "@/lib/prisma"
import { CreateProjectForm } from "@/components/create-project-form"

export default async function NewProjectPage() {
    const clients = await prisma.clientProfile.findMany({
        include: { user: true }
    })

    return (
        <div className="max-w-3xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
            <CreateProjectForm clients={clients} />
        </div>
    )
}
