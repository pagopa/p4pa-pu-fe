import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { useDateRange } from './useDateRange';
import { startOfDay, endOfDay, subMonths } from 'date-fns';

describe('useDateRange', () => {
  const today = new Date('2025-03-24T12:00:00Z');
  const oneMonthAgo = subMonths(today, 1);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(today);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with null date if prefilled is false', () => {
    const { result } = renderHook(() => useDateRange(0, false));
    expect(result.current.fromDate).toBeNull();
    expect(result.current.toDate).toBeNull();
    expect(result.current.isButtonDisabled).toBe(true);
  });

  it('should update fromDate and validate correctly', () => {
    const { result } = renderHook(() => useDateRange(0));
    const newFrom = new Date('2025-03-01');
    act(() => result.current.setFromDate(newFrom));
    expect(result.current.fromDate).toEqual(startOfDay(newFrom));
  });

  it('should update toDate and validate correctly', () => {
    const { result } = renderHook(() => useDateRange(0));
    const newTo = new Date('2025-03-10');
    act(() => result.current.setToDate(newTo));
    expect(result.current.toDate).toEqual(endOfDay(newTo));
  });

  it('should set toError if from > to', () => {
    const { result } = renderHook(() => useDateRange(0));
    act(() => result.current.setFromDate(new Date('2025-03-25')));
    expect(result.current.isButtonDisabled).toBe(true);
  });

  it('should handle null values', () => {
    const { result } = renderHook(() => useDateRange(0));
    act(() => {
      result.current.setFromDate(null);
      result.current.setToDate(null);
    });
    expect(result.current.fromDate).toBeNull();
    expect(result.current.toDate).toBeNull();
    expect(result.current.isButtonDisabled).toBe(true);
  });

  it('should reset to default dates and clear errors', () => {
    const { result } = renderHook(() => useDateRange(0));
    act(() => {
      result.current.setFromDate(new Date('2025-01-01'));
      result.current.setToDate(new Date('2025-01-10'));
      result.current.setFromError('invalidDate');
      result.current.setToError('invalidDate');
    });

    expect(result.current.isButtonDisabled).toBe(true);

    act(() => {
      result.current.resetDates();
    });

    expect(result.current.fromDate).toEqual(startOfDay(oneMonthAgo));
    expect(result.current.toDate).toEqual(endOfDay(today));
    expect(result.current.isButtonDisabled).toBe(false);
  });

  it('should keep separate state tab index', () => {
    const { result } = renderHook(() => useDateRange(0));
    const { result: result2 } = renderHook(() => useDateRange(1));
    act(() => {
      result.current.setFromDate(new Date('2025-02-01'));
    });
    act(() => {
      result2.current.setFromDate(new Date('2025-01-01'));
    });

    expect(result.current.fromDate).toEqual(startOfDay(new Date('2025-02-01')));
    expect(result2.current.fromDate).toEqual(
      startOfDay(new Date('2025-01-01'))
    );
  });

  it('should validate correctly with setFromDateToday and setToDateToday using valid dates', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const { result } = renderHook(() => useDateRange(0));

    act(() => {
      result.current.setFromDateToday(yesterday);
      result.current.setToDateToday(today);
    });

    expect(result.current.fromDate).toEqual(endOfDay(yesterday));
    expect(result.current.toDate).toEqual(endOfDay(today));
    expect(result.current.isButtonDisabled).toBe(false);
  });

  it('should set error if fromDateToday is after toDate', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const { result } = renderHook(() => useDateRange(0));

    act(() => {
      result.current.setToDateToday(today);
      result.current.setFromDateToday(tomorrow);
    });

    expect(result.current.fromDate).toEqual(endOfDay(tomorrow));
    expect(result.current.isButtonDisabled).toBe(true);
  });
  it('should set error if toDateToday is after today', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const { result } = renderHook(() => useDateRange(0));

    act(() => {
      result.current.setFromDateToday(today);
      result.current.setToDateToday(tomorrow);
    });

    expect(result.current.toDate).toEqual(endOfDay(tomorrow));
    expect(result.current.isButtonDisabled).toBe(true);
  });
});
