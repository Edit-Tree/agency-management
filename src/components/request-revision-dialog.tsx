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
import { Textarea } from "@/components/ui/textarea"
import { requestRevision } from "@/app/actions/delivery"
import { toast } from "sonner"
import { RotateCcw } from "lucide-react"

interface RequestRevisionDialogProps {
    ticketId: string
}

export function RequestRevisionDialog({ ticketId }: RequestRevisionDialogProps) {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!message.trim()) {
            toast.error("Please explain what needs revision")
            return
        }

        setLoading(true)
        const result = await requestRevision(ticketId, message)
        setLoading(false)

        if (result.success) {
            toast.success("Revision requested")
            setOpen(false)
        } else {
            toast.error(result.error || "Failed to request revision")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800">
                    <RotateCcw className="w-4 h-4" />
                    Request Revision
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Request Revision</DialogTitle>
                    <DialogDescription>
                        Please detail the changes you'd like to see. This will reopen the ticket.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="E.g., Please adjust the colors to match..."
                        className="min-h-[120px]"
                    />

                    <div className="bg-orange-50 p-3 rounded-md text-xs text-orange-800 border border-orange-100">
                        <strong>Note:</strong> Asking for a revision will move this ticket back to <strong>IN REVISION</strong> status.
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                        {loading ? "Submitting..." : "Submit Request"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
