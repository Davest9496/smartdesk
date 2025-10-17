/**
 * Fetch exchange rates with GBP as base
 * Using exchangerate-api.com (free tier: 1,500 requests/month)
 */

const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/GBP'

interface ExchangeRateResponse {
  base: string
  rates: Record<string, number>
}

let cachedRates: Record<string, number> | null = null
let lastFetch: number = 0
const CACHE_DURATION = 3600000 // 1 hour

export async function getExchangeRates(): Promise<Record<string, number>> {
  const now = Date.now()

  if (cachedRates && now - lastFetch < CACHE_DURATION) {
    return cachedRates
  }

  try {
    const response = await fetch(EXCHANGE_RATE_API)
    const data: ExchangeRateResponse = await response.json()

    cachedRates = data.rates
    lastFetch = now

    return data.rates
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)

    // Fallback rates
    return {
      GBP: 1,
      USD: 1.27,
      EUR: 1.17,
      CAD: 1.72,
      AUD: 1.92,
    }
  }
}
