'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
  id?: string
}

export function DatePicker({ date, setDate, className, id }: DatePickerProps) {
  // Handle format safely to prevent hydration errors
  const displayDate = React.useMemo(() => {
    try {
      return date ? format(date, 'PPP') : 'Pick a date';
    } catch (error) {
      console.error("Date formatting error:", error);
      return 'Pick a date';
    }
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayDate === 'Pick a date' ? <span>Pick a date</span> : displayDate}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          disabled={(date) => date < new Date('1900-01-01')}
        />
      </PopoverContent>
    </Popover>
  )
}
