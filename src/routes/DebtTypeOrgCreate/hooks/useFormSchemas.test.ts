import { describe, it, expect } from 'vitest';
import { renderHook } from '../../../__tests__/renderers'; // your custom renderHook
import { useFormSchemas } from './useFormSchemas';
import { createMock } from 'zodock';

describe('useFormSchemas hook', () => {
  it('returns an array of step schemas and a combined schema', () => {
    const { result } = renderHook(() => useFormSchemas());

    // stepSchemas should be an array of length 5
    expect(result.current.stepSchemas).toHaveLength(5);

    // combinedSchema should be a Zod schema (has .parse method)
    expect(typeof result.current.combinedSchema.parse).toBe('function');
  });

  it('generates valid mock data from combinedSchema', () => {
    const { result } = renderHook(() => useFormSchemas());

    // Generate mock data from combinedSchema
    const mockData = createMock(result.current.combinedSchema);

    // Validate mock data against combinedSchema (should not throw)
    expect(() => result.current.combinedSchema.parse(mockData)).not.toThrow();
  });

  it('combinedSchema rejects invalid data', () => {
    const { result } = renderHook(() => useFormSchemas());

    // Generate mock data from combinedSchema
    const mockData = createMock(result.current.combinedSchema);

    const invalidData = {
      ...mockData,
      // intentionally missing required fields
      description: undefined
    };

    expect(() => result.current.combinedSchema.parse(invalidData)).toThrow();
  });
});
