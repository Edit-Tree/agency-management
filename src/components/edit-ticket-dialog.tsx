'use client'

import { useState, useRef, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor, RichTextEditorRef } from "@/components/rich-text-editor"
import { updateTicket } from "@/app/actions/tickets"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface EditTicketDialogProps {
    ticket: {
        id: string
        title: string
        description: string | null
    }
}

export function EditTicketDialog({ ticket }: EditTicketDialogProps) {
    const [mounted, setMounted] = useState(false)
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState(ticket.title)
    const [description, setDescription] = useState(ticket.description || "")
    const [saving, setSaving] = useState(false)
    const router = useRouter()
    const editorRef = useRef<RichTextEditorRef>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error("Title cannot be empty")
            return
        }

        setSaving(true)
        const result = await updateTicket(ticket.id, { title, description })
        setSaving(false)

        if (result.success) {
            toast.success("Ticket updated")
            setOpen(false)
            router.refresh()
        } else {
            toast.error(result.error || "Failed to update ticket")
        }
    }

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="h-6 w-6">
                <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                <span className="sr-only">Edit Ticket</span>
            </Button>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    <span className="sr-only">Edit Ticket</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit Ticket</DialogTitle>
                    <DialogDescription>
                        Make changes to the ticket details here.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ticket Title"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <RichTextEditor
                            ref={editorRef}
                            content={description}
                            onChange={setDescription}
                            placeholder="Description..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
