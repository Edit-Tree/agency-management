import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default async function TasksDashboard() {
    const session = await getServerSession(authOptions)

    const tickets = await prisma.ticket.findMany({
        where: {
            status: {
                not: 'DONE'
            }
        },
        include: {
            project: {
                include: {
                    client: true
                }
            },
            assignedTo: true,
            comments: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    })

    return (
        <div className="flex flex-col h-full gap-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Active Tasks</h1>
                <Badge variant="outline" className="px-3 py-1 text-sm bg-background">
                    {tickets.length} Active
                </Badge>
            </div>

            <Card className="flex-1 overflow-hidden">
                <div className="h-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                            <TableRow>
                                <TableHead className="w-[400px]">Task</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead className="text-right">Last Update</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No active tasks found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tickets.map((ticket) => (
                                    <TableRow key={ticket.id} className="group hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            <Link
                                                href={`/dashboard/projects/${ticket.projectId}/tickets/${ticket.id}`}
                                                className="block hover:underline underline-offset-4 decoration-muted-foreground/50 hover:decoration-primary"
                                            >
                                                <span className="text-base font-semibold">{ticket.title}</span>
                                                {ticket.description && (
                                                    <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5 font-normal">
                                                        {ticket.description.replace(/<[^>]*>/g, '').substring(0, 60)}...
                                                    </div>
                                                )}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-normal border bg-muted/50">
                                                {ticket.project.title}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium text-sm">
                                                {ticket.project.client.companyName}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={cn("text-[10px] px-2 py-0.5 font-medium border", {
                                                    'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300': ticket.status === 'REVIEW',
                                                    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300': ticket.status === 'IN_PROGRESS',
                                                    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300': ticket.status === 'OPEN',
                                                })}
                                            >
                                                {ticket.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {ticket.assignedTo ? (
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-[10px]">
                                                            {ticket.assignedTo.name?.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm text-muted-foreground">{ticket.assignedTo.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">Unassigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            {format(new Date(ticket.updatedAt), 'MMM d, h:mm a')}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
