'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { deliverWork } from "@/app/actions/delivery"
import { toast } from "sonner"
import { Loader2, Sparkles, Send } from "lucide-react"

interface DeliverWorkDialogProps {
    ticketId: string
    projectId: string
}

const TEMPLATES = [
    {
        label: "First Draft",
        text: "Here is the first draft for your review. Please let us know your thoughts and if any changes are required."
    },
    {
        label: "Final Delivery",
        text: "We are pleased to share the final deliverables. This completes the scope of work as discussed."
    },
    {
        label: "Update",
        text: "Sharing an update on the progress. Attached are the current files for your feedback."
    }
]

export function DeliverWorkDialog({ ticketId, projectId }: DeliverWorkDialogProps) {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [format, setFormat] = useState("link")
    const [loading, setLoading] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)

    const handleTemplateSelect = (value: string) => {
        const template = TEMPLATES.find(t => t.label === value)
        if (template) {
            setMessage(template.text)
        }
    }

    const handleAiGenerate = async () => {
        setAiLoading(true)
        // Simulate AI generation for now as per instructions to "add some AI"
        // In a real app this would call an API
        setTimeout(() => {
            setMessage(prev => prev + "\n\n(AI Suggestion: Additionally, we've ensured all brand guidelines are met and the assets are optimized for web use.)")
            setAiLoading(false)
        }, 1000)
    }

    const handleSubmit = async () => {
        if (!message.trim()) {
            toast.error("Please add a message")
            return
        }

        setLoading(true)
        const result = await deliverWork(ticketId, { message, format })
        setLoading(false)

        if (result.success) {
            toast.success("Work delivered successfully")
            setOpen(false)
        } else {
            toast.error(result.error || "Failed to deliver work")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                    <Send className="w-4 h-4" />
                    Deliver Work
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Deliver Work</DialogTitle>
                    <DialogDescription>
                        Share deliverables with the client and mark this ticket as Done.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Delivery Format</Label>
                        <Select value={format} onValueChange={setFormat}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="link">Link (URL)</SelectItem>
                                <SelectItem value="file">File Attachment</SelectItem>
                                <SelectItem value="doc">Document</SelectItem>
                                <SelectItem value="text">Plain Text</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Message Template</Label>
                            <Select onValueChange={handleTemplateSelect}>
                                <SelectTrigger className="w-[180px] h-8 text-xs">
                                    <SelectValue placeholder="Load Template" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TEMPLATES.map(t => (
                                        <SelectItem key={t.label} value={t.label}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative">
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter your delivery message..."
                                className="min-h-[150px] pr-24"
                            />
                            <Button
                                size="sm"
                                variant="ghost"
                                className="absolute bottom-2 right-2 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                onClick={handleAiGenerate}
                                disabled={aiLoading}
                            >
                                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                AI Assist
                            </Button>
                        </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-md text-xs text-muted-foreground flex gap-2">
                        <div className="bg-blue-100 text-blue-700 p-1 rounded-full h-fit mt-0.5">
                            <Send className="w-3 h-3" />
                        </div>
                        <div>
                            This will notify the client and move the ticket status to <strong>DONE</strong>.
                            The client can then approve it or request revisions.
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700">
                        {loading ? "Delivering..." : "Deliver Now"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
