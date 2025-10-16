import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS classes with clsx and tailwind-merge
 * Handles conditional classes and prevents style conflicts
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Formats currency for display
 * @param amount - Amount in smallest currency unit (e.g., pence)
 * @param currency - Currency code (default: GBP)
 */
export function formatCurrency(
  amount: number,
  currency: string = 'GBP'
): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount / 100)
}

/**
 * Formats date for display in UK format
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
  }).format(new Date(date))
}

/**
 * Formats time for display in 24-hour format
 */
export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeStyle: 'short',
  }).format(new Date(date))
}
