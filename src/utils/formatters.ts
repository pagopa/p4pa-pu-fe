import { format, parseISO } from 'date-fns';
import { endOfDay } from 'date-fns/endOfDay';
import { startOfDay } from 'date-fns/startOfDay';
import { it } from 'date-fns/locale';

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

export function euroToCents(amount: string | number): number {
  const numericAmount =
    typeof amount === 'string' ? parseFloat(amount.replace(',', '.')) : amount;
  return Math.round(numericAmount * 100);
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

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy', { locale: it });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

export function formatDateTime(dateTimeString?: string): string {
  if (!dateTimeString) return '';
  try {
    const date = parseISO(dateTimeString);
    return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: it });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
}

export function toStartOfDay(date?: Date | null) {
  return date ? startOfDay(date) : null;
}

export function toEndOfDay(date?: Date | null) {
  return date ? endOfDay(date) : null;
}

export function extractFilename(header: string): string | null {
  const filenameMatch = /filename=["']?([^"';]+)["']?/i.exec(header);
  return filenameMatch ? filenameMatch[1].trim() : null;
}
