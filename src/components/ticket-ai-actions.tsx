'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, ListTodo, FileText } from "lucide-react"
import { summarizeTicket, generateSubtasks } from "@/app/actions/ai"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

interface TicketAiActionsProps {
    ticketId: string
}

export function TicketAiActions({ ticketId }: TicketAiActionsProps) {
    const [loading, setLoading] = useState(false)
    const [summary, setSummary] = useState<string | null>(null)
    const [subtasks, setSubtasks] = useState<string[] | null>(null)

    const handleSummarize = async () => {
        setLoading(true)
        const result = await summarizeTicket(ticketId)
        if (result.success && result.summary) {
            setSummary(result.summary)
        } else {
            alert(result.error || "Failed to summarize")
        }
        setLoading(false)
    }

    const handleGenerateSubtasks = async () => {
        setLoading(true)
        const result = await generateSubtasks(ticketId)
        if (result.success && result.subtasks) {
            setSubtasks(result.subtasks)
        } else {
            alert(result.error || "Failed to generate subtasks")
        }
        setLoading(false)
    }

    return (
        <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-purple-500" /> AI Assistant
            </label>
            <div className="grid grid-cols-2 gap-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={handleSummarize} className="w-full">
                            <FileText className="mr-2 h-3 w-3" /> Summarize
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ticket Summary</DialogTitle>
                        </DialogHeader>
                        <div className="h-[300px] w-full rounded-md border p-4 overflow-y-auto">
                            {loading && !summary ? (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    Generating summary...
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap text-sm">
                                    {summary}
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={handleGenerateSubtasks} className="w-full">
                            <ListTodo className="mr-2 h-3 w-3" /> Subtasks
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Suggested Subtasks</DialogTitle>
                        </DialogHeader>
                        <div className="h-[300px] w-full rounded-md border p-4 overflow-y-auto">
                            {loading && !subtasks ? (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    Generating subtasks...
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    {subtasks?.map((task, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <input type="checkbox" className="mt-1" />
                                            <span>{task}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
