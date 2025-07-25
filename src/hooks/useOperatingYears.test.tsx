import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import {
  useOperatingYears,
  transformOperatingYearsData,
  handleOperatingYearsError,
  type OperatingYearOption
} from './useOperatingYears';
import { getOperatingYears } from '../api/assessments';
import utils from '../utils';

vi.mock('../api/assessments');
vi.mock('../utils', () => ({
  default: {
    notify: {
      emit: vi.fn()
    }
  }
}));
vi.mock('react-i18next');

type MockQueryResult = {
  data?: string[];
  isError: boolean;
  error: unknown;
  isLoading: boolean;
  isSuccess: boolean;
  isFetching?: boolean;
  refetch?: () => void;
};

const mockGetOperatingYears = vi.mocked(getOperatingYears);
const mockNotifyEmit = vi.mocked(utils.notify.emit);
const mockUseTranslation = vi.mocked(useTranslation);

describe('transformOperatingYearsData', () => {
  it('should return empty array for undefined data', () => {
    const result = transformOperatingYearsData(undefined, false, 'Tutti');
    expect(result).toEqual([]);
  });

  it('should return empty array for null data', () => {
    const result = transformOperatingYearsData(
      null as unknown as string[] | undefined,
      false,
      'Tutti'
    );
    expect(result).toEqual([]);
  });

  it('should return empty array for non-array data', () => {
    const invalidData = 'not-array' as unknown as string[];
    const result = transformOperatingYearsData(invalidData, false, 'Tutti');
    expect(result).toEqual([]);
  });

  it('should transform valid years array correctly', () => {
    const data = ['2023', '2024', '2022'];
    const expected: OperatingYearOption[] = [
      { label: '2024', value: '2024' },
      { label: '2023', value: '2023' },
      { label: '2022', value: '2022' }
    ];

    const result = transformOperatingYearsData(data, false, 'Tutti');
    expect(result).toEqual(expected);
  });

  it('should filter out empty and whitespace-only strings', () => {
    const data = ['2023', '', '2024', '   ', '2022'];
    const expected: OperatingYearOption[] = [
      { label: '2024', value: '2024' },
      { label: '2023', value: '2023' },
      { label: '2022', value: '2022' }
    ];

    const result = transformOperatingYearsData(data, false, 'Tutti');
    expect(result).toEqual(expected);
  });

  it('should include "All" option when includeAllOption is true', () => {
    const data = ['2023', '2024'];
    const expected: OperatingYearOption[] = [
      { label: 'Tutti', value: 'ALL' },
      { label: '2024', value: '2024' },
      { label: '2023', value: '2023' }
    ];

    const result = transformOperatingYearsData(data, true, 'Tutti');
    expect(result).toEqual(expected);
  });

  it('should sort years in descending order', () => {
    const data = ['2020', '2024', '2022', '2023', '2021'];
    const result = transformOperatingYearsData(data, false, 'Tutti');

    const years = result.map((option) => option.value);
    expect(years).toEqual(['2024', '2023', '2022', '2021', '2020']);
  });

  it('should handle errors gracefully and return empty array', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const invalidData = [null, undefined, 123] as unknown as string[];
    const result = transformOperatingYearsData(invalidData, false, 'Tutti');

    expect(result).toEqual([]);
    consoleSpy.mockRestore();
  });
});

describe('handleOperatingYearsError', () => {
  const mockTranslationFn = vi.fn((key: string) => key);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should emit notification for non-server errors', () => {
    const error: AxiosError = {
      response: { status: 404 }
    } as AxiosError;

    handleOperatingYearsError(error, mockTranslationFn);

    expect(mockNotifyEmit).toHaveBeenCalledWith(
      'errors.fetchOperatingYears',
      'error'
    );
    expect(mockTranslationFn).toHaveBeenCalledWith(
      'errors.fetchOperatingYears'
    );
  });

  it('should not emit notification for server errors (5xx)', () => {
    const error: AxiosError = {
      response: { status: 500 }
    } as AxiosError;

    handleOperatingYearsError(error, mockTranslationFn);

    expect(mockNotifyEmit).not.toHaveBeenCalled();
  });

  it('should not emit notification for another server error (502)', () => {
    const error: AxiosError = {
      response: { status: 502 }
    } as AxiosError;

    handleOperatingYearsError(error, mockTranslationFn);

    expect(mockNotifyEmit).not.toHaveBeenCalled();
  });

  it('should emit notification when error has no response', () => {
    const error = new Error('Network error');

    handleOperatingYearsError(error, mockTranslationFn);

    expect(mockNotifyEmit).toHaveBeenCalledWith(
      'errors.fetchOperatingYears',
      'error'
    );
  });

  it('should emit notification when error response has no status', () => {
    const error: AxiosError = {
      response: {}
    } as AxiosError;

    handleOperatingYearsError(error, mockTranslationFn);

    expect(mockNotifyEmit).toHaveBeenCalledWith(
      'errors.fetchOperatingYears',
      'error'
    );
  });
});

describe('useOperatingYears', () => {
  const mockTranslationFn = vi.fn((key: string) => {
    if (key === 'commons.all') return 'Tutti';
    return key;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      t: mockTranslationFn,
      i18n: {} as any,
      ready: true
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default parameters', () => {
    const mockQueryResult: MockQueryResult = {
      data: undefined,
      isError: false,
      error: null,
      isLoading: true,
      isSuccess: false
    };
    mockGetOperatingYears.mockReturnValue(mockQueryResult as any);

    const { result } = renderHook(() => useOperatingYears());

    expect(mockGetOperatingYears).toHaveBeenCalledWith({ enabled: true });
    expect(result.current.optionsMap).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('should pass custom parameters to getOperatingYears', () => {
    const mockQueryResult: MockQueryResult = {
      data: undefined,
      isError: false,
      error: null,
      isLoading: false,
      isSuccess: false
    };
    mockGetOperatingYears.mockReturnValue(mockQueryResult as any);

    renderHook(() =>
      useOperatingYears({ includeAllOption: true, enabled: false })
    );

    expect(mockGetOperatingYears).toHaveBeenCalledWith({ enabled: false });
  });

  it('should transform data correctly when query succeeds', () => {
    const mockData = ['2023', '2024', '2022'];
    const mockQueryResult: MockQueryResult = {
      data: mockData,
      isError: false,
      error: null,
      isLoading: false,
      isSuccess: true
    };
    mockGetOperatingYears.mockReturnValue(mockQueryResult as any);

    const { result } = renderHook(() => useOperatingYears());

    expect(result.current.optionsMap).toEqual([
      { label: '2024', value: '2024' },
      { label: '2023', value: '2023' },
      { label: '2022', value: '2022' }
    ]);
  });

  it('should include "All" option when includeAllOption is true', () => {
    const mockData = ['2023', '2024'];
    const mockQueryResult: MockQueryResult = {
      data: mockData,
      isError: false,
      error: null,
      isLoading: false,
      isSuccess: true
    };
    mockGetOperatingYears.mockReturnValue(mockQueryResult as any);

    const { result } = renderHook(() =>
      useOperatingYears({ includeAllOption: true })
    );

    expect(result.current.optionsMap).toEqual([
      { label: 'Tutti', value: 'ALL' },
      { label: '2024', value: '2024' },
      { label: '2023', value: '2023' }
    ]);
  });

  it('should handle error correctly', async () => {
    const mockError = new AxiosError('Network error');
    const mockQueryResult: MockQueryResult = {
      data: undefined,
      isError: true,
      error: mockError,
      isLoading: false,
      isSuccess: false
    };
    mockGetOperatingYears.mockReturnValue(mockQueryResult as any);

    const { result } = renderHook(() => useOperatingYears());

    await waitFor(() => {
      expect(mockNotifyEmit).toHaveBeenCalledWith(
        'errors.fetchOperatingYears',
        'error'
      );
    });

    expect(result.current.optionsMap).toEqual([]);
    expect(result.current.isError).toBe(true);
  });

  it('should not call error handler when isError is false', () => {
    const mockQueryResult: MockQueryResult = {
      data: ['2023'],
      isError: false,
      error: null,
      isLoading: false,
      isSuccess: true
    };
    mockGetOperatingYears.mockReturnValue(mockQueryResult as any);

    renderHook(() => useOperatingYears());

    expect(mockNotifyEmit).not.toHaveBeenCalled();
  });

  it('should return all query properties', () => {
    const mockQueryResult: MockQueryResult = {
      data: ['2023'],
      isError: false,
      error: null,
      isLoading: false,
      isSuccess: true,
      isFetching: false,
      refetch: vi.fn()
    };
    mockGetOperatingYears.mockReturnValue(mockQueryResult as any);

    const { result } = renderHook(() => useOperatingYears());

    expect(result.current).toMatchObject({
      optionsMap: expect.any(Array),
      data: ['2023'],
      isError: false,
      error: null,
      isLoading: false,
      isSuccess: true,
      isFetching: false,
      refetch: expect.any(Function)
    });
  });

  it('should update optionsMap when data changes', () => {
    const mockQueryResult: MockQueryResult = {
      data: ['2023'],
      isError: false,
      error: null,
      isLoading: false,
      isSuccess: true
    };
    mockGetOperatingYears.mockReturnValue(mockQueryResult as any);

    const { result, rerender } = renderHook(() => useOperatingYears());

    expect(result.current.optionsMap).toEqual([
      { label: '2023', value: '2023' }
    ]);

    mockQueryResult.data = ['2023', '2024'];
    rerender();

    expect(result.current.optionsMap).toEqual([
      { label: '2024', value: '2024' },
      { label: '2023', value: '2023' }
    ]);
  });
});
