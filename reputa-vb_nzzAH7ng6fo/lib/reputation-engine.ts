export interface MockData {
  volume: number
  age: number
  network: number
}

/**
 * Calculate Trust Score using the Reputation Engine formula:
 * Score = (Volume × 0.4) + (Age × 0.3) + (Network × 0.3)
 *
 * Filters out transactions < 0.1 Pi
 * Returns a score between 0-100
 */
export function calculateTrustScore(data: MockData): number {
  // Filter volume: ignore < 0.1 Pi
  const filteredVolume = data.volume >= 0.1 ? data.volume : 0

  // Normalize values to 0-100 scale
  const normalizedVolume = Math.min((filteredVolume / 1000) * 100, 100)
  const normalizedAge = Math.min((data.age / 730) * 100, 100) // 730 days = 2 years max
  const normalizedNetwork = Math.min((data.network / 100) * 100, 100)

  // Apply formula weights
  const score = normalizedVolume * 0.4 + normalizedAge * 0.3 + normalizedNetwork * 0.3

  return Math.round(Math.min(Math.max(score, 0), 100))
}
