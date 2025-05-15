import { renderHook } from '../__tests__/renderers';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebtPositionTypesByOrg } from './useDebtPositionTypesByOrg';
import utils from '../utils';
import { getDebtPositionTypesByOrganizationId } from '../api/debtPositionsTypes';
import { QueryObserverPendingResult } from '@tanstack/react-query';
import { DebtPositionType } from '../../generated/data-contracts';

const mockT = vi.fn((key: string) => key);

vi.mock('../api/debtPositionsTypes', () => ({
  getDebtPositionTypesByOrganizationId: vi.fn()
}));

vi.mock('../utils', () => ({
  default: {
    notify: {
      emit: vi.fn()
    }
  }
}));

type MockQueryType = QueryObserverPendingResult<Array<DebtPositionType>, Error>;

describe('useDebtPositionTypesByOrg', () => {
  const mockQueryResult = {
    data: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    error: null
  } as unknown as MockQueryType;

  beforeEach(() => {
    vi.clearAllMocks();
    mockT.mockClear();
  });

  it('should initialize with an empty options list', () => {
    vi.mocked(getDebtPositionTypesByOrganizationId).mockReturnValue(
      mockQueryResult
    );

    const { result } = renderHook(() =>
      useDebtPositionTypesByOrg({ organizationId: 1 })
    );

    expect(result.current.optionsMap).toEqual([]);
  });

  it('should set options correctly on successful response', () => {
    const mockData = [
      { description: 'Type B', debtPositionTypeId: 2 },
      { description: 'Type A', debtPositionTypeId: 1 }
    ];

    vi.mocked(getDebtPositionTypesByOrganizationId).mockReturnValue({
      ...mockQueryResult,
      data: mockData,
      isSuccess: true
    } as unknown as MockQueryType);

    const { result } = renderHook(() =>
      useDebtPositionTypesByOrg({ organizationId: 1 })
    );

    // Should be sorted alphabetically by description
    expect(result.current.optionsMap).toEqual([
      { label: 'Type A', value: 1 },
      { label: 'Type B', value: 2 }
    ]);
  });

  it('should handle empty or invalid response', () => {
    vi.mocked(getDebtPositionTypesByOrganizationId).mockReturnValue({
      ...mockQueryResult,
      data: [],
      isSuccess: true
    } as unknown as MockQueryType);

    const { result } = renderHook(() =>
      useDebtPositionTypesByOrg({ organizationId: 1 })
    );

    expect(result.current.optionsMap).toEqual([]);
  });

  it('should handle API error and show notification', () => {
    vi.mocked(getDebtPositionTypesByOrganizationId).mockReturnValue({
      ...mockQueryResult,
      isError: true,
      error: new Error('API error')
    } as unknown as MockQueryType);

    renderHook(() => useDebtPositionTypesByOrg({ organizationId: 1 }));

    expect(utils.notify.emit).toHaveBeenCalledWith(
      'errors.fetchDebtPositionsTypes',
      'error'
    );
  });

  it('should keep options empty while loading', () => {
    vi.mocked(getDebtPositionTypesByOrganizationId).mockReturnValue({
      ...mockQueryResult,
      isLoading: true
    });

    const { result } = renderHook(() =>
      useDebtPositionTypesByOrg({ organizationId: 1 })
    );

    expect(result.current.optionsMap).toEqual([]);
  });
});
