"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minYear?: number
  maxYear?: number
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  minYear = 500,
  maxYear
}: DatePickerProps) {
  const today = React.useMemo(() => new Date(), [])
  const resolvedMaxYear = maxYear ?? today.getFullYear() + 5
  const current = date ?? today

  // Minimal design: rely on month/year dropdowns in Calendar caption

  return (
    <div className="relative w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal pr-3 border-[#E5E5E5] bg-white hover:bg-muted transition-colors h-10 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-[#E5E5E5]",
              !date && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[360px] p-0 bg-white border border-[#E5E5E5] shadow-sm rounded-lg" align="start" side="bottom">
          <div className="p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => { if (onDateChange) onDateChange(d) }}
              initialFocus
              captionLayout="dropdown"
              fromYear={minYear}
              toYear={resolvedMaxYear}
              className="w-full [--cell-size:2.25rem]"
              classNames={{ root: "w-full" }}
            />
            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-foreground/70 hover:bg-muted" onClick={() => { if (onDateChange) onDateChange(today) }}>Today</Button>
              {date && (
                <Button variant="ghost" size="sm" className="h-8 px-2 text-foreground/70 hover:bg-muted" onClick={() => onDateChange && onDateChange(undefined)}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {/* Clear button moved inside popover footer for minimal layout */}
    </div>
  )
}
