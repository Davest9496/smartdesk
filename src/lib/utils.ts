import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Exchange rates relative to GBP
 * In production, fetch from API and invert rates to get GBP-relative values
 */
const EXCHANGE_RATES_FROM_GBP: Record<string, number> = {
  GBP: 1,
  USD: 1.27, // 1 GBP = 1.27 USD
  EUR: 1.17, // 1 GBP = 1.17 EUR
  CAD: 1.72, // 1 GBP = 1.72 CAD
  AUD: 1.92, // 1 GBP = 1.92 AUD
}

/**
 * Formats currency for display
 * Prices stored in GBP pence, converted to display currency
 *
 * @param amountInPence - Amount in pence (GBP base)
 * @param options - Formatting options
 *
 * @example
 * formatCurrency(5000) // "£50.00" (UK, no conversion)
 * formatCurrency(5000, { currency: 'USD', locale: 'en-US' }) // "$63.50" (converted)
 */
export function formatCurrency(
  amountInPence: number,
  options: {
    currency?: string
    locale?: string
    convertFromGBP?: boolean
  } = {}
): string {
  const {
    currency = 'GBP',
    locale = 'en-GB',
    convertFromGBP = true, // Auto-convert by default
  } = options

  let displayAmount = amountInPence

  // Convert from GBP to target currency if needed
  if (convertFromGBP && currency !== 'GBP') {
    displayAmount = convertCurrency(amountInPence, 'GBP', currency)
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(displayAmount / 100)
}

/**
 * Convert currency from GBP to target currency
 * @param amountInPence - Amount in pence (GBP)
 * @param from - Source currency (should be GBP)
 * @param to - Target currency
 *
 * @example
 * convertCurrency(10000, 'GBP', 'USD') // ~12700 ($127.00)
 */
export function convertCurrency(
  amountInPence: number,
  from: string,
  to: string
): number {
  if (from === to) return amountInPence

  // We always store in GBP, so from should be GBP
  if (from !== 'GBP') {
    console.warn('Currency conversion expects GBP as base currency')
    return amountInPence
  }

  const rate = EXCHANGE_RATES_FROM_GBP[to] || 1
  return Math.round(amountInPence * rate)
}

/**
 * Get user's preferred currency based on company settings or location
 * @param companyCurrency - Currency from company settings (optional)
 * @returns Currency code
 */
export function getUserCurrency(companyCurrency?: string): string {
  // Priority: Company setting > Browser locale > Default GBP
  if (companyCurrency) {
    return companyCurrency
  }

  // Detect from browser locale
  if (typeof window !== 'undefined' && navigator.language) {
    const locale = navigator.language
    const currencyMap: Record<string, string> = {
      'en-GB': 'GBP',
      'en-US': 'USD',
      'en-CA': 'CAD',
      'en-AU': 'AUD',
      'de-DE': 'EUR',
      'fr-FR': 'EUR',
      'es-ES': 'EUR',
      'it-IT': 'EUR',
      'nl-NL': 'EUR',
    }
    return currencyMap[locale] || 'GBP'
  }

  return 'GBP' // Default to GBP (your base currency)
}

/**
 * Get user's locale for formatting
 * @param companyLocale - Locale from company settings (optional)
 */
export function getUserLocale(companyLocale?: string): string {
  if (companyLocale) {
    return companyLocale
  }

  if (typeof window !== 'undefined' && navigator.language) {
    return navigator.language
  }

  return 'en-GB' // Default to UK locale
}

/**
 * Formats date for display based on locale
 * @param date - Date to format
 * @param locale - Locale code (default: en-GB)
 */
export function formatDate(date: Date | string, locale?: string): string {
  const userLocale = locale || getUserLocale()

  return new Intl.DateTimeFormat(userLocale, {
    dateStyle: 'medium',
  }).format(new Date(date))
}

/**
 * Formats time for display based on locale
 * @param date - Date to format
 * @param locale - Locale code (default: en-GB)
 */
export function formatTime(date: Date | string, locale?: string): string {
  const userLocale = locale || getUserLocale()

  return new Intl.DateTimeFormat(userLocale, {
    timeStyle: 'short',
    hour12: false, // UK uses 24-hour by default
  }).format(new Date(date))
}

/**
 * Formats date and time together
 */
export function formatDateTime(date: Date | string, locale?: string): string {
  const userLocale = locale || getUserLocale()

  return new Intl.DateTimeFormat(userLocale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
    CAD: 'CA$',
    AUD: 'A$',
  }
  return symbols[currency] || currency
}
