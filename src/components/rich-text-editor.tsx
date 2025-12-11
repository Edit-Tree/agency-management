"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Mention from '@tiptap/extension-mention'
import { Markdown } from 'tiptap-markdown'
import suggestion from './suggestion'
import { Button } from "@/components/ui/button"
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Link as LinkIcon,
    List,
    ListOrdered,
    Code,
    FileCode,
    Quote, // Using Quote as placeholder for code block or similar
    Smile,
    AtSign,
    Video,
    Mic,
    Plus,
    Type
} from "lucide-react"
import { useCallback, forwardRef, useImperativeHandle, useEffect } from 'react'
import EmojiPicker from 'emoji-picker-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export interface RichTextEditorRef {
    getSelection: () => string
}

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
    footer?: React.ReactNode
    onAttach?: () => void
    members?: Array<{ id: string, name: string | null, image?: string | null }>
    readonly?: boolean
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({ content, onChange, placeholder, footer, onAttach, members = [], readonly = false }, ref) => {
    const editor = useEditor({
        editable: !readonly,
        extensions: [
            StarterKit,
            Mention.configure({
                HTMLAttributes: {
                    class: 'rounded bg-blue-100 text-blue-600 px-1 py-0.5 font-medium dark:bg-blue-900/30 dark:text-blue-300 mx-0.5',
                },
                suggestion: {
                    items: ({ query }) => {
                        return members
                            .filter(item => (item.name || '').toLowerCase().includes(query.toLowerCase()))
                            .slice(0, 5)
                    },
                    render: suggestion.render
                },
            }),
            Markdown.configure({
                html: true,
                transformPastedText: true,
                transformCopiedText: true,
            }),
            Underline,
            Link.configure({
                openOnClick: false,
            }),
            Image,
            Placeholder.configure({
                placeholder: placeholder || 'Type a message...',
            })
        ],
        content: content,
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[80px] max-h-[300px] overflow-y-auto px-3 py-2',
                    '[&_ul]:list-disc [&_ul]:pl-4',
                    '[&_ol]:list-decimal [&_ol]:pl-4',
                    '[&_pre]:!bg-zinc-900 [&_pre]:!text-zinc-100 [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:my-2 [&_pre]:overflow-x-auto',
                    '[&_code]:bg-muted [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm',
                    '[&_pre_*]:!bg-transparent [&_pre_*]:!p-0 [&_pre_*]:!text-inherit',
                    '[&_pre_span]:!bg-transparent [&_pre_span]:!p-0 [&_pre_span]:!text-inherit',
                    '[&_pre_div]:!bg-transparent [&_pre_div]:!p-0 [&_pre_div]:!text-inherit',
                    '[&_pre_code]:!bg-transparent [&_pre_code]:!p-0 [&_pre_code]:!text-inherit [&_pre_code]:!rounded-none',
                    '[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:my-2 [&_blockquote]:italic [&_blockquote]:bg-muted/30',
                    '[&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-4 cursor-text'
                ),
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        immediatelyRender: false,
    })

    useImperativeHandle(ref, () => ({
        getSelection: () => {
            if (!editor) return ""
            const { from, to } = editor.state.selection
            if (from === to) return ""
            return editor.state.doc.textBetween(from, to, '\n')
        }
    }), [editor])

    useEffect(() => {
        if (editor && content && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    const setLink = useCallback(() => {
        if (!editor) return
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        // cancelled
        if (url === null) return

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        // update
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }, [editor])

    const addEmoji = (emojiData: any) => {
        editor?.chain().focus().insertContent(emojiData.emoji).run()
    }

    if (!editor) {
        return null
    }

    return (
        <div className={cn("border rounded-md overflow-hidden bg-white dark:bg-gray-950 text-card-foreground shadow-sm", readonly && "border-transparent shadow-none bg-transparent")}>
            {/* Top Toolbar */}
            {!readonly && (
                <div className="flex items-center gap-1 p-1 border-b bg-muted/40 overflow-x-auto">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn("h-7 w-7", editor.isActive('bold') && "bg-accent text-accent-foreground")}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn("h-7 w-7", editor.isActive('italic') && "bg-accent text-accent-foreground")}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn("h-7 w-7", editor.isActive('underline') && "bg-accent text-accent-foreground")}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn("h-7 w-7", editor.isActive('strike') && "bg-accent text-accent-foreground")}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                    >
                        <Strikethrough className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn("h-7 w-7", editor.isActive('link') && "bg-accent text-accent-foreground")}
                        onClick={setLink}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn("h-7 w-7", editor.isActive('bulletList') && "bg-accent text-accent-foreground")}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn("h-7 w-7", editor.isActive('orderedList') && "bg-accent text-accent-foreground")}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn("h-7 w-7", editor.isActive('code') && "bg-accent text-accent-foreground")}
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        title="Inline Code"
                    >
                        <Code className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn("h-7 w-7", editor.isActive('codeBlock') && "bg-accent text-accent-foreground")}
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        title="Code Block"
                    >
                        <FileCode className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn("h-7 w-7", editor.isActive('blockquote') && "bg-accent text-accent-foreground")}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    >
                        <Quote className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Editor Area */}
            <div className={cn("min-h-[80px]", readonly && "min-h-0")}>
                <EditorContent editor={editor} />
            </div>

            {/* Bottom Toolbar */}
            {!readonly && (
                <div className="flex items-center justify-between p-2 border-t bg-muted/10">
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-muted/50 hover:bg-muted"
                            onClick={onAttach}
                            title="Add attachment"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-4 bg-border mx-1" />

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Add emoji">
                                    <Smile className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0 border-none bg-transparent shadow-none" side="top" align="start">
                                <EmojiPicker onEmojiClick={addEmoji} />
                            </PopoverContent>
                        </Popover>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => editor.chain().focus().insertContent('@').run()}
                            title="Mention someone"
                        >
                            <AtSign className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => toast.info("Video messages coming soon!")}
                            title="Record video clip"
                        >
                            <Video className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => toast.info("Voice messages coming soon!")}
                            title="Record voice clip"
                        >
                            <Mic className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Custom Actions (Send, Image, etc) */}
                    <div className="flex items-center gap-2">
                        {footer}
                    </div>
                </div>
            )}
        </div>
    )
})

RichTextEditor.displayName = "RichTextEditor"
