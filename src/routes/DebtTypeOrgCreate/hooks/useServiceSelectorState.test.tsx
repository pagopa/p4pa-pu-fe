/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { renderHook } from '../../../__tests__/renderers';
import { useServiceSelectorState } from './useServiceSelectorState';
import { OrgSilServiceDTO } from '../../../api/orgSilServices';

describe('useServiceSelectorState', () => {
  const baseTranslationKey = 'test.service';

  const mockServices: Array<OrgSilServiceDTO> = [
    {
      orgSilServiceId: 1,
      organizationId: 123,
      applicationName: 'Service 1',
      serviceUrl: 'https://service1.com',
      serviceType: 'NOTIFICATION' as any,
      creationDate: '2023-01-01T00:00:00Z'
    },
    {
      orgSilServiceId: 2,
      organizationId: 123,
      applicationName: 'Service 2',
      serviceUrl: 'https://service2.com',
      serviceType: 'ACTUALIZATION' as any,
      creationDate: '2023-01-02T00:00:00Z'
    }
  ];

  it('transforms services data into options correctly', () => {
    const mockQuery = {
      data: mockServices,
      isLoading: false,
      error: null
    } as any;

    const { result } = renderHook(() =>
      useServiceSelectorState(mockQuery, false, baseTranslationKey)
    );

    expect(result.current.options).toEqual([
      {
        value: 1,
        label: 'Service 1',
        description: 'https://service1.com'
      },
      {
        value: 2,
        label: 'Service 2',
        description: 'https://service2.com'
      }
    ]);
  });

  it('filters out services with invalid IDs', () => {
    const servicesWithInvalidIds: Array<OrgSilServiceDTO> = [
      ...mockServices,
      {
        orgSilServiceId: 0,
        organizationId: 123,
        applicationName: 'Invalid Service',
        serviceUrl: 'https://invalid.com',
        serviceType: 'NOTIFICATION' as any
      },
      {
        orgSilServiceId: undefined,
        organizationId: 123,
        applicationName: 'Another Invalid',
        serviceUrl: 'https://invalid2.com',
        serviceType: 'NOTIFICATION' as any
      },
      {
        organizationId: 123,
        applicationName: 'Missing ID Service',
        serviceUrl: 'https://missing.com',
        serviceType: 'NOTIFICATION' as any
      }
    ];

    const mockQuery = {
      data: servicesWithInvalidIds,
      isLoading: false,
      error: null
    } as any;

    const { result } = renderHook(() =>
      useServiceSelectorState(mockQuery, false, baseTranslationKey)
    );

    expect(result.current.options).toHaveLength(2);
    expect(result.current.options.every((option) => option.value > 0)).toBe(
      true
    );
    expect(result.current.options).toEqual([
      {
        value: 1,
        label: 'Service 1',
        description: 'https://service1.com'
      },
      {
        value: 2,
        label: 'Service 2',
        description: 'https://service2.com'
      }
    ]);
  });

  it('handles loading state correctly', () => {
    const mockQuery = {
      data: undefined,
      isLoading: true,
      error: null
    } as any;

    const { result } = renderHook(() =>
      useServiceSelectorState(mockQuery, false, baseTranslationKey)
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.placeholderKey).toBe('commons.loading');
    expect(result.current.helperTextKey).toBe(
      `${baseTranslationKey}.helperText`
    );
  });

  it('handles error state correctly', () => {
    const mockQuery = {
      data: undefined,
      isLoading: false,
      error: new Error('API Error')
    } as any;

    const { result } = renderHook(() =>
      useServiceSelectorState(mockQuery, false, baseTranslationKey)
    );

    expect(result.current.hasError).toBe(true);
    expect(result.current.helperTextKey).toBe(`${baseTranslationKey}.error`);
  });

  it('handles no options available state', () => {
    const mockQuery = {
      data: [],
      isLoading: false,
      error: null
    } as any;

    const { result } = renderHook(() =>
      useServiceSelectorState(mockQuery, false, baseTranslationKey)
    );

    expect(result.current.noOptionsAvailable).toBe(true);
    expect(result.current.placeholderKey).toBe(
      `${baseTranslationKey}.noOptions`
    );
    expect(result.current.helperTextKey).toBe(
      `${baseTranslationKey}.noOptionsHelp`
    );
  });

  it('handles edit mode correctly', () => {
    const mockQuery = {
      data: mockServices,
      isLoading: false,
      error: null
    } as any;

    const { result } = renderHook(() =>
      useServiceSelectorState(mockQuery, true, baseTranslationKey)
    );

    expect(result.current.helperTextKey).toBe(
      `${baseTranslationKey}.editHelperText`
    );
  });

  it('returns correct placeholder for normal state', () => {
    const mockQuery = {
      data: mockServices,
      isLoading: false,
      error: null
    } as any;

    const { result } = renderHook(() =>
      useServiceSelectorState(mockQuery, false, baseTranslationKey)
    );

    expect(result.current.placeholderKey).toBe(
      `${baseTranslationKey}.placeholder`
    );
  });

  it('handles empty data correctly', () => {
    const mockQuery = {
      data: undefined,
      isLoading: false,
      error: null
    } as any;

    const { result } = renderHook(() =>
      useServiceSelectorState(mockQuery, false, baseTranslationKey)
    );

    expect(result.current.options).toEqual([]);
    expect(result.current.noOptionsAvailable).toBe(true);
  });

  it('handles services with missing optional fields gracefully', () => {
    const minimalServices: Array<OrgSilServiceDTO> = [
      {
        orgSilServiceId: 1,
        organizationId: 123,
        applicationName: 'Minimal Service',
        serviceUrl: 'https://minimal.com',
        serviceType: 'NOTIFICATION' as any
      }
    ];

    const mockQuery = {
      data: minimalServices,
      isLoading: false,
      error: null
    } as any;

    const { result } = renderHook(() =>
      useServiceSelectorState(mockQuery, false, baseTranslationKey)
    );

    expect(result.current.options).toEqual([
      {
        value: 1,
        label: 'Minimal Service',
        description: 'https://minimal.com'
      }
    ]);
  });

  it('handles services with additional optional fields', () => {
    const richServices: Array<OrgSilServiceDTO> = [
      {
        orgSilServiceId: 1,
        organizationId: 123,
        applicationName: 'Rich Service',
        serviceUrl: 'https://rich.com',
        serviceType: 'ACTUALIZATION' as any,
        creationDate: '2023-01-01T00:00:00Z',
        updateDate: '2023-01-02T00:00:00Z',
        updateOperatorExternalId: 'operator123',
        updateTraceId: 'trace456',
        flagLegacy: false,
        // authConfig: {
        //   clientId: 'client123',
        //   secretKey: 'secret456'
        // } as any,
        _links: {
          self: { href: 'https://api.example.com/services/1' } as any
        }
      }
    ];

    const mockQuery = {
      data: richServices,
      isLoading: false,
      error: null
    } as any;

    const { result } = renderHook(() =>
      useServiceSelectorState(mockQuery, false, baseTranslationKey)
    );

    expect(result.current.options).toEqual([
      {
        value: 1,
        label: 'Rich Service',
        description: 'https://rich.com'
      }
    ]);
  });

  it('memoizes options correctly when data changes', () => {
    const mockQuery = {
      data: [mockServices[0]],
      isLoading: false,
      error: null
    } as any;

    const { result, rerender } = renderHook(
      ({ query }) => useServiceSelectorState(query, false, baseTranslationKey),
      { initialProps: { query: mockQuery } }
    );

    const firstOptions = result.current.options;
    expect(firstOptions).toHaveLength(1);

    rerender({ query: mockQuery });
    expect(result.current.options).toBe(firstOptions);

    const newMockQuery = {
      data: mockServices,
      isLoading: false,
      error: null
    } as any;

    rerender({ query: newMockQuery });
    expect(result.current.options).not.toBe(firstOptions);
    expect(result.current.options).toHaveLength(2);
  });

  it('handles all state combinations correctly', () => {
    const testCases = [
      {
        query: { data: mockServices, isLoading: false, error: null },
        edit: false,
        expectedHelperText: `${baseTranslationKey}.helperText`
      },
      {
        query: { data: mockServices, isLoading: false, error: null },
        edit: true,
        expectedHelperText: `${baseTranslationKey}.editHelperText`
      },
      {
        query: { data: [], isLoading: false, error: null },
        edit: false,
        expectedHelperText: `${baseTranslationKey}.noOptionsHelp`
      },
      {
        query: {
          data: mockServices,
          isLoading: false,
          error: new Error('Test')
        },
        edit: false,
        expectedHelperText: `${baseTranslationKey}.error`
      }
    ];

    testCases.forEach(({ query, edit, expectedHelperText }) => {
      const { result } = renderHook(() =>
        useServiceSelectorState(query as any, edit, baseTranslationKey)
      );

      expect(result.current.helperTextKey).toBe(expectedHelperText);
    });
  });
});
