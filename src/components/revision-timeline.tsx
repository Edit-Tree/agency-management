'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { FileCheck, AlertCircle, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface RevisionEvent {
    id: string
    type: string
    userId: string
    user: {
        name: string | null
        email: string
    }
    message: string | null
    images: string[]
    createdAt: Date
}

interface RevisionTimelineProps {
    events: RevisionEvent[]
}

export function RevisionTimeline({ events }: RevisionTimelineProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'SUBMITTED':
                return <FileCheck className="h-4 w-4 text-blue-600" />
            case 'REVISION_REQUESTED':
                return <AlertCircle className="h-4 w-4 text-orange-600" />
            case 'APPROVED':
                return <CheckCircle className="h-4 w-4 text-green-600" />
            default:
                return <FileCheck className="h-4 w-4" />
        }
    }

    const getLabel = (type: string) => {
        switch (type) {
            case 'SUBMITTED':
                return 'Submitted for Review'
            case 'REVISION_REQUESTED':
                return 'Revision Requested'
            case 'APPROVED':
                return 'Approved'
            default:
                return type
        }
    }

    const getColor = (type: string) => {
        switch (type) {
            case 'SUBMITTED':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'REVISION_REQUESTED':
                return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'APPROVED':
                return 'bg-green-100 text-green-800 border-green-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const submissionCount = events.filter(e => e.type === 'SUBMITTED').length
    const revisionCount = events.filter(e => e.type === 'REVISION_REQUESTED').length

    if (events.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Revision History</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No revisions yet
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Revision History</CardTitle>
                <div className="flex gap-2 text-xs text-muted-foreground mt-2">
                    <Badge variant="outline" className="bg-blue-50">
                        {submissionCount} submission{submissionCount !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline" className="bg-orange-50">
                        {revisionCount} revision{revisionCount !== 1 ? 's' : ''}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {events.map((event, index) => (
                        <div key={event.id} className="relative">
                            {/* Timeline line */}
                            {index < events.length - 1 && (
                                <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
                            )}

                            <div className="flex gap-3">
                                <div className="flex-shrink-0 mt-1">
                                    <div className={`p-2 rounded-full border ${getColor(event.type)}`}>
                                        {getIcon(event.type)}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">{getLabel(event.type)}</p>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                            <AvatarFallback className="text-xs">
                                                {event.user.name?.substring(0, 2).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-muted-foreground">
                                            {event.user.name || event.user.email}
                                        </span>
                                    </div>

                                    {event.message && (
                                        <p className="text-sm bg-muted p-2 rounded mt-2">
                                            {event.message}
                                        </p>
                                    )}

                                    {event.images && event.images.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {event.images.map((img, imgIndex) => (
                                                <img
                                                    key={imgIndex}
                                                    src={img}
                                                    alt={`Revision ${imgIndex + 1}`}
                                                    className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => window.open(img, '_blank')}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
