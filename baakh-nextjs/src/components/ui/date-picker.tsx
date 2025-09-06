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

  const jumpYears = (delta: number) => {
    const d = new Date(current)
    d.setFullYear(d.getFullYear() + delta)
    if (onDateChange) onDateChange(d)
  }

  const jumpToCentury = (century: number) => {
    // e.g., 17 -> 1601-1700, pick middle year for safety
    const startYear = (century - 1) * 100 + 1
    const midYear = startYear + 50
    const d = new Date(current)
    d.setFullYear(midYear, 0, 1)
    if (onDateChange) onDateChange(d)
  }

  const handleYearInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const y = parseInt(e.target.value, 10)
    if (!isNaN(y)) {
      const clamped = Math.max(minYear, Math.min(resolvedMaxYear, y))
      const d = new Date(current)
      d.setFullYear(clamped)
      if (onDateChange) onDateChange(d)
    }
  }

  return (
    <div className="relative w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal pr-8 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F4F4F5] transition-colors h-10 min-w-[200px]",
              !date && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border-[#E5E5E5] shadow-lg" align="start" side="bottom">
          <div className="p-3 border-b border-[#E5E5E5] bg-white flex items-center gap-2">
            <select
              className="h-8 px-2 rounded border border-input text-sm"
              onChange={(e) => jumpToCentury(parseInt(e.target.value, 10))}
              value={Math.floor((current.getFullYear() - 1) / 100) + 1}
            >
              {Array.from({ length: Math.floor((resolvedMaxYear - minYear) / 100) + 1 }).map((_, i) => {
                const c = Math.floor(minYear / 100) + i + 1
                const start = (c - 1) * 100 + 1
                const end = c * 100
                return (
                  <option key={c} value={c}>{c}th ({start}-{end})</option>
                )
              })}
            </select>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => jumpYears(-100)}>−100y</Button>
              <Button variant="outline" size="sm" onClick={() => jumpYears(-10)}>−10y</Button>
              <Button variant="outline" size="sm" onClick={() => { if (onDateChange) onDateChange(today) }}>Today</Button>
              <Button variant="outline" size="sm" onClick={() => jumpYears(10)}>+10y</Button>
              <Button variant="outline" size="sm" onClick={() => jumpYears(100)}>+100y</Button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <input
                type="number"
                className="h-8 w-24 px-2 rounded border border-input text-sm"
                defaultValue={current.getFullYear()}
                onBlur={handleYearInput}
              />
            </div>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => { if (onDateChange) onDateChange(d) }}
            initialFocus
            captionLayout="dropdown"
            fromYear={minYear}
            toYear={resolvedMaxYear}
          />
        </PopoverContent>
      </Popover>
      {date && onDateChange && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDateChange && onDateChange(undefined)}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-[#F1F1F1]"
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  )
}
