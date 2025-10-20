'use client'

import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import type { TimeSlot } from '@/types/availability'

interface TimeSlotPickerProps {
  slots: TimeSlot[]
  selectedSlot: Date | null
  onSlotSelect: (startTime: Date) => void
}

/**
 * Time slot picker component
 *
 * Why grid layout:
 * - Easier to scan multiple options
 * - Shows all slots at once
 * - Mobile-friendly with responsive columns
 *
 * Why this interaction:
 * - Click to select (not hover)
 * - Clear visual feedback for selected slot
 * - Disabled state for unavailable slots
 */
export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSlotSelect,
}: TimeSlotPickerProps) {
  if (slots.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No available slots for this date.</p>
        <p className="text-sm mt-2">Please try another date.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        {slots.length} slot{slots.length !== 1 ? 's' : ''} available
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {slots.map((slot) => {
          const isSelected =
            selectedSlot && slot.startTime.getTime() === selectedSlot.getTime()

          return (
            <Button
              key={slot.startTime.toISOString()}
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => onSlotSelect(slot.startTime)}
              className="w-full"
            >
              {format(slot.startTime, 'HH:mm')}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
