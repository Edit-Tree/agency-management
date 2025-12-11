
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface MentionListProps {
    items: any[]
    command: (item: any) => void
}

export const MentionList = forwardRef((props: MentionListProps, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
        const item = props.items[index]
        if (item) {
            props.command({ id: item.id, label: item.name })
        }
    }

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length)
    }

    const enterHandler = () => {
        selectItem(selectedIndex)
    }

    useEffect(() => setSelectedIndex(0), [props.items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                upHandler()
                return true
            }

            if (event.key === 'ArrowDown') {
                downHandler()
                return true
            }

            if (event.key === 'Enter') {
                enterHandler()
                return true
            }

            return false
        },
    }))

    return (
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-1 min-w-[200px]">
            {props.items.length ? (
                props.items.map((item, index) => (
                    <button
                        key={index}
                        className={`flex items-center w-full gap-2 px-2 py-1.5 text-sm md:text-sm text-left rounded-sm ${index === selectedIndex
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            }`}
                        onClick={() => selectItem(index)}
                    >
                        <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">
                                {item.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{item.name}</span>
                    </button>
                ))
            ) : (
                <div className="px-2 py-1.5 text-sm text-gray-500 text-center">
                    No result
                </div>
            )}
        </div>
    )
})

MentionList.displayName = 'MentionList'
