import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { EditClientForm } from "@/components/edit-client-form"

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const { id } = await params
    const client = await prisma.clientProfile.findUnique({
        where: { id },
        include: { user: true }
    })

    if (!client) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/clients/${id}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Edit Client</h1>
            </div>

            <EditClientForm client={client} />
        </div>
    )
}
