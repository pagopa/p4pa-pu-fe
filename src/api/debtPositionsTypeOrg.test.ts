import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, waitFor, act } from '../__tests__/renderers';
import utils from '../utils';
import {
  getDebtPositionTypeOrgs,
  createDebtPositionTypeOrg,
  CreateDebtPositionTypeOrg
} from './debtPositionsTypeOrg';
import { parseAndLog } from '../utils/loaders';

vi.mock('../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getDebtPositionTypeOrgs: vi.fn(),
        createDebtPositionTypeOrg: vi.fn()
      }
    }
  }
}));

vi.mock('../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

describe('getDebtPositionTypeOrgs', () => {
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
      getDebtPositionTypeOrgs({ organizationId: 123 })
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

describe('createDebtPositionTypeOrg', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call API and parseAndLog, then return data on success', async () => {
    const mockInput = {
      organizationId: 123,
      data: { name: 'Test Type', code: 'TST' }
    };
    const mockResponse = { id: 1, name: 'Test Type', code: 'TST' };

    (utils.apiClient.bff.createDebtPositionTypeOrg as Mock).mockResolvedValue({
      data: mockResponse
    });

    const { result } = renderHook(() => createDebtPositionTypeOrg());

    await act(async () => {
      result.current.mutate(mockInput as unknown as CreateDebtPositionTypeOrg);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(utils.apiClient.bff.createDebtPositionTypeOrg).toHaveBeenCalledWith(
      mockInput.organizationId,
      mockInput.data
    );
    expect(parseAndLog).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle errors from the API', async () => {
    const mockInput = {
      organizationId: 123,
      data: { name: 'Test Type', code: 'TST' }
    };
    const error = new Error('API error');

    (utils.apiClient.bff.createDebtPositionTypeOrg as Mock).mockRejectedValue(
      error
    );

    const { result } = renderHook(() => createDebtPositionTypeOrg());

    await act(async () => {
      result.current.mutate(mockInput as unknown as CreateDebtPositionTypeOrg);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });
});
