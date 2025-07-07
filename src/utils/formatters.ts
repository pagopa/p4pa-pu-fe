import { format, parseISO } from 'date-fns';
import { endOfDay } from 'date-fns/endOfDay';
import { startOfDay } from 'date-fns/startOfDay';
import { it } from 'date-fns/locale';
import i18n from '../translations/i18n';

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
  items: Array<string>,
  uniqueTranslationPath?: string
): Array<optionMapItem> {
  const sortedItems = sortItems(items);
  const label = uniqueTranslationPath ? `${uniqueTranslationPath}.` : '';
  return sortedItems.map((item) => ({
    label: i18n.t(`${label}${item}`),
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

/**
 * Converts an unknown value to an appropriate Date object for input components
 * @param value - The value to convert (can be string, Date or null/undefined)
 * @returns Date object or null if the value is not valid
 */
export function convertToDateValue(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return new Date(value);
  }

  return value as Date;
}

/**
 * Checks if a date is in the past (relative to today's midnight)
 * Follows the same validation pattern used in the project's form schemas
 * @param dateToCheck - The date to check (ISO string, Date object, null or undefined)
 * @returns true if the date is in the past, false otherwise
 */
export function isDateInPast(
  dateToCheck: string | Date | null | undefined
): boolean {
  if (!dateToCheck) return false;
  let date: Date;
  if (typeof dateToCheck === 'string') {
    date = parseISO(dateToCheck);
  } else {
    date = dateToCheck;
  }
  // If the date is not valid, do not consider it in the past
  if (isNaN(date.getTime())) return false;
  // Create today's midnight for comparison (same pattern as Step3Schema.ts)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Formats file size from bytes to human-readable format
 * @param size - The file size in bytes
 * @returns Formatted file size string with appropriate unit (Bytes, KB, MB)
 */
export function formatFileSize(size: number): string {
  if (!size) {
    return '0 Bytes';
  }
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  } else if (size >= 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  } else {
    return `${size} Bytes`;
  }
}
