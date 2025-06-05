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
import {
  DebtPositionRegistry,
  ManageDebtPositionDTO,
  ActionEnum,
  EntityTypeEnum,
  InstallmentRegistry,
  PaymentEventType
} from '../../generated/data-contracts';

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
          deleteDebtPositionTypeOrg: vi.fn(),
          deleteDebtPosition: vi.fn(),
          createDebtPosition: vi.fn(),
          manageDebtPositionInstallments: vi.fn(),
          getPaymentNotice: vi.fn(),
          getUnpaidPaymentNoticeZip: vi.fn(),
          getDebtPositionRegistries: vi.fn(),
          getInstallmentRegistries: vi.fn()
        }
      },
      notify: {
        emit: vi.fn()
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

  describe('getDebtPositionRegistriesMutation', () => {
    it('returns registries data correctly', async () => {
      const mockRegistriesData: Array<DebtPositionRegistry> = [
        {
          eventDateTime: '2025-01-15T10:30:00Z',
          eventType: PaymentEventType.DP_CREATED,
          eventDescription: 'Debt position created',
          organizationId: 123,
          debtPositionId: 456
        },
        {
          eventDateTime: '2025-01-16T14:45:00Z',
          eventType: PaymentEventType.DPI_REPORTED,
          eventDescription: 'Installment reported',
          organizationId: 123,
          debtPositionId: 456
        }
      ];

      const organizationId = 123;
      const debtPositionId = 456;

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getDebtPositionRegistries')
        .mockResolvedValue({ data: mockRegistriesData } as AxiosResponse);

      const { result } = renderHook(() =>
        debtPositions.getDebtPositionRegistriesMutation()
      );

      result.current.mutate({ organizationId, debtPositionId });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockRegistriesData);
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiMock).toHaveBeenCalledWith(organizationId, debtPositionId);
    });

    it('handles empty registries array correctly', async () => {
      const mockEmptyData: Array<DebtPositionRegistry> = [];
      const organizationId = 123;
      const debtPositionId = 456;

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getDebtPositionRegistries')
        .mockResolvedValue({ data: mockEmptyData } as AxiosResponse);

      const { result } = renderHook(() =>
        debtPositions.getDebtPositionRegistriesMutation()
      );

      result.current.mutate({ organizationId, debtPositionId });

      await waitFor(() => {
        expect(result.current.data).toEqual([]);
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiMock).toHaveBeenCalledWith(organizationId, debtPositionId);
    });

    it('handles null/undefined registries data gracefully', async () => {
      const organizationId = 123;
      const debtPositionId = 456;

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getDebtPositionRegistries')
        .mockResolvedValue({ data: null } as AxiosResponse);

      const { result } = renderHook(() =>
        debtPositions.getDebtPositionRegistriesMutation()
      );

      result.current.mutate({ organizationId, debtPositionId });

      await waitFor(() => {
        expect(result.current.data).toEqual([]);
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiMock).toHaveBeenCalledWith(organizationId, debtPositionId);
    });

    it('handles API errors correctly', async () => {
      const organizationId = 123;
      const debtPositionId = 456;
      const error = new Error('API Error: Failed to fetch registries');

      vi.spyOn(
        utils.apiClient.bff,
        'getDebtPositionRegistries'
      ).mockRejectedValue(error);

      const { result } = renderHook(() =>
        debtPositions.getDebtPositionRegistriesMutation()
      );

      result.current.mutate({ organizationId, debtPositionId });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(error);
      });
    });

    it('processes multiple registries with different event types', async () => {
      const mockComplexRegistriesData: Array<DebtPositionRegistry> = [
        {
          eventDateTime: '2025-01-15T10:30:00Z',
          eventType: PaymentEventType.DP_CREATED,
          eventDescription: 'Debt position created'
        },
        {
          eventDateTime: '2025-01-16T14:45:00Z',
          eventType: PaymentEventType.DPI_REPORTED,
          eventDescription: 'Installment reported'
        },
        {
          eventDateTime: '2025-01-17T09:15:00Z',
          eventType: PaymentEventType.RT_RECEIVED,
          eventDescription: 'Payment receipt received'
        }
      ];

      const organizationId = 999;
      const debtPositionId = 888;

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getDebtPositionRegistries')
        .mockResolvedValue({
          data: mockComplexRegistriesData
        } as AxiosResponse);

      const { result } = renderHook(() =>
        debtPositions.getDebtPositionRegistriesMutation()
      );

      result.current.mutate({ organizationId, debtPositionId });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockComplexRegistriesData);
        expect(result.current.data).toHaveLength(3);
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiMock).toHaveBeenCalledWith(organizationId, debtPositionId);
    });
  });

  describe('getInstallmentRegistriesMutation', () => {
    it('returns installment registries data correctly', async () => {
      const mockInstallmentRegistriesData: Array<InstallmentRegistry> = [
        {
          eventDateTime: '2025-05-16T10:45:30.987654Z',
          eventType: PaymentEventType.DPI_ADDED,
          eventDescription: 'Aggiunta prima rata di pagamento',
          organizationId: 3,
          debtPositionId: 1536
        },
        {
          eventDateTime: '2025-05-17T14:22:45.567890Z',
          eventType: PaymentEventType.IO_NOTIFIED,
          eventDescription: 'Notifica inviata tramite IO app',
          organizationId: 3,
          debtPositionId: 1536
        }
      ];

      const organizationId = 3;
      const debtPositionId = 1536;

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getInstallmentRegistries')
        .mockResolvedValue({
          data: mockInstallmentRegistriesData
        } as AxiosResponse);

      const { result } = renderHook(() =>
        debtPositions.getInstallmentRegistriesMutation()
      );

      result.current.mutate({ organizationId, debtPositionId });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockInstallmentRegistriesData);
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiMock).toHaveBeenCalledWith(organizationId, debtPositionId);
    });

    it('handles empty installment registries array correctly', async () => {
      const mockEmptyData: Array<InstallmentRegistry> = [];
      const organizationId = 3;
      const debtPositionId = 1536;

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getInstallmentRegistries')
        .mockResolvedValue({ data: mockEmptyData } as AxiosResponse);

      const { result } = renderHook(() =>
        debtPositions.getInstallmentRegistriesMutation()
      );

      result.current.mutate({ organizationId, debtPositionId });

      await waitFor(() => {
        expect(result.current.data).toEqual([]);
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiMock).toHaveBeenCalledWith(organizationId, debtPositionId);
    });

    it('handles null/undefined installment registries data gracefully', async () => {
      const organizationId = 3;
      const debtPositionId = 1536;

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getInstallmentRegistries')
        .mockResolvedValue({ data: null } as AxiosResponse);

      const { result } = renderHook(() =>
        debtPositions.getInstallmentRegistriesMutation()
      );

      result.current.mutate({ organizationId, debtPositionId });

      await waitFor(() => {
        expect(result.current.data).toEqual([]);
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiMock).toHaveBeenCalledWith(organizationId, debtPositionId);
    });

    it('handles API errors correctly for installment registries', async () => {
      const organizationId = 3;
      const debtPositionId = 1536;
      const error = new Error(
        'API Error: Failed to fetch installment registries'
      );

      vi.spyOn(
        utils.apiClient.bff,
        'getInstallmentRegistries'
      ).mockRejectedValue(error);

      const { result } = renderHook(() =>
        debtPositions.getInstallmentRegistriesMutation()
      );

      result.current.mutate({ organizationId, debtPositionId });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(error);
      });
    });

    it('processes multiple installment registries with different event types', async () => {
      const mockComplexInstallmentRegistriesData: Array<InstallmentRegistry> = [
        {
          eventDateTime: '2025-05-16T10:45:30.987654Z',
          eventType: PaymentEventType.DPI_ADDED,
          eventDescription: 'Aggiunta prima rata di pagamento'
        },
        {
          eventDateTime: '2025-05-20T11:47:38.345678Z',
          eventType: PaymentEventType.DPI_UPDATED,
          eventDescription: 'Modifica scadenza rata di pagamento'
        },
        {
          eventDateTime: '2025-05-22T15:28:17.789012Z',
          eventType: PaymentEventType.RT_RECEIVED,
          eventDescription: 'Ricevuta telematica acquisita dal sistema'
        },
        {
          eventDateTime: '2025-05-26T19:33:41.654987Z',
          eventType: PaymentEventType.DPI_EXPIRED,
          eventDescription: 'Rata scaduta senza pagamento'
        },
        {
          eventDateTime: '2025-05-27T14:07:26.321654Z',
          eventType: PaymentEventType.DPI_CANCELLED,
          eventDescription: 'Cancellazione rata per storno operazione'
        }
      ];

      const organizationId = 3;
      const debtPositionId = 1536;

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getInstallmentRegistries')
        .mockResolvedValue({
          data: mockComplexInstallmentRegistriesData
        } as AxiosResponse);

      const { result } = renderHook(() =>
        debtPositions.getInstallmentRegistriesMutation()
      );

      result.current.mutate({ organizationId, debtPositionId });

      await waitFor(() => {
        expect(result.current.data).toEqual(
          mockComplexInstallmentRegistriesData
        );
        expect(result.current.data).toHaveLength(5);
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiMock).toHaveBeenCalledWith(organizationId, debtPositionId);
    });

    it('handles installment-specific event types correctly', async () => {
      const mockInstallmentSpecificData: Array<InstallmentRegistry> = [
        {
          eventDateTime: '2025-05-16T10:45:30.987654Z',
          eventType: PaymentEventType.DPI_ADDED,
          eventDescription: 'Aggiunta rata di pagamento',
          organizationId: 3,
          debtPositionId: 1536
        },
        {
          eventDateTime: '2025-05-17T14:22:45.567890Z',
          eventType: PaymentEventType.IO_NOTIFIED,
          eventDescription: 'Notifica IO inviata per la rata',
          organizationId: 3,
          debtPositionId: 1536
        },
        {
          eventDateTime: '2025-05-18T09:15:20.234567Z',
          eventType: PaymentEventType.SEND_NOTIFICATION_CREATED,
          eventDescription: 'Creata richiesta di invio notifica per rata',
          organizationId: 3,
          debtPositionId: 1536
        }
      ];

      const organizationId = 3;
      const debtPositionId = 1536;

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getInstallmentRegistries')
        .mockResolvedValue({
          data: mockInstallmentSpecificData
        } as AxiosResponse);

      const { result } = renderHook(() =>
        debtPositions.getInstallmentRegistriesMutation()
      );

      result.current.mutate({ organizationId, debtPositionId });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockInstallmentSpecificData);
        expect(result.current.isSuccess).toBe(true);
      });

      const eventTypes =
        result.current.data?.map((registry) => registry.eventType) || [];
      expect(eventTypes).toContain(PaymentEventType.DPI_ADDED);
      expect(eventTypes).toContain(PaymentEventType.IO_NOTIFIED);
      expect(eventTypes).toContain(PaymentEventType.SEND_NOTIFICATION_CREATED);

      expect(apiMock).toHaveBeenCalledWith(organizationId, debtPositionId);
    });
  });
});

describe('deleteDebtPositionTypeOrgs', () => {
  it('calls the API correctly', async () => {
    const organizationId = 123;
    const debtPositionTypeOrgId = 456;

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'deleteDebtPositionTypeOrg')
      .mockResolvedValue({ data: {} } as AxiosResponse);

    const { result } = renderHook(() =>
      debtPositions.deleteDebtPositionTypeOrgs(
        organizationId,
        debtPositionTypeOrgId
      )
    );

    result.current.mutate();

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        organizationId,
        debtPositionTypeOrgId
      );
    });
  });

  it('handles errors correctly', async () => {
    const onError = vi.fn();
    const organizationId = 123;
    const debtPositionTypeOrgId = 456;

    vi.spyOn(
      utils.apiClient.bff,
      'deleteDebtPositionTypeOrg'
    ).mockImplementationOnce(() => Promise.reject('API Error'));

    const { result } = renderHook(() =>
      debtPositions.deleteDebtPositionTypeOrgs(
        organizationId,
        debtPositionTypeOrgId
      )
    );

    result.current.mutate(undefined, { onError });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});

describe('deleteDebtPosition', () => {
  it('calls the API correctly with success callback', async () => {
    const organizationId = 123;
    const debtPositionId = 456;
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'deleteDebtPosition')
      .mockResolvedValue({ data: {} } as AxiosResponse);

    const { result } = renderHook(() =>
      debtPositions.deleteDebtPosition(
        organizationId,
        debtPositionId,
        onSuccess,
        onError
      )
    );

    result.current.mutate();

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(organizationId, debtPositionId);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('handles errors correctly with error callback', async () => {
    const organizationId = 123;
    const debtPositionId = 456;
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const error = new Error('API Error');

    vi.spyOn(utils.apiClient.bff, 'deleteDebtPosition').mockRejectedValue(
      error
    );

    const { result } = renderHook(() =>
      debtPositions.deleteDebtPosition(
        organizationId,
        debtPositionId,
        onSuccess,
        onError
      )
    );

    result.current.mutate();

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error, undefined, undefined);
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });
});

describe('manageDebtPositionInstallments', () => {
  it('manages installments successfully with publish flag', async () => {
    const mockResponse = createMock(debtPositionDetailDTOSchema);
    const params = {
      organizationId: 123,
      debtPositionId: 456,
      body: {
        paymentOptionId: 1001,
        installments: [
          {
            action: ActionEnum.I,
            installment: {
              installmentId: 1,
              amountCents: 10000,
              dueDate: '2025-12-31',
              remittanceInformation: 'Test payment',
              debtor: {
                entityType: EntityTypeEnum.F,
                fiscalCode: 'ABCDEF12G34H567I',
                fullName: 'Test User'
              }
            }
          }
        ]
      } as ManageDebtPositionDTO,
      publish: true
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'manageDebtPositionInstallments')
      .mockResolvedValue({ data: mockResponse } as AxiosResponse);

    const { result } = renderHook(() =>
      debtPositions.manageDebtPositionInstallments()
    );

    result.current.mutate(params);

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        params.organizationId,
        params.debtPositionId,
        params.body,
        { publish: params.publish }
      );
    });
  });

  it('manages installments successfully without publish flag', async () => {
    const mockResponse = createMock(debtPositionDetailDTOSchema);
    const params = {
      organizationId: 123,
      debtPositionId: 456,
      body: {
        paymentOptionId: 1001,
        installments: [
          {
            action: ActionEnum.M,
            installment: {
              installmentId: 1,
              amountCents: 10000,
              dueDate: '2025-12-31',
              remittanceInformation: 'Test payment',
              debtor: {
                entityType: EntityTypeEnum.F,
                fiscalCode: 'ABCDEF12G34H567I',
                fullName: 'Test User'
              }
            }
          }
        ]
      } as ManageDebtPositionDTO
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'manageDebtPositionInstallments')
      .mockResolvedValue({ data: mockResponse } as AxiosResponse);

    const { result } = renderHook(() =>
      debtPositions.manageDebtPositionInstallments()
    );

    result.current.mutate(params);

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        params.organizationId,
        params.debtPositionId,
        params.body,
        undefined
      );
    });
  });

  it('handles errors correctly', async () => {
    const error = new Error('API Error');
    const params = {
      organizationId: 123,
      debtPositionId: 456,
      body: {
        paymentOptionId: 1001,
        installments: []
      } as ManageDebtPositionDTO
    };

    vi.spyOn(
      utils.apiClient.bff,
      'manageDebtPositionInstallments'
    ).mockRejectedValue(error);

    const { result } = renderHook(() =>
      debtPositions.manageDebtPositionInstallments()
    );

    result.current.mutate(params);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('getPaymentNoticeFile', () => {
  it('downloads payment notice file successfully with custom filename', async () => {
    const organizationId = 123;
    const debtPositionId = 456;
    const iuv = '123456789012345678';
    const mockBlob = new Blob(['mock pdf content'], {
      type: 'application/pdf'
    });
    const expectedFileName = 'avviso_123456789012345678.pdf';

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPaymentNotice')
      .mockResolvedValue({
        data: mockBlob,
        headers: {
          'content-disposition': `attachment; filename="${expectedFileName}"`
        },
        status: 200,
        statusText: 'OK',
        config: { headers: {} }
      } as unknown as AxiosResponse);

    const { result } = renderHook(() =>
      debtPositions.getPaymentNoticeFile(organizationId, debtPositionId, iuv)
    );

    result.current.mutate();

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        organizationId,
        debtPositionId,
        { iuv },
        { format: 'blob' }
      );
      expect(result.current.data).toEqual({
        data: mockBlob,
        fileName: expectedFileName
      });
    });
  });

  it('downloads payment notice file with default filename when header is missing', async () => {
    const organizationId = 123;
    const debtPositionId = 456;
    const iuv = '123456789012345678';
    const mockBlob = new Blob(['mock pdf content'], {
      type: 'application/pdf'
    });

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPaymentNotice')
      .mockResolvedValue({
        data: mockBlob,
        headers: {},
        status: 200,
        statusText: 'OK',
        config: { headers: {} }
      } as unknown as AxiosResponse);

    const { result } = renderHook(() =>
      debtPositions.getPaymentNoticeFile(organizationId, debtPositionId, iuv)
    );

    result.current.mutate();

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        organizationId,
        debtPositionId,
        { iuv },
        { format: 'blob' }
      );
      expect(result.current.data).toEqual({
        data: mockBlob,
        fileName: `notice-${iuv}.pdf`
      });
    });
  });

  it('handles API errors correctly', async () => {
    const organizationId = 123;
    const debtPositionId = 456;
    const iuv = '123456789012345678';
    const error = new Error('API Error');

    vi.spyOn(utils.apiClient.bff, 'getPaymentNotice').mockRejectedValue(error);

    const { result } = renderHook(() =>
      debtPositions.getPaymentNoticeFile(organizationId, debtPositionId, iuv)
    );

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(error);
    });
  });
});

describe('getDebtPositionZipFile', () => {
  it('downloads zip file successfully with custom filename', async () => {
    const organizationId = 123;
    const debtPositionId = 456;
    const mockBlob = new Blob(['mock zip content'], {
      type: 'application/zip'
    });
    const expectedFileName = 'posizioni_debitorie_456.zip';

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getUnpaidPaymentNoticeZip')
      .mockResolvedValue({
        data: mockBlob,
        headers: {
          'content-disposition': `attachment; filename="${expectedFileName}"`
        },
        status: 200,
        statusText: 'OK',
        config: { headers: {} }
      } as unknown as AxiosResponse);

    const { result } = renderHook(() =>
      debtPositions.getDebtPositionZipFile(organizationId)
    );

    result.current.mutate(debtPositionId);

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(organizationId, debtPositionId, {
        format: 'blob'
      });
      expect(result.current.data).toEqual({
        data: mockBlob,
        fileName: expectedFileName
      });
    });
  });

  it('downloads zip file with default filename when header is missing', async () => {
    const organizationId = 123;
    const debtPositionId = 456;
    const mockBlob = new Blob(['mock zip content'], {
      type: 'application/zip'
    });

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getUnpaidPaymentNoticeZip')
      .mockResolvedValue({
        data: mockBlob,
        headers: {},
        status: 200,
        statusText: 'OK',
        config: { headers: {} }
      } as unknown as AxiosResponse);

    const { result } = renderHook(() =>
      debtPositions.getDebtPositionZipFile(organizationId)
    );

    result.current.mutate(debtPositionId);

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(organizationId, debtPositionId, {
        format: 'blob'
      });
      expect(result.current.data).toEqual({
        data: mockBlob,
        fileName: `debt-position-${debtPositionId}.zip`
      });
    });
  });

  it('handles API errors correctly', async () => {
    const organizationId = 123;
    const debtPositionId = 456;
    const error = new Error('Zip download failed');

    vi.spyOn(
      utils.apiClient.bff,
      'getUnpaidPaymentNoticeZip'
    ).mockRejectedValue(error);

    const { result } = renderHook(() =>
      debtPositions.getDebtPositionZipFile(organizationId)
    );

    result.current.mutate(debtPositionId);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(error);
    });
  });
});
