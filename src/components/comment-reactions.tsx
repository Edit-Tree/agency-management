"use client"

import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Smile } from "lucide-react"
import EmojiPicker from "emoji-picker-react"
import { toggleReaction } from "@/app/actions/thread"
import { cn } from "@/lib/utils"

interface Reaction {
    id: string
    emoji: string
    userId: string
    user: { name: string | null }
}

interface CommentReactionsProps {
    commentId: string
    reactions: Reaction[]
    currentUserId: string
}

export function CommentReactions({ commentId, reactions, currentUserId }: CommentReactionsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Group reactions by emoji
    const reactionCounts = reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = { count: 0, hasReacted: false, users: [] }
        }
        acc[reaction.emoji].count++
        acc[reaction.emoji].users.push(reaction.user.name || 'Unknown')
        if (reaction.userId === currentUserId) {
            acc[reaction.emoji].hasReacted = true
        }
        return acc
    }, {} as Record<string, { count: number, hasReacted: boolean, users: string[] }>)

    const handleReaction = async (emoji: string) => {
        setIsOpen(false)
        await toggleReaction(commentId, emoji)
    }

    return (
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {Object.entries(reactionCounts).map(([emoji, data]) => (
                <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={cn(
                        "inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-full border transition-colors",
                        data.hasReacted
                            ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                    )}
                    title={data.users.join(', ')}
                >
                    <span>{emoji}</span>
                    <span className="font-medium">{data.count}</span>
                </button>
            ))}

            {isMounted && (
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100"
                            title="Add reaction"
                        >
                            <Smile className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 border-none bg-transparent shadow-none" side="right" align="start">
                        <EmojiPicker
                            onEmojiClick={(data) => handleReaction(data.emoji)}
                            width={300}
                            height={400}
                        />
                    </PopoverContent>
                </Popover>
            )}
        </div>
    )
}
