import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { redirect } from "next/navigation"

export default async function RaiseTicketPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        redirect('/login')
    }

    // Get client's projects
    const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            projects: true
        }
    })

    if (!clientProfile) {
        return <div>Client profile not found</div>
    }

    async function createTicket(formData: FormData) {
        'use server'

        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return

        const projectId = formData.get('projectId') as string
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const deadlineStr = formData.get('deadline') as string

        if (!projectId || !title) {
            return
        }

        await prisma.ticket.create({
            data: {
                title,
                description,
                projectId,
                createdById: session.user.id,
                status: 'OPEN',
                deadline: deadlineStr ? new Date(deadlineStr) : null
            }
        })

        // Send email notification to team
        const { notifyTicketCreated } = await import('@/lib/notifications')
        const ticket = await prisma.ticket.findFirst({
            where: { title, projectId },
            orderBy: { createdAt: 'desc' }
        })
        if (ticket) {
            await notifyTicketCreated(ticket.id)
        }

        redirect('/portal')
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Raise a New Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createTicket} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="projectId">Project</Label>
                            <Select name="projectId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clientProfile.projects.map(project => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" rows={5} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deadline">Deadline (Optional)</Label>
                            <Input id="deadline" name="deadline" type="date" />
                            <p className="text-xs text-muted-foreground">Set a deadline for this task</p>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="submit">Submit Ticket</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
