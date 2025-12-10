import { describe, it, expect } from 'vitest';
import { truncateParams, truncateText } from '../textUtils';

describe('textUtils', () => {
  describe('truncateText', () => {
    it('should return the original string if shorter than maxLength', () => {
      const result = truncateText('Hello', 50);
      expect(result).toBe('Hello');
    });

    it('should return the original string if equal to maxLength', () => {
      const result = truncateText('Hello', 5);
      expect(result).toBe('Hello');
    });

    it('should truncate and add ellipsis if longer than maxLength', () => {
      const result = truncateText('Hello World', 5);
      expect(result).toBe('Hello...');
    });

    it('should use default maxLength of 50', () => {
      const longText = 'a'.repeat(60);
      const result = truncateText(longText);
      expect(result).toBe('a'.repeat(50) + '...');
    });

    it('should return empty string if input is empty', () => {
      const result = truncateText('', 50);
      expect(result).toBe('');
    });

    it('should handle null/undefined gracefully', () => {
      expect(truncateText(null as unknown as string, 50)).toBeFalsy();
      expect(truncateText(undefined as unknown as string, 50)).toBeFalsy();
    });

    it('should handle maxLength of 0', () => {
      const result = truncateText('Hello', 0);
      expect(result).toBe('...');
    });

    it('should handle special characters', () => {
      const result = truncateText('Città è così €100', 10);
      expect(result).toBe('Città è co...');
    });
  });

  describe('truncateParams', () => {
    it('should truncate all string values in an object', () => {
      const params = {
        name: 'Test_100_char_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        code: 'ABC123'
      };
      const result = truncateParams(params, 20);

      expect(result.name).toBe('Test_100_char_aaaaaa...');
      expect(result.code).toBe('ABC123');
    });

    it('should not modify non-string values', () => {
      const params = {
        name: 'Hello World',
        count: 42,
        active: true,
        data: null
      };
      const result = truncateParams(params, 5);

      expect(result.name).toBe('Hello...');
      expect(result.count).toBe(42);
      expect(result.active).toBe(true);
      expect(result.data).toBe(null);
    });

    it('should use default maxLength of 50', () => {
      const params = {
        description: 'a'.repeat(60)
      };
      const result = truncateParams(params);

      expect(result.description).toBe('a'.repeat(50) + '...');
    });

    it('should return the same object if params is null/undefined', () => {
      expect(
        truncateParams(null as unknown as Record<string, unknown>)
      ).toBeNull();
      expect(
        truncateParams(undefined as unknown as Record<string, unknown>)
      ).toBeUndefined();
    });

    it('should handle empty object', () => {
      const result = truncateParams({}, 50);
      expect(result).toEqual({});
    });

    it('should handle nested objects without modifying them', () => {
      const params = {
        name: 'Hello World Test Long String',
        nested: { value: 'This should not be truncated' }
      };
      const result = truncateParams(params, 10);

      expect(result.name).toBe('Hello Worl...');
      expect(result.nested).toEqual({ value: 'This should not be truncated' });
    });

    it('should handle arrays without modifying them', () => {
      const params = {
        name: 'Hello World Test',
        items: ['one', 'two', 'three']
      };
      const result = truncateParams(params, 5);

      expect(result.name).toBe('Hello...');
      expect(result.items).toEqual(['one', 'two', 'three']);
    });
  });
});
