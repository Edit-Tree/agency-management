"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format, isSameDay } from "date-fns"
import { CommentForm } from "@/components/comment-form"
import { CommentReactions } from "@/components/comment-reactions"
import { RichTextEditor } from "@/components/rich-text-editor"
import ReactMarkdown from "react-markdown"
import { EditTicketDialog } from "@/components/edit-ticket-dialog"
import { ArrowLeft, MessageSquare, X, CheckCircle, GripVertical, Trash2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { TicketAiActions } from "@/components/ticket-ai-actions"
import { DualAssignment } from "@/components/dual-assignment"
import { ReviewDialog } from "@/components/review-dialog"
import { RevisionTimeline } from "@/components/revision-timeline"
import { updateReviewStatus, deleteComment } from "@/app/actions/thread"
import { DeliverWorkDialog } from "@/components/deliver-work-dialog"
import { RequestRevisionDialog } from "@/components/request-revision-dialog"
import { approveWork } from "@/app/actions/delivery"
import { toast } from "sonner"

interface TicketThreadViewProps {
    ticket: any
    members: any[]
    currentUser: any
    teamMembers: any[]
}

export function TicketThreadView({ ticket, members, currentUser, teamMembers }: TicketThreadViewProps) {
    const allComments = ticket.comments || []
    const rootComments = allComments.filter((c: any) => !c.parentId)

    const [activeThreadId, setActiveThreadId] = useState<string | null>(rootComments[0]?.id || null)
    const [sidebarWidth, setSidebarWidth] = useState(350)
    const sidebarRef = useRef<HTMLDivElement>(null)
    const isResizing = useRef(false)

    const activeThreadComment = activeThreadId ? allComments.find((c: any) => c.id === activeThreadId) : null
    const threadReplies = activeThreadId ? allComments.filter((c: any) => c.parentId === activeThreadId) : []

    const isClient = currentUser?.role === 'CLIENT'

    const handleDelete = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return
        try {
            await deleteComment(commentId)
            toast.success('Comment deleted')
            if (activeThreadId === commentId) {
                setActiveThreadId(null)
            }
        } catch (error) {
            toast.error('Failed to delete comment')
            console.error(error)
        }
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing.current) return
            const newWidth = window.innerWidth - e.clientX
            setSidebarWidth(Math.max(300, Math.min(800, newWidth)))
        }
        const handleMouseUp = () => {
            isResizing.current = false
            document.body.style.cursor = 'default'
        }
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [])

    return (
        <div className="flex h-full gap-0 bg-background">
            {/* Main Thread Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-background min-w-0">
                <div className="h-14 border-b flex items-center px-4 shrink-0 bg-white dark:bg-gray-950">
                    <Link
                        href={`/dashboard/projects/${ticket.projectId}`}
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Board
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                    {/* Enhanced Ticket Header Card */}
                    <div className="space-y-4 w-full">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                    {ticket.title}
                                    <EditTicketDialog ticket={{ id: ticket.id, title: ticket.title, description: ticket.description }} />
                                </h1>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Badge variant="outline" className="font-normal">
                                        {ticket.project.title}
                                    </Badge>
                                    <span>•</span>
                                    <span>Created {format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <Avatar className="h-5 w-5">
                                            <AvatarFallback className="text-[10px]">
                                                {ticket.createdBy.name?.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>{ticket.createdBy.name}</span>
                                    </div>
                                </div>
                            </div>
                            <Badge
                                className={cn("text-xs font-semibold px-2 py-1 capitalize", {
                                    'bg-blue-100 text-blue-700 hover:bg-blue-100': ticket.status === 'IN_PROGRESS',
                                    'bg-green-100 text-green-700 hover:bg-green-100': ticket.status === 'REVIEW' || ticket.status === 'DONE',
                                    'bg-orange-100 text-orange-700 hover:bg-orange-100': ticket.status === 'IN_REVISION',
                                    'bg-gray-100 text-gray-700 hover:bg-gray-100': ticket.status === 'OPEN',
                                })}
                            >
                                {ticket.status.replace('_', ' ')}
                            </Badge>
                        </div>

                        {/* Beautiful Description Card */}
                        {ticket.description && (
                            <div className="group relative bg-card rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600"></div>
                                <div className="p-6 pl-7">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-foreground/90 uppercase tracking-widest flex items-center gap-2">
                                            Description
                                        </h3>
                                    </div>
                                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:leading-relaxed">
                                        <ReactMarkdown>
                                            {ticket.description}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-full border-t pt-6">
                        <h3 className="text-sm font-semibold text-muted-foreground mb-4">Activity & Comments</h3>

                        {/* Comments List */}
                        <div className="space-y-6">
                            {rootComments.map((comment: any, index: number) => {
                                const isClient = comment.author.role === 'CLIENT'
                                const repliesCount = allComments.filter((c: any) => c.parentId === comment.id).length
                                const prevComment = index > 0 ? rootComments[index - 1] : null
                                const showDateDivider = !prevComment || !isSameDay(new Date(prevComment.createdAt), new Date(comment.createdAt))

                                return (
                                    <div key={comment.id} className="relative">
                                        {showDateDivider && (
                                            <div className="relative flex items-center py-6">
                                                <div className="flex-grow border-t"></div>
                                                <span className="flex-shrink-0 mx-4 text-xs font-medium text-muted-foreground">
                                                    {format(new Date(comment.createdAt), 'MMMM d, yyyy')}
                                                </span>
                                                <div className="flex-grow border-t"></div>
                                            </div>
                                        )}

                                        <div className={cn(
                                            "group flex gap-3 p-3 rounded-lg transition-colors",
                                            activeThreadId === comment.id ? "bg-accent/50" : "hover:bg-accent/30"
                                        )}>
                                            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                                <AvatarFallback className={cn("font-semibold", isClient ? "bg-amber-100 text-amber-700" : "")}>
                                                    {comment.author.name?.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {comment.author.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(comment.createdAt), 'h:mm a')}
                                                    </span>
                                                    {isClient && (
                                                        <Badge variant="secondary" className="text-[10px] px-1 h-5 text-amber-700 bg-amber-100 hover:bg-amber-100 border-none">
                                                            CLIENT
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div
                                                    className={cn(
                                                        "text-sm text-foreground/90 leading-relaxed prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
                                                        "[&_ul]:list-disc [&_ul]:pl-4",
                                                        "[&_ol]:list-decimal [&_ol]:pl-4",
                                                        "[&_pre]:!bg-zinc-900 [&_pre]:!text-zinc-100 [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:my-2 [&_pre]:overflow-x-auto",
                                                        "[&_code]:bg-muted [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm",
                                                        "[&_pre_*]:!bg-transparent [&_pre_*]:!p-0 [&_pre_*]:!text-inherit",
                                                        "[&_pre_span]:!bg-transparent [&_pre_span]:!p-0 [&_pre_span]:!text-inherit",
                                                        "[&_pre_div]:!bg-transparent [&_pre_div]:!p-0 [&_pre_div]:!text-inherit",
                                                        "[&_pre_code]:!bg-transparent [&_pre_code]:!p-0 [&_pre_code]:!text-zinc-100 [&_pre_code]:!rounded-none",
                                                        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:my-2 [&_blockquote]:italic [&_blockquote]:bg-muted/30",
                                                        "[&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-4"
                                                    )}
                                                    dangerouslySetInnerHTML={{
                                                        __html: (() => {
                                                            // Decode HTML entities if present
                                                            const decoded = comment.content
                                                                .replace(/&lt;/g, '<')
                                                                .replace(/&gt;/g, '>')
                                                                .replace(/&amp;/g, '&')
                                                                .replace(/&quot;/g, '"')
                                                                .replace(/&#39;/g, "'");

                                                            // Check if it's HTML or plain text
                                                            return decoded.trim().startsWith('<')
                                                                ? decoded
                                                                : `<p>${decoded.replace(/\n/g, '<br>')}</p>`;
                                                        })()
                                                    }}
                                                />

                                                {comment.imageUrl && (
                                                    <img src={comment.imageUrl} alt="Attachment" className="mt-3 max-w-sm rounded-lg border shadow-sm" />
                                                )}

                                                <div className="flex items-center gap-4 pt-2">
                                                    <CommentReactions
                                                        commentId={comment.id}
                                                        reactions={comment.reactions}
                                                        currentUserId={currentUser?.id || ''}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={cn("h-6 px-2 text-xs gap-1.5", activeThreadId === comment.id && "bg-accent text-accent-foreground")}
                                                        onClick={() => setActiveThreadId(comment.id)}
                                                    >
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                        {repliesCount > 0 ? `${repliesCount} Replies` : 'Reply'}
                                                    </Button>

                                                    {(currentUser?.id === comment.authorId || currentUser?.role === 'ADMIN') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => handleDelete(comment.id)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="pb-4"></div>
                </div>

                {/* Fixed Bottom Input Area */}
                <div className="p-4 border-t bg-background z-20 shrink-0">
                    <div className="w-full">
                        <CommentForm ticketId={ticket.id} members={members} />
                    </div>
                </div>
            </div>

            {/* Resizable Sidebar with Drag Handle */}
            <div
                ref={sidebarRef}
                style={{ width: sidebarWidth }}
                className="flex flex-col border-l bg-gray-50/50 dark:bg-gray-900/50 shrink-0 relative transition-[width] duration-0 ease-linear"
            >
                {/* Drag Handle */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-50 flex items-center justify-center group"
                    onMouseDown={(e) => {
                        isResizing.current = true
                        document.body.style.cursor = 'col-resize'
                        e.preventDefault()
                    }}
                >
                    <div className="h-4 w-0.5 bg-border group-hover:bg-primary rounded-full transition-colors" />
                </div>

                {/* ALWAYS VISIBLE ACTIONS HEADER */}
                <div className="flex-none p-4 border-b bg-background/80 backdrop-blur-sm z-10">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold">Action Needed</h2>
                        <Badge variant={ticket.status === 'DONE' ? 'secondary' : ticket.status === 'IN_REVISION' ? 'destructive' : 'outline'}>
                            {ticket.status.replace('_', ' ')}
                        </Badge>
                    </div>

                    <div className="space-y-3">
                        {/* Team Actions: Deliver Work */}
                        {!isClient && (ticket.status !== 'DONE') && (
                            <DeliverWorkDialog ticketId={ticket.id} projectId={ticket.projectId} />
                        )}

                        {/* Client Actions: Request Revision or Approve */}
                        {isClient && ticket.status === 'DONE' && (
                            <div className="space-y-2">
                                <div className="text-xs text-center text-muted-foreground">
                                    Approved the deliverables?
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <RequestRevisionDialog ticketId={ticket.id} />
                                    <Button
                                        className="bg-green-600 hover:bg-green-700 text-white gap-2 w-full"
                                        onClick={async () => {
                                            const res = await approveWork(ticket.id)
                                            if (res.success) toast.success("Work Approved!")
                                            else toast.error("Failed to approve")
                                        }}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Approve
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Status Messages */}
                        {ticket.status === 'DONE' && !isClient && (
                            <div className="text-xs text-center text-muted-foreground bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-2 rounded border border-amber-200/50">
                                Pending Client Approval
                            </div>
                        )}

                        {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && isClient && (
                            <div className="text-xs text-center text-muted-foreground p-2">
                                Team is working on your request.
                            </div>
                        )}
                    </div>
                </div>

                {/* Scrollable Sidebar Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeThreadId && activeThreadComment ? (
                        /* THREAD VIEW */
                        <Card className="flex flex-col h-full shadow-md border-primary/20">
                            <CardHeader className="py-3 border-b flex flex-row items-center justify-between bg-muted/30">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium">Thread</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActiveThreadId(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
                                {/* Parent Comment */}
                                <div className="bg-background border rounded-lg p-3 group">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-5 w-5">
                                                <AvatarFallback className="text-[10px]">
                                                    {activeThreadComment.author.name?.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs font-semibold">{activeThreadComment.author.name}</span>
                                            <span className="text-[10px] text-muted-foreground">{format(new Date(activeThreadComment.createdAt), 'h:mm a')}</span>
                                        </div>
                                        {(currentUser?.id === activeThreadComment.authorId || currentUser?.role === 'ADMIN') && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDelete(activeThreadComment.id)}
                                            >
                                                <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className={cn(
                                        "text-sm text-foreground/90 prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
                                        "[&_ul]:list-disc [&_ul]:pl-4",
                                        "[&_ol]:list-decimal [&_ol]:pl-4",
                                        "[&_pre]:!bg-zinc-900 [&_pre]:!text-zinc-100 [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:my-2 [&_pre]:overflow-x-auto",
                                        "[&_code]:bg-muted [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm",
                                        "[&_pre_*]:!bg-transparent [&_pre_*]:!p-0 [&_pre_*]:!text-inherit",
                                        "[&_pre_code]:!bg-transparent [&_pre_code]:!p-0 [&_pre_code]:!text-zinc-100 [&_pre_code]:!rounded-none",
                                        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:my-2 [&_blockquote]:italic [&_blockquote]:bg-muted/30"
                                    )} dangerouslySetInnerHTML={{ __html: activeThreadComment.content }} />
                                </div>

                                {/* Replies */}
                                <div className="space-y-3 pl-2 border-l-2">
                                    {threadReplies.map((reply: any) => (
                                        <div key={reply.id} className="bg-background/50 rounded-lg p-2 group">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold">{reply.author.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{format(new Date(reply.createdAt), 'h:mm a')}</span>
                                                </div>
                                                {(currentUser?.id === reply.authorId || currentUser?.role === 'ADMIN') && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleDelete(reply.id)}
                                                    >
                                                        <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className={cn(
                                                "text-sm prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
                                                "[&_ul]:list-disc [&_ul]:pl-4",
                                                "[&_ol]:list-decimal [&_ol]:pl-4",
                                                "[&_pre]:!bg-zinc-900 [&_pre]:!text-zinc-100 [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:my-2 [&_pre]:overflow-x-auto",
                                                "[&_code]:bg-muted [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm",
                                                "[&_pre_*]:!bg-transparent [&_pre_*]:!p-0 [&_pre_*]:!text-inherit",
                                                "[&_pre_code]:!bg-transparent [&_pre_code]:!p-0 [&_pre_code]:!text-zinc-100 [&_pre_code]:!rounded-none",
                                                "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:my-2 [&_blockquote]:italic [&_blockquote]:bg-muted/30"
                                            )} dangerouslySetInnerHTML={{ __html: reply.content }} />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <div className="p-3 border-t bg-background">
                                <CommentForm ticketId={ticket.id} members={members} parentId={activeThreadId} placeholder="Reply to thread..." />
                            </div>
                        </Card>
                    ) : (
                        /* DETAILS & HISTORY VIEW */
                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="py-3 px-4">
                                    <CardTitle className="text-sm font-medium">Details</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-4">
                                    <TicketAiActions ticketId={ticket.id} />
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Assignments</label>
                                        <DualAssignment
                                            ticketId={ticket.id}
                                            currentAssigneeId={ticket.assignedToId}
                                            currentManagerId={ticket.managerId}
                                            teamMembers={teamMembers}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <RevisionTimeline events={ticket.revisionHistory} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
