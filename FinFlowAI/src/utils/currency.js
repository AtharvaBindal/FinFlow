// Currency configuration
export const CURRENCIES = {
  USD: { symbol: '$', code: 'USD', name: 'US Dollar', locale: 'en-US' },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro', locale: 'de-DE' },
  INR: { symbol: '₹', code: 'INR', name: 'Indian Rupee', locale: 'en-IN' },
  GBP: { symbol: '£', code: 'GBP', name: 'British Pound', locale: 'en-GB' },
};

/**
 * Get the currency symbol for a given currency code.
 * @param {string} currencyCode - e.g. 'USD', 'INR'
 * @returns {string} Currency symbol like '$', '₹'
 */
export function getCurrencySymbol(currencyCode) {
  return (CURRENCIES[currencyCode] || CURRENCIES.USD).symbol;
}

/**
 * Format a number as a currency string using the user's currency.
 * @param {number} amount
 * @param {string} currencyCode
 * @param {boolean} [compact=false] - Use compact notation (e.g. 1.2K)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currencyCode, compact = false) {
  const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
  if (compact) {
    if (Math.abs(amount) >= 1000) {
      return `${config.symbol}${(amount / 1000).toFixed(1)}K`;
    }
  }
  return `${config.symbol}${amount.toLocaleString(config.locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
