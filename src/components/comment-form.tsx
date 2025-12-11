'use client'

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Image, X, Send } from "lucide-react"
import { addComment } from "@/app/actions/thread"
import { RichTextEditor } from "@/components/rich-text-editor"

interface CommentFormProps {
    ticketId: string
    members?: Array<{ id: string, name: string | null, image?: string | null }>
    parentId?: string
    placeholder?: string
}

export function CommentForm({ ticketId, members = [], parentId, placeholder }: CommentFormProps) {
    const [content, setContent] = useState("")
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()

        if (!content.trim() || content === '<p></p>') return

        setLoading(true)

        try {
            await addComment(ticketId, content, imagePreview || undefined, parentId)
            setContent("")
            removeImage()
            window.location.reload()
        } catch (error) {
            console.error('Error adding comment:', error)
            alert('Failed to add comment')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            {imagePreview && (
                <div className="relative inline-block mb-2">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-xs max-h-40 rounded-lg border"
                    />
                    <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative">
                <RichTextEditor
                    members={members}
                    content={content}
                    onChange={setContent}
                    placeholder={placeholder || "Message..."}
                    onAttach={() => fileInputRef.current?.click()}
                    footer={
                        <>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                                id="image-upload"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Image className="h-5 w-5" />
                            </Button>
                            <div className="flex-1" />
                            <Button
                                type="button"
                                onClick={(e) => handleSubmit(e)}
                                size="sm"
                                disabled={loading || (!content.trim() && !imageFile)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loading ? 'Sending...' : 'Send'}
                                <Send className="ml-2 h-3 w-3" />
                            </Button>
                        </>
                    }
                />
            </form>
        </div>
    )
}
