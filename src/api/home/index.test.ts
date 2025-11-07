import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../__tests__/renderers';
import utils from '../../utils';
import {
  useDashboardByIuf,
  useDashboardByIuv,
  useDashboardByFiscalCode
} from '.';
import { AxiosResponse } from 'axios';

vi.mock('../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getDashboardByIuv: vi.fn(),
        getDashboardByIuf: vi.fn(),
        getDashboardByFiscalCode: vi.fn()
      }
    }
  }
}));

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

describe('useDashboardByIuv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return Dashboard called with a orgid & IUV', async () => {
    const organizationId = 123;
    const IUV = '01000000020043462';

    const mockData = {
      hasInstallment: false,
      hasDebtPosition: false,
      hasReceipt: false,
      hasIuf: false,
      hasClassification: false
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getDashboardByIuv')
      .mockResolvedValue({ data: mockData } as AxiosResponse);

    const { result } = renderHook(() => useDashboardByIuv({ organizationId }));

    await result.current.mutateAsync(IUV);

    await waitFor(() => {
      expect(result.current.data).toBe(mockData);
    });
    expect(apiMock).toHaveBeenCalledWith(organizationId, { iuv: IUV });
  });
});

describe('useDashboardByFiscalCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return Dashboard called with a orgid & fiscalCode', async () => {
    const organizationId = 123;
    const FISCAL_CODE = 'RSSMRA80A01H501U';

    const mockData = {
      hasInstallment: true,
      installmentId: 33448,
      hasDebtPosition: true,
      debtPositionId: 30862,
      hasReceipt: true,
      receiptId: 5125
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getDashboardByFiscalCode')
      .mockResolvedValue({ data: mockData } as AxiosResponse);

    const { result } = renderHook(() =>
      useDashboardByFiscalCode({ organizationId })
    );

    await result.current.mutateAsync(FISCAL_CODE);

    await waitFor(() => {
      expect(result.current.data).toBe(mockData);
    });
    expect(apiMock).toHaveBeenCalledWith(organizationId, {
      fiscalCode: FISCAL_CODE
    });
  });
});

describe('useDashboardByIuf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return Dashboard called with a orgid & IUF', async () => {
    const organizationId = 123;
    const IUF = '1111';

    const mockData = {
      hasIuf: true,
      iuf: '1111',
      hasClassification: true,
      classificationId: 6610,
      hasTreasury: false
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getDashboardByIuf')
      .mockResolvedValue({ data: mockData } as AxiosResponse);

    const { result } = renderHook(() => useDashboardByIuf({ organizationId }));

    await result.current.mutateAsync(IUF);

    await waitFor(() => {
      expect(result.current.data).toBe(mockData);
    });
    expect(apiMock).toHaveBeenCalledWith(organizationId, { iuf: IUF });
  });
});
