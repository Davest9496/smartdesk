'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from '@/components/ui/icons'

interface WorkingHour {
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface WorkingHoursEditorProps {
  providerId: string
  initialHours: WorkingHour[]
}

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

export function WorkingHoursEditor({
  providerId,
  initialHours,
}: WorkingHoursEditorProps) {
  const router = useRouter()
  const [hours, setHours] = useState<WorkingHour[]>(initialHours)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addHours = () => {
    setHours([...hours, { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }])
  }

  const removeHours = (index: number) => {
    setHours(hours.filter((_, i) => i !== index))
  }

  const updateHours = (
    index: number,
    field: keyof WorkingHour,
    value: string | number
  ) => {
    const updated = [...hours]
    updated[index] = { ...updated[index], [field]: value }
    setHours(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/providers/${providerId}/working-hours`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workingHours: hours }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update working hours')
      }

      router.refresh() // Refresh the page data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Working Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {hours.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No working hours set. Click &quot;Add Hours&quot; to get started.
            </p>
          )}

          {hours.map((hour, index) => (
            <div
              key={index}
              className="flex gap-3 items-end p-4 border rounded-lg bg-gray-50"
            >
              <div className="flex-1">
                <Label htmlFor={`day-${index}`}>Day</Label>
                <select
                  id={`day-${index}`}
                  value={hour.dayOfWeek}
                  onChange={(e) =>
                    updateHours(index, 'dayOfWeek', Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {DAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <Label htmlFor={`start-${index}`}>Start Time</Label>
                <Input
                  id={`start-${index}`}
                  type="time"
                  value={hour.startTime}
                  onChange={(e) =>
                    updateHours(index, 'startTime', e.target.value)
                  }
                />
              </div>

              <div className="flex-1">
                <Label htmlFor={`end-${index}`}>End Time</Label>
                <Input
                  id={`end-${index}`}
                  type="time"
                  value={hour.endTime}
                  onChange={(e) =>
                    updateHours(index, 'endTime', e.target.value)
                  }
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeHours(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={addHours}>
              <Plus className="h-4 w-4 mr-2" />
              Add Hours
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Working Hours'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
