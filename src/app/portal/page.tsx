import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, FileCheck, AlertCircle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function PortalPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return <div>Please log in</div>
    }

    // Get client's data
    const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            projects: {
                include: {
                    tickets: true
                }
            }
        }
    })

    if (!clientProfile) {
        return <div>Client profile not found</div>
    }

    // Calculate stats
    const allTickets = clientProfile.projects.flatMap(p => p.tickets)
    const openTickets = allTickets.filter(t => t.status === 'OPEN').length
    const inProgressTickets = allTickets.filter(t => t.status === 'IN_PROGRESS').length
    const completedThisMonth = allTickets.filter(t => {
        if (t.status !== 'DONE') return false
        const now = new Date()
        const ticketDate = new Date(t.updatedAt)
        return ticketDate.getMonth() === now.getMonth() && ticketDate.getFullYear() === now.getFullYear()
    }).length

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session.user.name}</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{openTickets}</div>
                        <p className="text-xs text-muted-foreground">Waiting for team response</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inProgressTickets}</div>
                        <p className="text-xs text-muted-foreground">Currently being worked on</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed this Month</CardTitle>
                        <FileCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedThisMonth}</div>
                        <p className="text-xs text-muted-foreground">Tasks completed</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Projects</CardTitle>
                </CardHeader>
                <CardContent>
                    {clientProfile.projects.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No projects yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {clientProfile.projects.map(project => (
                                <div key={project.id} className="flex justify-between items-center p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{project.title}</p>
                                        <p className="text-sm text-muted-foreground">{project.tickets.length} tickets</p>
                                    </div>
                                    <a href={`/portal/projects/${project.id}`} className="text-sm text-blue-600 hover:underline">
                                        View →
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
