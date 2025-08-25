import { describe, it, expect, vi } from 'vitest';
import {
  moneyFormat,
  formatDate,
  formatDateTime,
  toStartOfDay,
  toEndOfDay,
  extractFilename,
  euroToCents,
  optionMapsConverter,
  formatFileSize,
  toCamelCase
} from '../formatters';

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

describe('toStartOfDay', () => {
  it('should return start of day for a valid date', () => {
    const date = new Date('2023-10-15T14:30:45Z');
    const result = toStartOfDay(date);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getHours()).toBe(0);
    expect(result?.getMinutes()).toBe(0);
    expect(result?.getSeconds()).toBe(0);
    expect(result?.getMilliseconds()).toBe(0);
  });

  it('should return null for undefined input', () => {
    expect(toStartOfDay()).toBeNull();
  });

  it('should return null for null input', () => {
    expect(toStartOfDay(null)).toBeNull();
  });
});

describe('toEndOfDay', () => {
  it('should return end of day for a valid date', () => {
    const date = new Date('2023-10-15T14:30:45Z');
    const result = toEndOfDay(date);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getHours()).toBe(23);
    expect(result?.getMinutes()).toBe(59);
    expect(result?.getSeconds()).toBe(59);
    expect(result?.getMilliseconds()).toBe(999);
  });

  it('should return null for undefined input', () => {
    expect(toEndOfDay()).toBeNull();
  });

  it('should return null for null input', () => {
    expect(toEndOfDay(null)).toBeNull();
  });
});

describe('extractFilename', () => {
  it('should extract filename from content-disposition header', () => {
    const header = 'attachment; filename="documento.pdf"';
    expect(extractFilename(header)).toBe('documento.pdf');
  });

  it('should extract filename with spaces', () => {
    const header = 'attachment; filename="il mio documento.pdf"';
    expect(extractFilename(header)).toBe('il mio documento.pdf');
  });

  it('should handle single quotes', () => {
    const header = "attachment; filename='documento.pdf'";
    expect(extractFilename(header)).toBe('documento.pdf');
  });

  it('should handle no quotes', () => {
    const header = 'attachment; filename=documento.pdf';
    expect(extractFilename(header)).toBe('documento.pdf');
  });

  it('should return null for invalid header', () => {
    expect(extractFilename('invalid header')).toBeNull();
  });

  it('should return null for empty header', () => {
    expect(extractFilename('')).toBeNull();
  });
});

describe('euroToCents', () => {
  it('should convert string euro amount to cents', () => {
    expect(euroToCents('10,50')).toBe(1050);
    expect(euroToCents('100,00')).toBe(10000);
    expect(euroToCents('0,99')).toBe(99);
  });

  it('should convert number euro amount to cents', () => {
    expect(euroToCents(10.5)).toBe(1050);
    expect(euroToCents(100.0)).toBe(10000);
    expect(euroToCents(0.99)).toBe(99);
  });

  it('should handle negative values', () => {
    expect(euroToCents('-10,50')).toBe(-1050);
    expect(euroToCents(-10.5)).toBe(-1050);
  });

  it('should handle zero values', () => {
    expect(euroToCents('0,00')).toBe(0);
    expect(euroToCents(0)).toBe(0);
  });
});

describe('optionMapsConverter', () => {
  it('should convert array of strings to option map items', () => {
    const items = ['B', 'A', 'C'];
    const expected = [
      { label: 'A', value: 'A' },
      { label: 'B', value: 'B' },
      { label: 'C', value: 'C' }
    ];
    expect(optionMapsConverter(items)).toEqual(expected);
  });

  it('should handle empty array', () => {
    expect(optionMapsConverter([])).toEqual([]);
  });

  it('should handle array with one item', () => {
    const items = ['A'];
    const expected = [{ label: 'A', value: 'A' }];
    expect(optionMapsConverter(items)).toEqual(expected);
  });

  it('should handle array with duplicate items', () => {
    const items = ['B', 'A', 'B', 'C', 'A'];
    const expected = [
      { label: 'A', value: 'A' },
      { label: 'A', value: 'A' },
      { label: 'B', value: 'B' },
      { label: 'B', value: 'B' },
      { label: 'C', value: 'C' }
    ];
    expect(optionMapsConverter(items)).toEqual(expected);
  });

  it('should translated labels', () => {
    const items = ['B', 'A', 'B', 'C', 'A'];
    const expected = [
      { label: 'commons.status.A', value: 'A' },
      { label: 'commons.status.A', value: 'A' },
      { label: 'commons.status.B', value: 'B' },
      { label: 'commons.status.B', value: 'B' },
      { label: 'commons.status.C', value: 'C' }
    ];
    expect(optionMapsConverter(items, 'commons.status')).toEqual(expected);
  });
});

describe('formatFileSize', () => {
  it('should format bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(100)).toBe('100 Bytes');
    expect(formatFileSize(512)).toBe('512 Bytes');
    expect(formatFileSize(1023)).toBe('1023 Bytes');
  });

  it('should format kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1048575)).toBe('1024.0 KB');
  });

  it('should format megabytes correctly', () => {
    expect(formatFileSize(1048576)).toBe('1.00 MB');
    expect(formatFileSize(2097152)).toBe('2.00 MB');
    expect(formatFileSize(1572864)).toBe('1.50 MB');
    expect(formatFileSize(5242880)).toBe('5.00 MB');
  });

  it('should handle large file sizes correctly', () => {
    expect(formatFileSize(1073741824)).toBe('1024.00 MB');
    expect(formatFileSize(10737418240)).toBe('10240.00 MB');
  });

  it('should handle edge cases', () => {
    expect(formatFileSize(null as unknown as number)).toBe('0 Bytes');
    expect(formatFileSize(undefined as unknown as number)).toBe('0 Bytes');
  });
});

describe('toCamelCase', () => {
  describe('Basic cases', () => {
    it('should convert simple snake_case to camelCase', () => {
      expect(toCamelCase('hello_world')).toBe('helloWorld');
    });

    it('should convert snake_case with multiple words', () => {
      expect(toCamelCase('user_first_name')).toBe('userFirstName');
    });

    it('should handle single word without underscore', () => {
      expect(toCamelCase('hello')).toBe('hello');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      expect(toCamelCase('')).toBe('');
    });

    it('should handle string with only underscore', () => {
      expect(toCamelCase('_')).toBe('');
    });

    it('should handle multiple consecutive underscores', () => {
      expect(toCamelCase('hello__world')).toBe('helloWorld');
    });

    it('should handle underscore at the beginning', () => {
      expect(toCamelCase('_hello_world')).toBe('helloWorld');
    });

    it('should handle underscore at the end', () => {
      expect(toCamelCase('hello_world_')).toBe('helloWorld');
    });
  });

  describe('Case handling', () => {
    it('should convert everything to lowercase before conversion', () => {
      expect(toCamelCase('HELLO_WORLD')).toBe('helloWorld');
    });

    it('should handle mixed case strings', () => {
      expect(toCamelCase('Hello_WORLD_Test')).toBe('helloWorldTest');
    });
  });

  describe('Special cases', () => {
    it('should handle numbers', () => {
      expect(toCamelCase('user_id_123')).toBe('userId123');
    });

    it('should handle single words with numbers', () => {
      expect(toCamelCase('test123')).toBe('test123');
    });

    it('should handle words starting with numbers', () => {
      expect(toCamelCase('123_test_case')).toBe('123TestCase');
    });
  });

  describe('Property tests', () => {
    it('should never contain underscores in result', () => {
      const testCases = [
        'hello_world',
        'a_b_c_d_e',
        '_hello_',
        'test__case',
        'MIXED_case_STRING'
      ];

      testCases.forEach((testCase) => {
        const result = toCamelCase(testCase);
        expect(result).not.toContain('_');
      });
    });

    it('should be idempotent for already camelCase strings', () => {
      const camelCaseString = 'alreadyCamelCase';
      expect(toCamelCase(camelCaseString)).toBe('alreadycamelcase');
    });
  });
});
