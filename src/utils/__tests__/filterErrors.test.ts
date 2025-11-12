import { describe, it, expect } from 'vitest';
import {
  clearFieldError,
  setFieldError,
  stripErrorFields
} from '../filterErrors';

describe('filterErrors utils', () => {
  it('setFieldError should add error message for field', () => {
    const values = { fiscalCode: 'ABC' } as const;
    const result = setFieldError(values, 'fiscalCode', 'invalid');
    expect(result).toEqual({
      fiscalCode: 'ABC',
      fiscalCode_error: 'invalid'
    });
  });

  it('clearFieldError should clear existing error for field', () => {
    const values = {
      fiscalCode: 'ABC',
      fiscalCode_error: 'invalid'
    } as const;
    const result = clearFieldError(values, 'fiscalCode');
    expect(result).toEqual({
      fiscalCode: 'ABC',
      fiscalCode_error: ''
    });
  });

  it('clearFieldError should return same object shape if error key is absent', () => {
    const values = { fiscalCode: 'ABC' } as const;
    const result = clearFieldError(values, 'fiscalCode');
    expect(result).toEqual({ fiscalCode: 'ABC' });
  });

  it('stripErrorFields should remove all *_error keys', () => {
    const values = {
      fiscalCode: 'ABC',
      fiscalCode_error: 'invalid',
      iuv: '123',
      iuv_error: ''
    } as const;
    const result = stripErrorFields(values);
    expect(result).toEqual({
      fiscalCode: 'ABC',
      iuv: '123'
    });
    expect('fiscalCode_error' in result).toBe(false);
    expect('iuv_error' in result).toBe(false);
  });
});
