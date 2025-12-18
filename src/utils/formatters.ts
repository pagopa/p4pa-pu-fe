import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
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

export const date = {
  /**
   * @name code
   * @category utils
   * @description
   * This function takes an object Date as parameter and outpus it in a string
   * compatible with BE service. This function should be called every time
   * a date information is transmitted to the BE. It outputs full date according to
   * the ISO 8601/RFC 3399 using and assuming the Europe/Rome timezone
   * https://datatracker.ietf.org/doc/html/rfc3339#section-5.6
   * @param dateObj - The original date object
   * @example
   * // Represent 1 Gennuary 2025 at 8:30:
   * console.log(code(new Date('2025-01-01T08:30:00Z')))
   * // => '2025-01-01T09:30:00+01:00'
   * @example
   * // Represent 15 August 2025 at 13:00:
   * console.log(code(new Date('2025-08-15T13:00:00Z')))
   * // => '2025-08-15T15:00:00+02:00' */
  code: (dateObj?: Date | null) => {
    // Guard: return undefined for falsy values or Invalid Date
    if (!dateObj || isNaN(dateObj.getTime())) {
      return undefined;
    }
    return formatInTimeZone(dateObj, date.TIME_ZONE, date.DATE_FORMAT);
  },
  /** This method takes an string and convert to human redable date */
  decode: () => 'To be implemented',
  DATE_FORMAT: "yyyy-MM-dd'T'HH:mm:ssXXX",
  TIME_ZONE: 'Europe/Rome'
};

export const getDefaultDateRange = () => {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  return {
    from: new Date(oneYearAgo.setHours(0, 0, 0, 0)),
    to: new Date(today.setHours(23, 59, 59, 999))
  };
};

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

export function formatDateTime(
  dateTimeString?: string,
  noSeconds?: boolean
): string {
  if (!dateTimeString) return '';
  try {
    const date = parseISO(dateTimeString);
    const dateFormat = noSeconds ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy HH:mm:ss';
    return format(date, dateFormat, { locale: it });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
}

export function toStartOfDay(date?: Date | null) {
  // Guard: return null for falsy values or Invalid Date
  if (!date || isNaN(date.getTime())) {
    return null;
  }
  return startOfDay(date);
}

export function toEndOfDay(date?: Date | null) {
  // Guard: return null for falsy values or Invalid Date
  if (!date || isNaN(date.getTime())) {
    return null;
  }
  return endOfDay(date);
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
/**
 * Converts any value to Italian format display (with comma as decimal separator)
 * @param value - The value to format (can be string, number, or any type)
 * @returns Formatted string with comma as decimal separator for display
 */
export function formatAmountForDisplay(value: unknown): string {
  if (!value && value !== 0) return '';

  const num = parseAmountToNumber(String(value));
  if (num === null) return '';
  return num.toFixed(2).replace('.', ',');
}

/**
 * Validates if the input is a valid amount format
 * Allows only digits, one comma or dot, and maximum 2 decimal places
 * @param input - The input string to validate
 * @returns true if the input is valid, false otherwise
 */
export function isValidAmountInput(input: string): boolean {
  const regex = /^\d*[,.]?\d{0,2}$/;
  return regex.test(input);
}

/**
 * Sanitizes amount input by removing invalid characters and formatting
 * - Removes all non-numeric characters except comma and dot
 * - Converts dots to commas for consistency
 * - Keeps only the first decimal separator
 * - Limits to maximum 2 decimal places
 * @param input - The raw input string
 * @returns Cleaned and formatted string
 */
export function sanitizeAmountInput(input: string): string {
  // Remove everything except numbers, comma and dot
  let cleaned = input.replace(/[^0-9,.]/g, '');

  // Replace dots with commas for visual consistency
  cleaned = cleaned.replace(/\./g, ',');

  // Keep only the first comma
  const parts = cleaned.split(',');
  if (parts.length > 2) {
    cleaned = parts[0] + ',' + parts.slice(1).join('');
  }

  // Limit to maximum 2 decimal places after comma
  if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + ',' + parts[1].substring(0, 2);
  }

  return cleaned;
}

/**
 * Converts amount string to number, handling both comma and dot formats
 * @param amount - The amount string (can have comma or dot as decimal separator)
 * @returns Number value or null if conversion fails
 */
export function parseAmountToNumber(amount: string): number | null {
  if (!amount || amount.trim() === '') return null;

  // Convert comma to dot for parsing
  const normalizedAmount = amount.replace(',', '.');
  const parsed = parseFloat(normalizedAmount);

  return isNaN(parsed) ? null : parsed;
}

export const toCamelCase = (str: string): string => {
  return str
    .toLowerCase()
    .split('_')
    .filter((word) => word.length > 0)
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');
};
