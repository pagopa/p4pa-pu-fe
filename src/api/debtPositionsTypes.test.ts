import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';
import utils from '../utils';
import { getDebtPositionsTypes } from './debtPositionsTypes';

vi.mock('../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getDebtPositionTypeOrgs: vi.fn()
      }
    }
  }
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
