import { endOfDay } from 'date-fns/endOfDay';
import { startOfDay } from 'date-fns/startOfDay';

type optionMapItem = {
  label: string;
  value: string;
};

function sortItems(items: Array<string>) {
  return items.sort((a, b) => a.localeCompare(b));
}

export function moneyFormat(
  amount: number,
  decimalDigits = 2,
  fractionDigits = 2
) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(amount ? amount / Math.pow(10, decimalDigits) : 0);
}

export function optionMapsConverter(
  items: Array<string>
): Array<optionMapItem> {
  const sortedItems = sortItems(items);
  return sortedItems.map((item) => ({
    label: item,
    value: item
  }));
}

export function toStartOfDay(date?: Date | null) {
  return date ? startOfDay(date) : null;
}

export function toEndOfDay(date?: Date | null) {
  return date ? endOfDay(date) : null;
}
