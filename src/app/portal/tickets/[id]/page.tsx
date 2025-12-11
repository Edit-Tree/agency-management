import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { addComment, updateReviewStatus } from "@/app/actions/thread"
import { format } from "date-fns"

interface PortalTicketPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function PortalTicketPage({ params }: PortalTicketPageProps) {
    const { id } = await params
    const session = await getServerSession(authOptions)

    const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
            assignedTo: true,
            comments: {
                include: { author: true },
                orderBy: { createdAt: 'asc' }
            },
            project: true
        }
    })

    if (!ticket) notFound()

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6">
            {/* Main Thread Area */}
            <div className="flex-1 flex flex-col space-y-4">
                <Card className="flex-1 flex flex-col">
                    <CardHeader className="border-b">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl">{ticket.title}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {ticket.project.title}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Badge>{ticket.status}</Badge>
                                {ticket.reviewStatus !== 'NONE' && (
                                    <Badge variant={ticket.reviewStatus === 'APPROVED' ? 'default' : ticket.reviewStatus === 'REJECTED' ? 'destructive' : 'secondary'}>
                                        Review: {ticket.reviewStatus}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <p className="text-sm mt-4">{ticket.description}</p>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                        {ticket.comments.map((comment) => (
                            <div key={comment.id} className={`flex gap-3 ${comment.authorId === session?.user?.id ? 'flex-row-reverse' : ''}`}>
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{comment.author.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${comment.authorId === session?.user?.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white dark:bg-gray-800 border'
                                    }`}>
                                    <div className="font-semibold text-xs mb-1 opacity-70">
                                        {comment.author.name} • {format(new Date(comment.createdAt), 'p')}
                                    </div>
                                    {comment.content}
                                </div>
                            </div>
                        ))}
                    </CardContent>

                    <div className="p-4 border-t bg-white dark:bg-gray-800">
                        <form action={async (formData) => {
                            'use server'
                            await addComment(id, formData.get('content') as string)
                        }} className="flex gap-2">
                            <Textarea name="content" placeholder="Type a message..." className="min-h-[2.5rem] max-h-32" required />
                            <Button type="submit">Send</Button>
                        </form>
                    </div>
                </Card>
            </div>

            {/* Sidebar Controls for Client */}
            <div className="w-80 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {ticket.reviewStatus === 'REQUESTED' && (
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">The team has requested a review for this ticket.</p>
                                <div className="flex gap-2">
                                    <form action={async () => {
                                        'use server'
                                        await updateReviewStatus(id, 'APPROVED')
                                    }} className="flex-1">
                                        <Button className="w-full" variant="default">Approve</Button>
                                    </form>
                                    <form action={async () => {
                                        'use server'
                                        await updateReviewStatus(id, 'REJECTED')
                                    }} className="flex-1">
                                        <Button className="w-full" variant="destructive">Reject</Button>
                                    </form>
                                </div>
                            </div>
                        )}
                        {ticket.reviewStatus === 'APPROVED' && (
                            <div className="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md text-sm">
                                You approved this work.
                            </div>
                        )}
                        {ticket.reviewStatus === 'REJECTED' && (
                            <div className="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md text-sm">
                                You rejected this work.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
