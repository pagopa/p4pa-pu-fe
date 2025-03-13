import { describe, it, expect } from 'vitest';
import { moneyFormat } from '../formatters';

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
    console.log(
      `Negative formatted value: "${formattedNegative}", length: ${formattedNegative.length}`
    );

    expect(formattedNegative).toMatch(/-100,00/);
    expect(moneyFormat(-10000, 0)).toMatch(/-10\.000,00/);
  });

  it('should handle decimal input values correctly', () => {
    const formattedValue = moneyFormat(1234.56);
    console.log(
      `Formatted value: "${formattedValue}", length: ${formattedValue.length}`
    );

    expect(formattedValue).toEqual(expect.stringContaining('12,35'));
    expect(moneyFormat(1234.56, 0)).toEqual(
      expect.stringContaining('1.234,56')
    );
  });
});
