'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { updateTicketAssignment } from "@/app/actions/thread"
import { useState } from "react"

interface AssigneeSelectProps {
    ticketId: string
    currentAssigneeId: string | null
    teamMembers: { id: string; name: string | null }[]
}

export function AssigneeSelect({ ticketId, currentAssigneeId, teamMembers }: AssigneeSelectProps) {
    const [assigneeId, setAssigneeId] = useState(currentAssigneeId || "unassigned")
    const [loading, setLoading] = useState(false)

    const handleUpdate = async () => {
        setLoading(true)
        await updateTicketAssignment(ticketId, assigneeId === "unassigned" ? null : assigneeId)
        setLoading(false)
        window.location.reload()
    }

    return (
        <div className="space-y-2">
            <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {teamMembers.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={handleUpdate}
                disabled={loading}
            >
                {loading ? 'Updating...' : 'Update Assignee'}
            </Button>
        </div>
    )
}
