/**
 * Calculate Stripe transaction fees based on payment amount
 * Fees are based on actual Stripe charges for Australian transactions
 * 
 * Note: If Stripe prices already include fees, use this for display purposes only.
 * The actual checkout will use the Stripe price which includes fees.
 */
export function calculateStripeFee(amount: number): number {
  // Stripe fee structure for Australian transactions: ~1.75% + $0.30
  // But actual fees vary slightly, so we use a lookup table based on common amounts
  const feeLookup: { [key: number]: number } = {
    20: 1.00,    // $20 → $1.00 fee
    40: 1.70,    // $40 → $1.70 fee
    80: 3.10,    // $80 → $3.10 fee
    200: 7.30,   // $200 → $7.30 fee
    280: 10.10,  // $280 → $10.10 fee
  }

  // Check if we have an exact match
  if (feeLookup[amount]) {
    return feeLookup[amount]
  }

  // For other amounts, calculate using approximate formula: 1.75% + $0.30
  // This is close to Stripe's actual fee structure
  return Math.round((amount * 0.0175 + 0.30) * 100) / 100
}

/**
 * Reverse calculate base price from total (if total includes fees)
 * This is useful when Stripe prices already include fees but we want to show breakdown
 */
export function getBasePriceFromTotal(totalWithFees: number): number {
  // Approximate reverse calculation: total = base + (base * 0.0175 + 0.30)
  // Solving for base: base = (total - 0.30) / 1.0175
  return Math.round(((totalWithFees - 0.30) / 1.0175) * 100) / 100
}

/**
 * Calculate total amount including Stripe fees
 */
export function calculateTotalWithFee(amount: number): number {
  return amount + calculateStripeFee(amount)
}

/**
 * Format price breakdown for display
 */
export interface PriceBreakdown {
  baseAmount: number
  transactionFee: number
  total: number
}

export function getPriceBreakdown(amount: number): PriceBreakdown {
  const transactionFee = calculateStripeFee(amount)
  return {
    baseAmount: amount,
    transactionFee,
    total: amount + transactionFee,
  }
}

