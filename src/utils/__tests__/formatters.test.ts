import { describe, it, expect, vi } from 'vitest';
import { moneyFormat, formatDate, formatDateTime } from '../formatters';

describe('moneyFormat', () => {
  it('should format the amount with default parameters', () => {
    expect(moneyFormat(10000)).toMatch(/100,00/);
    expect(moneyFormat(20000)).toMatch(/200,00/);
  });

  it('should format the amount without division when decimalDigits is 0', () => {
    expect(moneyFormat(10000, 0)).toMatch(/10\.000,00/);
    expect(moneyFormat(20000, 0)).toMatch(/20\.000,00/);
  });

  it('should format the amount with different fraction digits', () => {
    expect(moneyFormat(10000, 2, 0)).toMatch(/100/);
    expect(moneyFormat(10000, 2, 3)).toMatch(/100,000/);
    expect(moneyFormat(10000, 0, 0)).toMatch(/10\.000/);
  });

  it('should handle zero values correctly', () => {
    expect(moneyFormat(0)).toMatch(/0,00/);
    expect(moneyFormat(0, 0)).toMatch(/0,00/);
    expect(moneyFormat(0, 2, 0)).toMatch(/0/);
  });

  it('should handle negative values correctly', () => {
    const formattedNegative = moneyFormat(-10000);

    expect(formattedNegative).toMatch(/-100,00/);
    expect(moneyFormat(-10000, 0)).toMatch(/-10\.000,00/);
  });

  it('should handle decimal input values correctly', () => {
    const formattedValue = moneyFormat(1234.56);

    expect(formattedValue).toEqual(expect.stringContaining('12,35'));
  });
});

describe('formatDate', () => {
  it('should format a valid ISO date string correctly', () => {
    expect(formatDate('2023-10-15')).toBe('15/10/2023');
    expect(formatDate('2023-01-05T00:00:00Z')).toBe('05/01/2023');
  });

  it('should return empty string for undefined input', () => {
    expect(formatDate()).toBe('');
  });

  it('should return empty string and log error for invalid date', () => {
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    expect(formatDate('not-a-date')).toBe('');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('formatDateTime', () => {
  it('should format a valid ISO datetime string correctly', () => {
    expect(formatDateTime('2023-10-15T14:30:45Z')).toBe('15/10/2023 14:30:45');
    expect(formatDateTime('2023-01-05T08:15:30Z')).toBe('05/01/2023 08:15:30');
  });

  it('should return empty string for undefined input', () => {
    expect(formatDateTime()).toBe('');
  });

  it('should return empty string and log error for invalid datetime', () => {
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    expect(formatDateTime('not-a-datetime')).toBe('');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle timezone conversion correctly', () => {
    const midnightUTC = '2023-05-10T00:00:00Z';
    expect(formatDateTime(midnightUTC)).toBe('10/05/2023 00:00:00');

    const dateWithTZ = '2023-05-10T12:30:45+02:00';
    expect(formatDateTime(dateWithTZ)).toBe('10/05/2023 10:30:45');
  });
});
