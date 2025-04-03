import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';
import utils from '../utils';
import { getDebtPositionTypeDetail } from './debtPositionTypeDetail';

vi.mock('../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getDebtPositionTypeDetail: vi.fn()
      }
    }
  }
}));

describe('getDebtPositionTypeDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return debt position types', async () => {
    const mockData = {
      debtPositionTypeId: 1,
      code: 'code',
      description: 'description',
      organizationTypeDescription: 'organizationTypeDescription',
      macroAreaName: 'macroAreaName',
      serviceType: 'serviceType',
      collectionReason: 'collectionReason',
      taxonomyCode: 'taxonomyCode',
      flagAnonymousFiscalCode: true,
      flagMandatoryDueDate: true,
      flagNotifyIo: true,
      ioTemplateMessage: 'ioTemplateMessage'
    };

    (utils.apiClient.bff.getDebtPositionTypeDetail as Mock).mockResolvedValue({
      data: mockData
    });

    const { result } = renderHook(() =>
      getDebtPositionTypeDetail({ organizationId: 123, debtPositionTypeId: 3 })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(utils.apiClient.bff.getDebtPositionTypeDetail).toHaveBeenCalledWith(
      123,
      3
    );
  });
});
