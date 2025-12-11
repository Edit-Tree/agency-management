'use client'

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface DeadlinePickerProps {
    value?: Date
    onChange: (date: Date | undefined) => void
}

export function DeadlinePicker({ value, onChange }: DeadlinePickerProps) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!value && "text-muted-foreground"}`}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, "PPP") : "Set deadline (optional)"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={(date) => {
                        onChange(date)
                        setOpen(false)
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
