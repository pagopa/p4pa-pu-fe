import { describe, it, expect } from 'vitest';
import { toUTCString } from '../formatter';

describe('toUTCString', () => {
  
  it('should convert a simple date string to UTC format', () => {
    const input = '2024-02-18';
    const expected = '2024-02-18T00:00:00.000Z';
    expect(toUTCString(input)).toBe(expected);
  });

  it('should handle date strings with time components', () => {
    const input = '2024-02-18T15:30:00';
    const expected = '2024-02-18T14:30:00.000Z';
    expect(toUTCString(input)).toBe(expected);
  });

  it('should handle dates with timezone offsets', () => {
    const input = '2024-02-18T15:30:00+02:00';
    const expected = '2024-02-18T13:30:00.000Z';
    expect(toUTCString(input)).toBe(expected);
  });
});
