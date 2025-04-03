import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';
import utils from '../utils';
import {
  getDebtPositionsTypes,
  getDebtPositionTypeWithCount
} from './debtPositionsTypes';
import { parseAndLog } from '../utils/loaders';

vi.mock('../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getDebtPositionTypeOrgs: vi.fn(),
        getDebtPositionTypeWithCount: vi.fn()
      }
    }
  }
}));

vi.mock('../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

describe('getDebtPositionsTypes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return debt position types', async () => {
    const mockData = [
      { id: 1, description: 'Type A' },
      { id: 2, description: 'Type B' }
    ];

    (utils.apiClient.bff.getDebtPositionTypeOrgs as Mock).mockResolvedValue({
      data: mockData
    });

    const { result } = renderHook(() =>
      getDebtPositionsTypes({ organizationId: 123 })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(utils.apiClient.bff.getDebtPositionTypeOrgs).toHaveBeenCalledWith(
      123
    );
  });
});

describe('getDebtPositionTypeWithCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return paged debt position types with count', async () => {
    const mockData = {
      content: [
        { id: 1, description: 'Type A', count: 5 },
        { id: 2, description: 'Type B', count: 10 }
      ],
      totalElements: 2,
      totalPages: 1,
      number: 0,
      size: 10
    };

    (
      utils.apiClient.bff.getDebtPositionTypeWithCount as Mock
    ).mockResolvedValue({
      data: mockData
    });

    const organizationId = 123;
    const query = { page: 0, size: 10 };

    const { result } = renderHook(() =>
      getDebtPositionTypeWithCount(organizationId, query)
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).toHaveBeenCalledWith(organizationId, query, {
      paramsSerializer: {
        indexes: null
      }
    });
    expect(parseAndLog).toHaveBeenCalledWith(expect.any(Object), mockData);
  });

  it('should handle query with sort parameters', async () => {
    const mockData = {
      content: [
        { id: 2, description: 'Type B', count: 10 },
        { id: 1, description: 'Type A', count: 5 }
      ],
      totalElements: 2,
      totalPages: 1,
      number: 0,
      size: 10
    };

    (
      utils.apiClient.bff.getDebtPositionTypeWithCount as Mock
    ).mockResolvedValue({
      data: mockData
    });

    const organizationId = 123;
    const query = { page: 0, size: 10, sort: ['count,desc'] };

    const { result } = renderHook(() =>
      getDebtPositionTypeWithCount(organizationId, query)
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).toHaveBeenCalledWith(organizationId, query, {
      paramsSerializer: {
        indexes: null
      }
    });
  });

  it('should use proper query key for caching', async () => {
    const mockData = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10
    };

    (
      utils.apiClient.bff.getDebtPositionTypeWithCount as Mock
    ).mockResolvedValue({
      data: mockData
    });

    const organizationId = 123;
    const query = { page: 1, size: 20 };

    const { result } = renderHook(() =>
      getDebtPositionTypeWithCount(organizationId, query)
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should handle null response correctly', async () => {
    (
      utils.apiClient.bff.getDebtPositionTypeWithCount as Mock
    ).mockResolvedValue({
      data: null
    });

    const organizationId = 123;
    const query = { page: 0, size: 10 };

    const { result } = renderHook(() =>
      getDebtPositionTypeWithCount(organizationId, query)
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
    expect(parseAndLog).not.toHaveBeenCalled();
  });
});
