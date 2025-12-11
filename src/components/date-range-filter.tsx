"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function DateRangeFilter({
    className,
}: React.HTMLAttributes<HTMLDivElement>) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const [date, setDate] = React.useState<DateRange | undefined>(
        from && to
            ? { from: new Date(from), to: new Date(to) }
            : undefined
    )

    const onSelect = (range: DateRange | undefined) => {
        setDate(range)

        if (range?.from && range?.to) {
            const params = new URLSearchParams(searchParams.toString())
            params.set("from", range.from.toISOString())
            params.set("to", range.to.toISOString())
            router.push(`?${params.toString()}`)
        } else if (!range) {
            const params = new URLSearchParams(searchParams.toString())
            params.delete("from")
            params.delete("to")
            router.push(`?${params.toString()}`)
        }
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={onSelect}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
