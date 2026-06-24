/**
 * Format a number into a money string (₦1.2M, ₦500K, ₦1,500, etc.)
 * @param amount - The number to format
 * @param options - Optional config:
 *    - currency: string (default: ₦)
 *    - short: boolean (default: true)
 *    - decimals: number (default: 1)
 * @returns formatted string
 */
export function formatMoney(
  amount: number,
  options: { currency?: string; short?: boolean; decimals?: number } = {}
): string {
  const { currency = "₦", short = true, decimals = 1 } = options;

  if (isNaN(amount)) return `${currency}0`;

  const absAmount = Math.abs(amount);

  // ✅ Short format (₦1.2M, ₦500K, etc.)
  if (short) {
    if (absAmount >= 1_000_000_000) {
      return `${currency}${(amount / 1_000_000_000)
        .toFixed(decimals)
        .replace(/\.0+$/, "")}B`;
    } else if (absAmount >= 1_000_000) {
      return `${currency}${(amount / 1_000_000)
        .toFixed(decimals)
        .replace(/\.0+$/, "")}M`;
    } else if (absAmount >= 1_000) {
      return `${currency}${(amount / 1_000)
        .toFixed(decimals)
        .replace(/\.0+$/, "")}K`;
    }
    return `${currency}${amount.toLocaleString()}`;
  }

  // ✅ Full format (₦1,234,567)
  return `${currency}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })}`;
}
