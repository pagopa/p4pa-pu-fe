import { renderHook, act } from '../__tests__/renderers';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { useExportFlowFilters } from './useExportFlowFilters';
import { ExportFileFilters } from '../models/Filters';
import { GridSortModel } from '@mui/x-data-grid';
import {
  ExportFileStatus,
  ExportFileTypeEnum
} from '../../generated/apiClient';
import { useSearchParams } from 'react-router';
import { endOfDay, startOfDay, subYears } from 'date-fns';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as typeof importOriginal),
    useSearchParams: vi.fn()
  };
});

const SYSTEM_TIME = new Date('2024-01-01T12:00:00.000Z');

describe('useExportFlowFilters', () => {
  const mockSetSearchParams = vi.fn();

  const createDynamicSearchParamsMock = () => {
    let currentSearchParams = new URLSearchParams();

    const mockSetSearchParamsImpl = vi.fn((newParams: URLSearchParams) => {
      currentSearchParams = newParams;
      (useSearchParams as Mock).mockImplementation(() => [
        currentSearchParams,
        mockSetSearchParamsImpl
      ]);
    });

    (useSearchParams as Mock).mockImplementation(() => [
      currentSearchParams,
      mockSetSearchParamsImpl
    ]);

    return { mockSetSearchParamsImpl };
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(SYSTEM_TIME);

    vi.clearAllMocks();
    (useSearchParams as Mock).mockImplementation(() => [
      new URLSearchParams(),
      mockSetSearchParams
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID
      })
    );

    expect(result.current.appliedFilters).toEqual({
      exportFileType: ExportFileTypeEnum.PAID,
      size: 10,
      page: 0,
      creationDateFrom: subYears(startOfDay(SYSTEM_TIME), 1),
      creationDateTo: endOfDay(SYSTEM_TIME),
      fileName: undefined,
      status: undefined
    });

    expect(result.current.draftFilters).toEqual({
      exportFileType: ExportFileTypeEnum.PAID,
      creationDateFrom: subYears(startOfDay(SYSTEM_TIME), 1),
      creationDateTo: endOfDay(SYSTEM_TIME),
      fileName: undefined,
      status: undefined
    });
  });

  it('should update draft filters without affecting applied filters', () => {
    const { result } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID
      })
    );

    act(() => {
      result.current.updateDraftFilters({ fileName: 'export.PAID' });
    });

    expect(result.current.draftFilters.fileName).toBe('export.PAID');
    expect(result.current.appliedFilters.fileName).toBeUndefined();
  });

  it('should apply filters and reset page to 0', () => {
    const { result } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID
      })
    );

    act(() => {
      result.current.updateDraftFilters({
        fileName: 'export.PAID',
        status: ExportFileStatus.COMPLETED
      });
    });

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.appliedFilters).toEqual(
      expect.objectContaining({
        fileName: 'export.PAID',
        status: ExportFileStatus.COMPLETED,
        page: 0,
        size: 10
      })
    );
  });

  it('should handle pagination changes through new API', () => {
    createDynamicSearchParamsMock();
    const { result, rerender } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID
      })
    );

    act(() => {
      result.current.handlePageChange();
    });

    rerender();

    expect(result.current.appliedFilters.page).toBe(2);
    expect(result.current.appliedFilters.size).toBe(20);
  });

  it('should handle null dates correctly', () => {
    const { result } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID
      })
    );

    act(() => {
      result.current.handleDateFromChange(null);
      result.current.handleDateToChange(null);
    });

    expect(result.current.draftFilters.creationDateFrom).toBeUndefined();
    expect(result.current.draftFilters.creationDateTo).toBeUndefined();
  });

  it('should maintain all filters when applying new ones', () => {
    const { result } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID
      })
    );

    act(() => {
      result.current.updateDraftFilters({ fileName: 'export.PAID' });
    });

    act(() => {
      result.current.updateDraftFilters({
        status: ExportFileStatus.COMPLETED
      });
    });

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.appliedFilters).toEqual(
      expect.objectContaining({
        fileName: 'export.PAID',
        status: ExportFileStatus.COMPLETED,
        exportFileType: ExportFileTypeEnum.PAID
      })
    );
  });

  it('should handle date from changes correctly', () => {
    const { result } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID
      })
    );
    const testDate = new Date('2024-01-01T12:00:00.000Z');

    act(() => {
      result.current.handleDateFromChange(testDate);
    });

    const dateFromValue = result.current.draftFilters.creationDateFrom;
    expect(new Date(dateFromValue!).getUTCHours()).toBe(0);
    expect(new Date(dateFromValue!).getUTCMinutes()).toBe(0);
    expect(new Date(dateFromValue!).getUTCSeconds()).toBe(0);
    expect(new Date(dateFromValue!).getUTCMilliseconds()).toBe(0);
  });

  it('should handle date to changes correctly', () => {
    const { result } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID
      })
    );
    const testDate = new Date('2024-01-01T12:00:00.000Z');

    act(() => {
      result.current.handleDateToChange(testDate);
    });

    const dateToValue = result.current.draftFilters.creationDateTo;
    expect(new Date(dateToValue!).getUTCHours()).toBe(23);
    expect(new Date(dateToValue!).getUTCMinutes()).toBe(59);
    expect(new Date(dateToValue!).getUTCSeconds()).toBe(59);
    expect(new Date(dateToValue!).getUTCMilliseconds()).toBe(999);
  });

  it('should update sort model and filters when sorting is applied', () => {
    const onFiltersChange = vi.fn();

    const { result } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID,
        onFiltersChange
      })
    );

    const newSortModel: GridSortModel = [{ field: 'fileName', sort: 'asc' }];

    act(() => {
      result.current.handleSortModelChange(newSortModel);
    });

    expect(result.current.sortModel).toEqual(newSortModel);

    expect(result.current.appliedFilters).toEqual(
      expect.objectContaining({
        sort: ['fileName,asc'],
        page: 0
      })
    );

    expect(result.current.draftFilters).toEqual({
      exportFileType: ExportFileTypeEnum.PAID,
      creationDateFrom: subYears(startOfDay(SYSTEM_TIME), 1),
      creationDateTo: endOfDay(SYSTEM_TIME),
      fileName: undefined,
      status: undefined
    });

    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: ['fileName,asc'],
        page: 0
      })
    );
  });

  it('should remove sort when empty sort model is provided', () => {
    const onFiltersChange = vi.fn();

    const { result } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID,
        onFiltersChange
      })
    );

    act(() => {
      result.current.handleSortModelChange([
        { field: 'fileName', sort: 'asc' }
      ]);
    });

    act(() => {
      result.current.handleSortModelChange([]);
    });

    expect(result.current.appliedFilters.sort).toBeUndefined();
    expect(result.current.sortModel).toEqual([]);

    const lastCall =
      onFiltersChange.mock.calls[onFiltersChange.mock.calls.length - 1][0];
    expect(lastCall.page).toBe(0);
    expect(lastCall.sort).toEqual(['fileName,asc']);
  });

  it('should maintain other filter values when updating sort', () => {
    const initialFilters: Partial<ExportFileFilters> = {
      fileName: 'export.PAID',
      status: ExportFileStatus.COMPLETED
    };

    const { result } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID,
        initialFilters
      })
    );

    act(() => {
      result.current.handleSortModelChange([
        { field: 'fileName', sort: 'desc' }
      ]);
    });

    expect(result.current.appliedFilters).toEqual(
      expect.objectContaining({
        fileName: 'export.PAID',
        status: ExportFileStatus.COMPLETED,
        sort: ['fileName,desc'],
        page: 0
      })
    );
  });

  it('should return false when draft filters match applied filters', () => {
    const { result } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID
      })
    );

    expect(result.current.hasActiveFilters()).toBe(false);
  });

  it('should return true when fileName is changed', () => {
    const { result } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID
      })
    );

    act(() => {
      result.current.updateDraftFilters({ fileName: 'export.PAID' });
    });

    expect(result.current.hasActiveFilters()).toBe(true);
  });

  it('should return true when status is changed', () => {
    const { result } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID
      })
    );

    act(() => {
      result.current.updateDraftFilters({
        status: ExportFileStatus.COMPLETED
      });
    });

    expect(result.current.hasActiveFilters()).toBe(true);
  });

  it('should return true when dates are changed', () => {
    const { result } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID
      })
    );

    const testDate = new Date('2024-01-01T12:00:00.000Z');

    act(() => {
      result.current.updateDraftFilters({
        creationDateFrom: testDate,
        creationDateTo: testDate
      });
    });

    expect(result.current.hasActiveFilters()).toBe(true);
  });

  it('should return false after applying filters', () => {
    const { result } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID
      })
    );

    act(() => {
      result.current.updateDraftFilters({ fileName: 'export.PAID' });
    });

    expect(result.current.hasActiveFilters()).toBe(true);

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.hasActiveFilters()).toBe(false);
  });

  it('should handle undefined values correctly', () => {
    const { result } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID,
        initialFilters: {
          fileName: 'initial.PAID'
        }
      })
    );

    act(() => {
      result.current.updateDraftFilters({ fileName: undefined });
    });

    expect(result.current.hasActiveFilters()).toBe(true);
  });

  it('should reset page to 0 when applying filters', () => {
    const onFiltersChange = vi.fn();

    const { result } = renderHook(() =>
      useExportFlowFilters({
        exportFileType: ExportFileTypeEnum.PAID,
        onFiltersChange
      })
    );

    act(() => {
      result.current.updateDraftFilters({
        fileName: 'export.PAID',
        status: ExportFileStatus.COMPLETED
      });
    });

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.appliedFilters).toEqual({
      ...result.current.draftFilters,
      page: 0,
      size: 10
    });
  });
});
