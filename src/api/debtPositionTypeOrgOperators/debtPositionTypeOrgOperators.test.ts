import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../__tests__/renderers';
import utils from '../../utils';
import { getDebtPositionTypeOrgOperators } from '.';
import type { PagedDebtPositionTypeOrgOperatorDTO } from '../../../generated/data-contracts';
import { AxiosResponse } from 'axios';
import { DebtPositionTypeOrgOperatorFilteredRequest } from './mappings';

vi.mock('../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getDebtPositionTypeOrgOperators: vi.fn()
      }
    }
  }
}));

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

describe('getDebtPositionTypeOrgOperators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return operators with default parameters', async () => {
    const mockData: PagedDebtPositionTypeOrgOperatorDTO = {
      content: [
        {
          operatorId: 'op1',
          firstName: 'John',
          lastName: 'Doe',
          mappedExternalUserId: 'ext1',
          enabled: true
        }
      ],
      totalPages: 1,
      number: 0,
      size: 10,
      totalElements: 1
    };

    vi.spyOn(
      utils.apiClient.bff,
      'getDebtPositionTypeOrgOperators'
    ).mockResolvedValue({ data: mockData } as AxiosResponse);

    const { result } = renderHook(() => getDebtPositionTypeOrgOperators(3));

    const request: DebtPositionTypeOrgOperatorFilteredRequest = {
      filters: {},
      pagination: { page: 0, size: 10 },
      sort: []
    };

    const data = await result.current.mutateAsync(request);

    expect(data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeOrgOperators
    ).toHaveBeenCalledWith(3, {
      page: 0,
      size: 10
    });
  });

  it('should handle sort parameters correctly', async () => {
    const mockData: PagedDebtPositionTypeOrgOperatorDTO = {
      content: [],
      totalPages: 0,
      number: 0,
      size: 10,
      totalElements: 0
    };

    vi.spyOn(
      utils.apiClient.bff,
      'getDebtPositionTypeOrgOperators'
    ).mockResolvedValue({ data: mockData } as AxiosResponse);

    const { result } = renderHook(() => getDebtPositionTypeOrgOperators(3));

    const request: DebtPositionTypeOrgOperatorFilteredRequest = {
      filters: {},
      pagination: { page: 0, size: 10 },
      sort: ['firstName,asc', 'lastName,desc']
    };

    const data = await result.current.mutateAsync(request);

    expect(data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeOrgOperators
    ).toHaveBeenCalledWith(3, {
      page: 0,
      size: 10,
      sort: ['firstName,asc', 'lastName,desc']
    });
  });

  it('should handle debtPositionTypeOrgId parameter', async () => {
    const mockData: PagedDebtPositionTypeOrgOperatorDTO = {
      content: [
        {
          operatorId: 'op2',
          firstName: 'Jane',
          lastName: 'Smith',
          mappedExternalUserId: 'ext2',
          enabled: false
        }
      ],
      totalPages: 1,
      number: 0,
      size: 10,
      totalElements: 1
    };

    vi.spyOn(
      utils.apiClient.bff,
      'getDebtPositionTypeOrgOperators'
    ).mockResolvedValue({ data: mockData } as AxiosResponse);

    const { result } = renderHook(() => getDebtPositionTypeOrgOperators(3));

    const request: DebtPositionTypeOrgOperatorFilteredRequest = {
      filters: { debtPositionTypeOrgId: 123 },
      pagination: { page: 0, size: 10 },
      sort: []
    };

    const data = await result.current.mutateAsync(request);

    expect(data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeOrgOperators
    ).toHaveBeenCalledWith(3, {
      debtPositionTypeOrgId: 123,
      page: 0,
      size: 10
    });
  });

  it('should handle errors correctly', async () => {
    const error = new Error('API error');
    vi.spyOn(
      utils.apiClient.bff,
      'getDebtPositionTypeOrgOperators'
    ).mockRejectedValue(error);

    const { result } = renderHook(() => getDebtPositionTypeOrgOperators(3));

    const request: DebtPositionTypeOrgOperatorFilteredRequest = {
      filters: {},
      pagination: { page: 0, size: 10 },
      sort: []
    };

    await result.current.mutateAsync(request).catch((err) => {
      expect(err).toBe(error);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(error);
    });
  });

  it('should handle different pagination parameters', async () => {
    const mockData: PagedDebtPositionTypeOrgOperatorDTO = {
      content: [],
      totalPages: 5,
      number: 2,
      size: 25,
      totalElements: 100
    };

    vi.spyOn(
      utils.apiClient.bff,
      'getDebtPositionTypeOrgOperators'
    ).mockResolvedValue({ data: mockData } as AxiosResponse);

    const { result } = renderHook(() => getDebtPositionTypeOrgOperators(3));

    const request: DebtPositionTypeOrgOperatorFilteredRequest = {
      filters: { debtPositionTypeOrgId: 456 },
      pagination: { page: 2, size: 25 },
      sort: ['enabled,desc', 'firstName,asc']
    };

    const data = await result.current.mutateAsync(request);

    expect(data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeOrgOperators
    ).toHaveBeenCalledWith(3, {
      debtPositionTypeOrgId: 456,
      page: 2,
      size: 25,
      sort: ['enabled,desc', 'firstName,asc']
    });
  });
});
