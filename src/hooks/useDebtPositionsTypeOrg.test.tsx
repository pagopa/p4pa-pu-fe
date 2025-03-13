import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebtPositionsTypeOrg } from './useDebtPositionsTypeOrg';
import debtPositions from '../api/debtPositions';
import { QueryObserverPendingResult } from '@tanstack/react-query';
import { DebtPositionTypeOrg } from '../../generated/apiClient';

vi.mock('../api/debtPositions', () => ({
  default: {
    getDebtPositionsTypes: vi.fn()
  }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

type MockQueryType = QueryObserverPendingResult<DebtPositionTypeOrg[], Error>;

describe('useDebtPositionsTypeOrg', () => {
  const mockQueryResult = {
    data: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    error: null,
    mutate: vi.fn()
  } as unknown as MockQueryType;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with an empty options list', () => {
    vi.mocked(debtPositions.getDebtPositionsTypes).mockReturnValue(mockQueryResult);

    const { result } = renderHook(() => useDebtPositionsTypeOrg({ organizationId: 1 }));

    expect(result.current.optionsMap).toEqual([]);
  });

  it('should set options correctly on successful response', () => {
    const mockData = [
      { description: 'Type A', debtPositionTypeOrgId: 1 },
      { description: 'Type B', debtPositionTypeOrgId: 2 }
    ];

    vi.mocked(debtPositions.getDebtPositionsTypes).mockReturnValue({
      ...mockQueryResult,
      data: mockData,
      isSuccess: true
    } as unknown as MockQueryType);

    const { result } = renderHook(() => useDebtPositionsTypeOrg({ organizationId: 1 }));

    expect(result.current.optionsMap).toEqual([
      { label: 'commons.all', value: 'TUTTI' },
      { label: 'Type A', value: 1 },
      { label: 'Type B', value: 2 }
    ]);
  });

  it('should handle empty or invalid response', () => {
    vi.mocked(debtPositions.getDebtPositionsTypes).mockReturnValue({
      ...mockQueryResult,
      data: [],
      isSuccess: true
    } as unknown as MockQueryType);

    const { result } = renderHook(() => useDebtPositionsTypeOrg({ organizationId: 1 }));

    expect(result.current.optionsMap).toEqual([{ label: 'commons.all', value: 'TUTTI' }]);
  });

  it('should handle API error', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(debtPositions.getDebtPositionsTypes).mockReturnValue({
      ...mockQueryResult,
      isError: true,
      error: new Error('API error')
    } as unknown as MockQueryType);

    renderHook(() => useDebtPositionsTypeOrg({ organizationId: 1 }));

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to fetch fe config',
      new Error('API error')
    );

    consoleErrorSpy.mockRestore();
  });
});
