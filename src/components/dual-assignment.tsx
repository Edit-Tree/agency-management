'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateTicketAssignments } from "@/app/actions/assign-ticket"

interface User {
    id: string
    name: string | null
    email: string
}

interface DualAssignmentProps {
    ticketId: string
    currentAssigneeId: string | null
    currentManagerId: string | null
    teamMembers: User[]
}

export function DualAssignment({ ticketId, currentAssigneeId, currentManagerId, teamMembers }: DualAssignmentProps) {
    const [assigneeId, setAssigneeId] = useState<string>(currentAssigneeId || 'unassigned')
    const [managerId, setManagerId] = useState<string>(currentManagerId || 'unassigned')
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        setLoading(true)
        await updateTicketAssignments(
            ticketId,
            assigneeId === 'unassigned' ? null : assigneeId,
            managerId === 'unassigned' ? null : managerId
        )
        setLoading(false)
        window.location.reload()
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="assignee">Assignee (Doer)</Label>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger id="assignee">
                        <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                                {member.name || member.email}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Primary person responsible for completing the work</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="manager">Quality Manager</Label>
                <Select value={managerId} onValueChange={setManagerId}>
                    <SelectTrigger id="manager">
                        <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unassigned">No Manager</SelectItem>
                        {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                                {member.name || member.email}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Person responsible for ensuring quality and timelines</p>
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Update Assignments'}
            </Button>
        </div>
    )
}
