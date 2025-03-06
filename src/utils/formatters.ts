export function moneyFormat(
  amount: number,
  decimalDigits: number = 2,
  fractionDigits: number = 2
) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount ? amount / Math.pow(10, decimalDigits) : 0);
}
