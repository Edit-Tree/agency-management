import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TicketForm } from "@/components/ticket-form"
import { notFound } from "next/navigation"

interface NewTicketPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function NewTicketPage({ params }: NewTicketPageProps) {
    const { id } = await params

    const project = await prisma.project.findUnique({
        where: { id }
    })

    if (!project) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Ticket for {project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <TicketForm projectId={id} />
                </CardContent>
            </Card>
        </div>
    )
}
