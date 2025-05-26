import utils from '../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import {
  debtPositionDetailDTOSchema,
  debtPositionViewSchema,
  installmentDTOSchema
} from '../../generated/zod-schema';
import { createMock } from 'zodock';
import debtPositions, { DebtPositionViewQuery } from './debtPositions';
import { renderHook, waitFor } from '../__tests__/renderers';
import {
  DebtPositionStatus,
  DebtPositionOrigin
} from '../../generated/apiClient';

vi.mock('../utils', () => {
  return {
    default: {
      apiClient: {
        bff: {
          getDebtPositionViews: vi.fn(),
          getInstallments: vi.fn(),
          getInstallmentDetail: vi.fn(),
          getDebtPositionDetail: vi.fn(),
          deleteDebtPositionType: vi.fn(),
          createDebtPosition: vi.fn()
        }
      }
    }
  };
});

describe('getDebtPositionViews', () => {
  it('returns data correctly', async () => {
    const dataMock = createMock(debtPositionViewSchema);
    const params = { organizationId: 10 };
    const query: DebtPositionViewQuery = {
      status: DebtPositionStatus.PAID,
      creationDateFrom: '',
      creationDateTo: '',
      fiscalCode: '',
      debtPositionTypeOrgId: undefined,
      page: undefined,
      size: undefined,
      sort: undefined
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getDebtPositionViews')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      debtPositions.getDebtPositionViews(params)
    );

    result.current.mutate(query);

    await waitFor(() => {
      expect(result.current.data).toEqual(dataMock);
    });

    expect(apiMock).toHaveBeenCalledWith(params.organizationId, query, {
      paramsSerializer: {
        indexes: null
      }
    });
  });

  it('handles errors correctly', async () => {
    const params = { organizationId: 10 };
    const query: DebtPositionViewQuery = {
      status: DebtPositionStatus.PAID,
      creationDateFrom: '',
      creationDateTo: '',
      fiscalCode: '',
      debtPositionTypeOrgId: undefined,
      page: undefined,
      size: undefined,
      sort: undefined
    };

    const error = new Error('API Error');
    vi.spyOn(utils.apiClient.bff, 'getDebtPositionViews').mockRejectedValue(
      error
    );

    const { result } = renderHook(() =>
      debtPositions.getDebtPositionViews(params)
    );

    result.current.mutate(query);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('getInstallments', () => {
  it('returns data correctly', async () => {
    const dataMock = createMock(installmentDTOSchema);
    const params = { organizationId: 101 };
    const query = {
      debtPositionId: 555,
      dueDateFrom: '',
      dueDateTo: '',
      iuv: '',
      fiscalCode: '',
      debtPositionTypeOrgId: undefined,
      page: undefined,
      size: undefined,
      sort: undefined
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getInstallments')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => debtPositions.getInstallments(params));

    result.current.mutate(query);

    await waitFor(() => {
      expect(result.current.data).toEqual(dataMock);
    });

    expect(apiMock).toHaveBeenCalledWith(params.organizationId, query, {
      paramsSerializer: {
        indexes: null
      }
    });
  });

  it('handles errors correctly', async () => {
    const params = { organizationId: 101 };
    const query = {
      debtPositionId: 555,
      dueDateFrom: '',
      dueDateTo: '',
      iuv: '',
      fiscalCode: '',
      debtPositionTypeOrgId: undefined,
      page: undefined,
      size: undefined,
      sort: undefined
    };

    const error = new Error('API Error');
    vi.spyOn(utils.apiClient.bff, 'getInstallments').mockRejectedValue(error);

    const { result } = renderHook(() => debtPositions.getInstallments(params));

    result.current.mutate(query);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('getInstallmentDetail', () => {
  it('returns data correctly', async () => {
    const dataMock = {
      installmentId: 123,
      status: 'PAID',
      iuv: '123456789',
      amountCents: 5000,
      dueDate: '2025-03-20',
      debtor: {
        entityType: 'F',
        fiscalCode: 'ABCDEF12G34H567I',
        fullName: 'Test User'
      },
      debtPositionTypeOrgDescription: 'Test Debt Type',
      debtPositionDescription: 'Test Description',
      debtPositionId: 456
    };
    const params = { organizationId: 34, installmentId: 22 };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getInstallmentDetail')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      debtPositions.getInstallmentDetail(
        params.organizationId,
        params.installmentId
      )
    );

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        params.organizationId,
        params.installmentId
      );
      expect(result.current.data).toEqual(dataMock);
    });
  });

  it('does not run query when parameters are missing', async () => {
    const apiMock = vi.spyOn(utils.apiClient.bff, 'getInstallmentDetail');

    renderHook(() => debtPositions.getInstallmentDetail(0, 0));

    expect(apiMock).not.toHaveBeenCalled();
  });

  describe('getDebtPositionDetail', () => {
    it('returns data correctly', async () => {
      const dataMock = createMock(debtPositionDetailDTOSchema);
      const organizationId = 42;
      const debtPositionId = 123;

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getDebtPositionDetail')
        .mockResolvedValue({ data: dataMock } as AxiosResponse);

      const { result } = renderHook(() =>
        debtPositions.getDebtPositionDetail(organizationId, debtPositionId)
      );

      await waitFor(() => {
        expect(apiMock).toHaveBeenCalledWith(organizationId, debtPositionId);
        expect(result.current.data).toEqual(dataMock);
      });

      expect(apiMock).toHaveBeenCalledWith(organizationId, debtPositionId);
    });

    it('does not run query when parameters are missing', async () => {
      const apiMock = vi.spyOn(utils.apiClient.bff, 'getDebtPositionDetail');

      renderHook(() => debtPositions.getDebtPositionDetail(0, 0));

      expect(apiMock).not.toHaveBeenCalled();
    });
  });
});

describe('deleteDebtPositionType', () => {
  it('calls the API correctly', async () => {
    const debtPositionTypeId = 123;

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'deleteDebtPositionType')
      .mockResolvedValue({ data: {} } as AxiosResponse);

    const { result } = renderHook(() =>
      debtPositions.deleteDebtPositionType(debtPositionTypeId)
    );

    result.current.mutate();

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(debtPositionTypeId);
    });
  });

  it('handles errors correctly', async () => {
    const onError = vi.fn();
    const debtPositionTypeId = 123;

    vi.spyOn(
      utils.apiClient.bff,
      'deleteDebtPositionType'
    ).mockImplementationOnce(() => Promise.reject('API Error'));

    const { result } = renderHook(() =>
      debtPositions.deleteDebtPositionType(debtPositionTypeId)
    );

    result.current.mutate(undefined, { onError });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});

describe('createDebtPosition', () => {
  it('creates a debt position successfully', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const mockDebtPosition = {
      ...createMock(debtPositionDetailDTOSchema),
      debtPositionOrigin: DebtPositionOrigin.ORDINARY,
      organizationId: 123,
      debtPositionTypeOrgId: 456,
      flagPuPagoPaPayment: true
    };
    const paymentObject = 'test-payment';

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'createDebtPosition')
      .mockResolvedValue({ data: mockDebtPosition } as AxiosResponse);

    const { result } = renderHook(() =>
      debtPositions.createDebtPosition(onSuccess, onError)
    );

    result.current.mutate({ body: mockDebtPosition, paymentObject });

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(mockDebtPosition);
      expect(onSuccess).toHaveBeenCalledWith(mockDebtPosition, paymentObject);
    });
  });

  it('handles errors correctly', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const mockDebtPosition = {
      ...createMock(debtPositionDetailDTOSchema),
      debtPositionOrigin: DebtPositionOrigin.ORDINARY,
      organizationId: 123,
      debtPositionTypeOrgId: 456,
      flagPuPagoPaPayment: true
    };
    const error = new Error('API Error');

    vi.spyOn(utils.apiClient.bff, 'createDebtPosition').mockRejectedValue(
      error
    );

    const { result } = renderHook(() =>
      debtPositions.createDebtPosition(onSuccess, onError)
    );

    result.current.mutate({ body: mockDebtPosition });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });
});
