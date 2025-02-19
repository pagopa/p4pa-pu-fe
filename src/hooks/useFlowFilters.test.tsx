import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFlowFilters } from './useFlowFilters';
import { FlowFileType, FlowStatus } from '../store/types';


describe('useFlowFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFlowFilters({
      flowFileTypes: [FlowFileType.RECEIPT],
    }));

    expect(result.current.appliedFilters).toEqual({
      flowFileTypes: [FlowFileType.RECEIPT],
      size: 10,
      page: 0
    });

    expect(result.current.draftFilters).toEqual({
      flowFileTypes: [FlowFileType.RECEIPT],
      size: 10,
      page: 0
    });
  });

  it('should update draft filters without affecting applied filters', () => {
    const { result } = renderHook(() => useFlowFilters({
      flowFileTypes: [FlowFileType.RECEIPT],
    }));

    act(() => {
      result.current.updateDraftFilters({ fileName: 'test.pdf' });
    });

    expect(result.current.draftFilters.fileName).toBe('test.pdf');
    expect(result.current.appliedFilters.fileName).toBeUndefined();
  });

  it('should apply filters and reset page to 0', () => {
    const { result } = renderHook(() => useFlowFilters({
      flowFileTypes: [FlowFileType.RECEIPT],
    }));

    act(() => {
      result.current.updateDraftFilters({ 
        fileName: 'test.pdf',
        status: FlowStatus.COMPLETED,
        page: 2
      });
    });

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.appliedFilters).toEqual({
      ...result.current.draftFilters,
      page: 0
    });
  });

  it('should update pagination immediately', () => {
    const { result } = renderHook(() => useFlowFilters({
      flowFileTypes: [FlowFileType.RECEIPT],
    }));

    act(() => {
      result.current.updatePagination({ page: 2, size: 20 });
    });

    expect(result.current.appliedFilters.page).toBe(2);
    expect(result.current.appliedFilters.size).toBe(20);
    expect(result.current.draftFilters.page).toBe(2);
    expect(result.current.draftFilters.size).toBe(20);
  });

  it('should handle null dates correctly', () => {
    const { result } = renderHook(() => useFlowFilters({
      flowFileTypes: [FlowFileType.RECEIPT],
    }));

    act(() => {
      result.current.handleDateFromChange(null);
      result.current.handleDateToChange(null);
    });

    expect(result.current.draftFilters.creationDateFrom).toBeUndefined();
    expect(result.current.draftFilters.creationDateTo).toBeUndefined();
  });

  it('should maintain all filters when applying new ones', () => {
    const { result } = renderHook(() => useFlowFilters({
      flowFileTypes: [FlowFileType.RECEIPT],
    }));

    act(() => {
      result.current.updateDraftFilters({ fileName: 'test.pdf' });
    });

    act(() => {
      result.current.updateDraftFilters({ status: FlowStatus.COMPLETED });
    });

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.appliedFilters).toEqual(
      expect.objectContaining({
        fileName: 'test.pdf',
        status: FlowStatus.COMPLETED,
        flowFileTypes: [FlowFileType.RECEIPT]
      })
    );
  });

  it('should handle date from changes correctly', () => {
    const { result } = renderHook(() => useFlowFilters({
      flowFileTypes: [FlowFileType.RECEIPT],
    }));
    const testDate = new Date('2024-01-01T12:00:00.000Z');

    act(() => {
      result.current.handleDateFromChange(testDate);
    });

    const dateFromValue = result.current.draftFilters.creationDateFrom;
    expect(new Date(dateFromValue!).getUTCHours()).toBe(23);
    expect(new Date(dateFromValue!).getUTCMinutes()).toBe(0);
    expect(new Date(dateFromValue!).getUTCSeconds()).toBe(0);
    expect(new Date(dateFromValue!).getUTCMilliseconds()).toBe(0);
  });

  it('should handle date to changes correctly', () => {
    const { result } = renderHook(() => useFlowFilters({
      flowFileTypes: [FlowFileType.RECEIPT],
    }));
    const testDate = new Date('2024-01-01T12:00:00.000Z');

    act(() => {
      result.current.handleDateToChange(testDate);
    });

    const dateToValue = result.current.draftFilters.creationDateTo;
    expect(new Date(dateToValue!).getUTCHours()).toBe(22);
    expect(new Date(dateToValue!).getUTCMinutes()).toBe(59);
    expect(new Date(dateToValue!).getUTCSeconds()).toBe(59);
    expect(new Date(dateToValue!).getUTCMilliseconds()).toBe(999);
  });
});
