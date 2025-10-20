import { parse, format, isValid } from 'date-fns'

/**
 * Parse "HH:mm" time string and combine with a date
 *
 * Why this approach:
 * - Working hours are stored as "HH:mm" strings (e.g., "09:00")
 * - We need to convert them to actual Date objects for the selected day
 * - date-fns parse() is timezone-aware and handles edge cases
 *
 * @param timeString - Time in "HH:mm" format
 * @param referenceDate - The date to apply this time to
 * @returns Date object with the parsed time
 */
export function parseTimeString(timeString: string, referenceDate: Date): Date {
  const parsed = parse(timeString, 'HH:mm', referenceDate)

  if (!isValid(parsed)) {
    throw new Error(`Invalid time string: ${timeString}`)
  }

  return parsed
}

/**
 * Format Date object to "HH:mm" string
 */
export function formatTimeString(date: Date): string {
  return format(date, 'HH:mm')
}

/**
 * Validate that a time string is in "HH:mm" format
 */
export function isValidTimeFormat(timeString: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
  return timeRegex.test(timeString)
}

/**
 * Convert minutes to human-readable duration
 * Examples: 30 -> "30 mins", 90 -> "1h 30m", 120 -> "2h"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} mins`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}m`
}

/**
 * Get day of week name from number (0 = Sunday, 6 = Saturday)
 */
export function getDayName(dayOfWeek: number): string {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  return days[dayOfWeek] || 'Invalid day'
}
