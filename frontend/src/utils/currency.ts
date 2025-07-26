// Currency utility functions for Thai Baht formatting

/**
 * Format a number as Thai Baht currency
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: true)
 * @returns Formatted currency string
 */
export const formatThaiCurrency = (amount: number, showDecimals: boolean = true): string => {
  if (showDecimals) {
    return `฿${amount.toFixed(2)}`;
  }
  return `฿${Math.round(amount)}`;
};

/**
 * Format a number as Thai Baht with Thai locale formatting
 * @param amount - The amount to format
 * @returns Formatted currency string with proper Thai locale
 */
export const formatThaiCurrencyLocale = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Convert USD to Thai Baht (approximate rate for demo purposes)
 * In a real application, this would fetch live exchange rates
 * @param usdAmount - Amount in USD
 * @param exchangeRate - Exchange rate (default: 35 THB per USD)
 * @returns Amount in Thai Baht
 */
export const convertUsdToThb = (usdAmount: number, exchangeRate: number = 35): number => {
  return usdAmount * exchangeRate;
};
