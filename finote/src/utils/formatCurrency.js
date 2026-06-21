/**
 * Format a number as Indonesian Rupiah
 * @param {number} amount
 * @param {boolean} compact - Use compact notation (e.g. 1,5 Jt)
 * @returns {string}
 */
export const formatCurrency = (amount, compact = false) => {
  if (amount === null || amount === undefined) return 'Rp 0'
  
  if (compact) {
    if (Math.abs(amount) >= 1_000_000_000) {
      return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`
    }
    if (Math.abs(amount) >= 1_000_000) {
      return `Rp ${(amount / 1_000_000).toFixed(1)} Jt`
    }
    if (Math.abs(amount) >= 1_000) {
      return `Rp ${(amount / 1_000).toFixed(0)} Rb`
    }
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format currency without symbol
 */
export const formatNumber = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount || 0)
}

/**
 * Parse currency string to number
 */
export const parseCurrency = (str) => {
  if (!str) return 0
  return parseFloat(str.toString().replace(/[^0-9.]/g, '')) || 0
}
