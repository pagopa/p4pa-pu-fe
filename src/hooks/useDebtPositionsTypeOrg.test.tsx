import { renderHook } from '../__tests__/renderers';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebtPositionsTypeOrg } from './useDebtPositionsTypeOrg';
import { QueryObserverPendingResult } from '@tanstack/react-query';
import { DebtPositionTypeOrg } from '../../generated/apiClient';
import { getDebtPositionsTypes } from '../api/debtPositionsTypes';
import utils from '../utils';

const mockT = vi.fn((key: string) => key);

vi.mock('../api/debtPositionsTypes', () => ({
  getDebtPositionsTypes: vi.fn()
}));

vi.mock('../utils', () => ({
  default: {
    notify: {
      emit: vi.fn()
    }
  }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: {
      language: 'it',
      changeLanguage: vi.fn()
    }
  })
}));

type MockQueryType = QueryObserverPendingResult<
  Array<DebtPositionTypeOrg>,
  Error
>;

describe('useDebtPositionsTypeOrg', () => {
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

  afterEach(() => {
    vi.clearAllMocks();
    mockT.mockClear();
  });

  it('should initialize with an empty options list', () => {
    vi.mocked(getDebtPositionsTypes).mockReturnValue(mockQueryResult);

    const { result } = renderHook(() =>
      useDebtPositionsTypeOrg({ organizationId: 1 })
    );

    expect(result.current.optionsMap).toEqual([]);
  });

  it('should set options correctly on successful response with all option', () => {
    const mockData = [
      { description: 'Type A', debtPositionTypeOrgId: 1 },
      { description: 'Type B', debtPositionTypeOrgId: 2 }
    ];

    vi.mocked(getDebtPositionsTypes).mockReturnValue({
      ...mockQueryResult,
      data: mockData,
      isSuccess: true
    } as unknown as MockQueryType);

    const { result } = renderHook(() =>
      useDebtPositionsTypeOrg({ organizationId: 1 })
    );

    expect(result.current.optionsMap).toEqual([
      { label: 'commons.all', value: 0, flagMandatoryDueDate: false },
      { label: 'Type A', value: 1, flagMandatoryDueDate: undefined },
      { label: 'Type B', value: 2, flagMandatoryDueDate: undefined }
    ]);
  });

  it('should set options correctly on successful response without all option', () => {
    const mockData = [
      { description: 'Type A', debtPositionTypeOrgId: 1 },
      { description: 'Type B', debtPositionTypeOrgId: 2 }
    ];

    vi.mocked(getDebtPositionsTypes).mockReturnValue({
      ...mockQueryResult,
      data: mockData,
      isSuccess: true
    } as unknown as MockQueryType);

    const { result } = renderHook(() =>
      useDebtPositionsTypeOrg({ organizationId: 1, includeAllOption: false })
    );

    expect(result.current.optionsMap).toEqual([
      { label: 'Type A', value: 1, flagMandatoryDueDate: undefined },
      { label: 'Type B', value: 2, flagMandatoryDueDate: undefined }
    ]);
  });

  it('should handle empty or invalid response with all option', () => {
    vi.mocked(getDebtPositionsTypes).mockReturnValue({
      ...mockQueryResult,
      data: [],
      isSuccess: true
    } as unknown as MockQueryType);

    const { result } = renderHook(() =>
      useDebtPositionsTypeOrg({ organizationId: 1 })
    );

    expect(result.current.optionsMap).toEqual([
      { label: 'commons.all', value: 0, flagMandatoryDueDate: false }
    ]);
  });

  it('should handle empty or invalid response without all option', () => {
    vi.mocked(getDebtPositionsTypes).mockReturnValue({
      ...mockQueryResult,
      data: [],
      isSuccess: true
    } as unknown as MockQueryType);

    const { result } = renderHook(() =>
      useDebtPositionsTypeOrg({ organizationId: 1, includeAllOption: false })
    );

    expect(result.current.optionsMap).toEqual([]);
  });

  it('should handle API error and show notification', () => {
    vi.mocked(getDebtPositionsTypes).mockReturnValue({
      ...mockQueryResult,
      isError: true,
      error: new Error('API error')
    } as unknown as MockQueryType);

    renderHook(() => useDebtPositionsTypeOrg({ organizationId: 1 }));

    expect(mockT).toHaveBeenCalledWith('errors.fetchDebtPositionsTypes');
    expect(utils.notify.emit).toHaveBeenCalledWith(
      'errors.fetchDebtPositionsTypes',
      'error'
    );
  });
});
