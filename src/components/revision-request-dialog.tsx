'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { X, Upload } from "lucide-react"
import { requestRevision } from "@/app/actions/revisions"

interface RevisionRequestDialogProps {
    ticketId: string
    userId: string
}

export function RevisionRequestDialog({ ticketId, userId }: RevisionRequestDialogProps) {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [images, setImages] = useState<string[]>([])
    const [uploading, setUploading] = useState(false)

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        setUploading(true)
        const uploadedUrls: string[] = []

        for (const file of Array.from(files)) {
            // Create a data URL for the image (in production, upload to cloud storage)
            const reader = new FileReader()
            reader.onloadend = () => {
                uploadedUrls.push(reader.result as string)
                if (uploadedUrls.length === files.length) {
                    setImages([...images, ...uploadedUrls])
                    setUploading(false)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
    }

    const handleSubmit = async () => {
        if (!message.trim()) {
            alert('Please provide revision feedback')
            return
        }

        await requestRevision(ticketId, userId, message, images)
        setOpen(false)
        setMessage('')
        setImages([])
        window.location.reload()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">Request Revision</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Request Revision</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="message">Revision Feedback *</Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe what needs to be changed..."
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="images">Attach Images (Optional)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="images"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('images')?.click()}
                                disabled={uploading}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {uploading ? 'Uploading...' : 'Upload Images'}
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                {images.length} image{images.length !== 1 ? 's' : ''} attached
                            </span>
                        </div>
                    </div>

                    {images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                            {images.map((img, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={img}
                                        alt={`Attachment ${index + 1}`}
                                        className="w-full h-24 object-cover rounded border"
                                    />
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={!message.trim()}>
                            Send Revision Request
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
