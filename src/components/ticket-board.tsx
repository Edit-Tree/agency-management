'use client'

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor
} from "@dnd-kit/core"
import { useState, useMemo } from "react"
import { updateTicketStatus } from "@/app/actions/tickets"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { startOfWeek, startOfMonth, isAfter, format } from "date-fns"

// Define TicketStatus locally to avoid importing from @prisma/client in a client component
enum TicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    REVIEW = 'REVIEW',
    DONE = 'DONE'
}

interface Ticket {
    id: string
    title: string
    description: string | null
    status: TicketStatus | string // Allow string for compatibility
    assignedTo: { name: string | null } | null
    createdAt: Date
    _count?: { comments: number }
}

interface TicketBoardProps {
    tickets: any[] // Use any[] to avoid strict type mismatch with Prisma types passed from server
    projectId: string
    isClientPortal?: boolean
}

const COLUMNS = [
    { id: TicketStatus.OPEN, title: "Open", color: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900", badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", buttonColor: "bg-red-500 hover:bg-red-600 text-white shadow-sm" },
    { id: TicketStatus.IN_PROGRESS, title: "In Progress", color: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900", badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", buttonColor: "bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm" },
    { id: TicketStatus.REVIEW, title: "Review", color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900", badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", buttonColor: "bg-blue-500 hover:bg-blue-600 text-white shadow-sm" },
    { id: TicketStatus.DONE, title: "Done", color: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900", badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", buttonColor: "bg-green-500 hover:bg-green-600 text-white shadow-sm" },
]

function DraggableTicket({ ticket, projectId, isClientPortal }: { ticket: Ticket, projectId: string, isClientPortal: boolean }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: ticket.id,
        data: { ticket }
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="opacity-50">
                <TicketCard ticket={ticket} projectId={projectId} isClientPortal={isClientPortal} />
            </div>
        )
    }

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <TicketCard ticket={ticket} projectId={projectId} isClientPortal={isClientPortal} />
        </div>
    )
}

function DroppableColumn({ id, title, tickets, children, color, badgeColor }: { id: string, title: string, tickets: Ticket[], children: React.ReactNode, color: string, badgeColor: string }) {
    const { setNodeRef } = useDroppable({
        id: id,
    })

    return (
        <div ref={setNodeRef} className={`flex flex-col h-full rounded-lg p-4 border ${color}`}>
            <h3 className="font-semibold mb-4 flex items-center justify-between">
                {title}
                <Badge variant="secondary" className={badgeColor}>
                    {tickets.length}
                </Badge>
            </h3>
            <div className="space-y-3 overflow-y-auto flex-1 min-h-[200px]">
                {children}
            </div>
        </div>
    )
}

function TicketCard({ ticket, projectId, isClientPortal }: { ticket: Ticket, projectId: string, isClientPortal: boolean }) {
    const href = isClientPortal
        ? `/portal/tickets/${ticket.id}`
        : `/dashboard/projects/${projectId}/tickets/${ticket.id}`

    const statusColors = {
        [TicketStatus.OPEN]: "border-l-[6px] border-l-red-500 rounded-l-lg hover:bg-red-50/50 dark:hover:bg-red-950/10",
        [TicketStatus.IN_PROGRESS]: "border-l-[6px] border-l-yellow-500 rounded-l-lg hover:bg-yellow-50/50 dark:hover:bg-yellow-950/10",
        [TicketStatus.REVIEW]: "border-l-[6px] border-l-blue-500 rounded-l-lg hover:bg-blue-50/50 dark:hover:bg-blue-950/10",
        [TicketStatus.DONE]: "border-l-[6px] border-l-green-500 rounded-l-lg hover:bg-green-50/50 dark:hover:bg-green-950/10",
    }

    return (
        <Link href={href}>
            <Card className={`cursor-grab hover:shadow-md transition-all ${statusColors[ticket.status as TicketStatus]}`}>
                <CardHeader className="p-4 pb-1">
                    <CardTitle className="text-base font-bold leading-tight">{ticket.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground/80 mt-2 uppercase tracking-wide">
                        <span>Created at {format(new Date(ticket.createdAt), 'h:mm a, d MMM yyyy')}</span>
                        <div className="flex items-center gap-1.5 text-foreground">
                            {ticket._count?.comments ? (
                                <>
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                    <span>{ticket._count.comments} Updates</span>
                                </>
                            ) : (
                                <span className="text-muted-foreground font-medium normal-case">No updates</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

export function TicketBoard({ tickets: initialTickets, projectId, isClientPortal = false }: TicketBoardProps) {
    const [tickets, setTickets] = useState(initialTickets)
    const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
    const [filter, setFilter] = useState("ALL")

    const filteredTickets = useMemo(() => {
        if (filter === "ALL") return tickets

        const now = new Date()
        let startDate: Date

        if (filter === "WEEK") {
            startDate = startOfWeek(now)
        } else if (filter === "MONTH") {
            startDate = startOfMonth(now)
        } else {
            return tickets
        }

        return tickets.filter(t => isAfter(new Date(t.createdAt), startDate))
    }, [tickets, filter])

    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 10, // Enable click by requiring movement for drag
        },
    })
    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 250,
            tolerance: 5,
        },
    })
    const sensors = useSensors(mouseSensor, touchSensor)

    const handleDragStart = (event: DragStartEvent) => {
        const ticket = event.active.data.current?.ticket
        if (ticket) setActiveTicket(ticket)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveTicket(null)

        if (!over) return

        const ticketId = active.id as string
        const newStatus = over.id as TicketStatus
        const ticket = tickets.find(t => t.id === ticketId)

        if (ticket && ticket.status !== newStatus) {
            // Optimistic update
            setTickets(tickets.map(t =>
                t.id === ticketId ? { ...t, status: newStatus } : t
            ))

            // Server update
            await updateTicketStatus(ticketId, newStatus, projectId)
        }
    }

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex justify-end">
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Time</SelectItem>
                        <SelectItem value="WEEK">This Week</SelectItem>
                        <SelectItem value="MONTH">This Month</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    {COLUMNS.map((col) => (
                        <DroppableColumn
                            key={col.id}
                            id={col.id}
                            title={col.title}
                            tickets={filteredTickets.filter(t => t.status === col.id)}
                            color={col.color}
                            badgeColor={col.badge}
                        >
                            {filteredTickets
                                .filter((t) => t.status === col.id)
                                .map((ticket) => (
                                    <DraggableTicket key={ticket.id} ticket={ticket} projectId={projectId} isClientPortal={isClientPortal} />
                                ))}
                        </DroppableColumn>
                    ))}
                </div>
                <DragOverlay>
                    {activeTicket ? <TicketCard ticket={activeTicket} projectId={projectId} isClientPortal={isClientPortal} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
