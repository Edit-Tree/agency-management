'use client'

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor, RichTextEditorRef } from "@/components/rich-text-editor"
import { createTicket } from "@/app/actions/tickets"
import { generateTicketDescription } from "@/app/actions/ai"
import { Sparkles } from "lucide-react"

export function TicketForm({ projectId }: { projectId: string }) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [generating, setGenerating] = useState(false)
    const editorRef = useRef<RichTextEditorRef>(null)

    const handleGenerate = async () => {
        if (!title) {
            alert("Please enter a title first")
            return
        }

        let promptContext = ""
        if (editorRef.current) {
            promptContext = editorRef.current.getSelection()
        }

        setGenerating(true)
        const result = await generateTicketDescription(title, promptContext)
        if (result.success && result.description) {
            setDescription(result.description)
        } else {
            alert("Failed to generate description")
        }
        setGenerating(false)
    }

    return (
        <form action={async (formData) => {
            await createTicket(formData)
        }} className="space-y-6">
            <input type="hidden" name="projectId" value={projectId} />

            <div className="space-y-2">
                <Label htmlFor="title">Ticket Title</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Fix navigation bug"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="description">Description</Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerate}
                        disabled={generating || !title}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {generating ? 'Generating...' : 'Generate with AI'}
                    </Button>
                </div>
                <RichTextEditor
                    ref={editorRef}
                    content={description}
                    onChange={setDescription}
                    placeholder="Describe the task..."
                />
                <input type="hidden" name="description" value={description} />
            </div>

            <div className="flex justify-end gap-4">
                <Button type="submit">Create Ticket</Button>
            </div>
        </form>
    )
}
