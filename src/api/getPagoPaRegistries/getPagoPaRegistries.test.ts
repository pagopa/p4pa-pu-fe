import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../__tests__/renderers';
import getPagoPaRegistries from '.';
import utils from '../../utils';
import { AxiosResponse } from 'axios';
import {
  RegistryPagoPaEventType,
  RegistryOutcome,
  RegistryEventSubType,
  RegistryEventCategory
} from '../../../generated/data-contracts';
import { FilteredRequest } from '../../models/Filters';
import { NodoFilterValues } from '../../routes/Events/configs';

// Mock corretto dei moduli
vi.mock('../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getPagoPaRegistries: vi.fn()
      }
    },
    formatters: {
      date: {
        code: vi.fn()
      }
    }
  }
}));

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

describe('getPagoPaRegistries', () => {
  const mockApiClient = utils.apiClient.bff.getPagoPaRegistries as ReturnType<
    typeof vi.fn
  >;
  const mockDateFormatter = utils.formatters.date.code as ReturnType<
    typeof vi.fn
  >;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return PagoPa registries data with minimal filters', async () => {
    const mockData = {
      content: [
        {
          registryId: 'registry-001',
          registryOrigin: 'PAGOPA',
          dateTime: '2023-06-15T10:30:00Z',
          traceId: 'trace-123',
          brokerStationId: 'station-001',
          orgFiscalCode: '12345678901',
          iuv: 'IUV123456789',
          nav: 'NAV001',
          ccp: 'CCP001',
          pspId: 'PSP001',
          pspChannelId: 'CHANNEL001',
          paymentMethod: 'CARD',
          eventCategory: RegistryEventCategory.INTERFACCIA,
          eventType: RegistryPagoPaEventType.PaForNodePaVerifyPaymentNotice,
          eventSubType: RegistryEventSubType.REQ,
          requestorId: 'REQ001',
          grantorId: 'GRANT001',
          outcome: RegistryOutcome.OK
        }
      ],
      size: 10,
      totalElements: 1,
      totalPages: 1,
      number: 0
    };

    const organizationId = 123;
    const request: FilteredRequest<NodoFilterValues> = {
      filters: {},
      pagination: { page: 0, size: 10 },
      sort: []
    };

    mockApiClient.mockResolvedValue({ data: mockData } as AxiosResponse);

    const { result } = renderHook(() => getPagoPaRegistries(organizationId));

    const data = await result.current.mutateAsync(request);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient).toHaveBeenCalledWith(organizationId, {
      eventType: undefined,
      eventDateTimeFrom: undefined,
      eventDateTimeTo: undefined,
      iuv: undefined,
      outcome: undefined,
      page: 0,
      size: 10,
      sort: []
    });
    expect(data).toEqual(mockData);
  });

  it('should handle complex filter queries with date range', async () => {
    const mockData = {
      content: [],
      size: 20,
      totalElements: 0,
      totalPages: 0,
      number: 0
    };

    const organizationId = 456;
    const request: FilteredRequest<NodoFilterValues> = {
      filters: {
        event: RegistryPagoPaEventType.PaForNodePaGetPaymentV2,
        eventDate: {
          from: new Date('2023-01-01'),
          to: new Date('2023-01-31')
        },
        iuv: 'IUV987654321',
        outcome: RegistryOutcome.KO
      },
      pagination: { page: 1, size: 20 },
      sort: ['dateTime,desc', 'outcome,asc']
    };

    mockDateFormatter
      .mockReturnValueOnce('2023-01-01T00:00:00Z')
      .mockReturnValueOnce('2023-01-31T23:59:59Z');

    mockApiClient.mockResolvedValue({ data: mockData } as AxiosResponse);

    const { result } = renderHook(() => getPagoPaRegistries(organizationId));

    const data = await result.current.mutateAsync(request);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient).toHaveBeenCalledWith(organizationId, {
      eventType: RegistryPagoPaEventType.PaForNodePaGetPaymentV2,
      eventDateTimeFrom: '2023-01-01T00:00:00Z',
      eventDateTimeTo: '2023-01-31T23:59:59Z',
      iuv: 'IUV987654321',
      outcome: RegistryOutcome.KO,
      page: 1,
      size: 20,
      sort: ['dateTime,desc', 'outcome,asc']
    });
    expect(data).toEqual(mockData);
  });

  it('should handle partial date range (only from date)', async () => {
    const mockData = {
      content: [],
      size: 10,
      totalElements: 0,
      totalPages: 0,
      number: 0
    };

    const organizationId = 789;
    const request: FilteredRequest<NodoFilterValues> = {
      filters: {
        eventDate: {
          from: new Date('2023-06-01')
        },
        outcome: RegistryOutcome.OK
      },
      pagination: { page: 0, size: 10 },
      sort: ['dateTime,asc']
    };

    mockDateFormatter
      .mockReturnValueOnce('2023-06-01T00:00:00Z')
      .mockReturnValueOnce(undefined);

    mockApiClient.mockResolvedValue({ data: mockData } as AxiosResponse);

    const { result } = renderHook(() => getPagoPaRegistries(organizationId));

    await result.current.mutateAsync(request);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient).toHaveBeenCalledWith(organizationId, {
      eventType: undefined,
      eventDateTimeFrom: '2023-06-01T00:00:00Z',
      eventDateTimeTo: undefined,
      iuv: undefined,
      outcome: RegistryOutcome.OK,
      page: 0,
      size: 10,
      sort: ['dateTime,asc']
    });
  });

  it('should handle API errors correctly', async () => {
    const error = new Error('API request failed');
    const organizationId = 123;
    const request: FilteredRequest<NodoFilterValues> = {
      filters: {
        iuv: 'ERROR_IUV'
      },
      pagination: { page: 0, size: 10 },
      sort: []
    };

    mockApiClient.mockRejectedValue(error);

    const { result } = renderHook(() => getPagoPaRegistries(organizationId));

    await expect(result.current.mutateAsync(request)).rejects.toThrow(
      'API request failed'
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(error);
    });
  });

  it('should handle empty sort array correctly', async () => {
    const mockData = {
      content: [],
      size: 10,
      totalElements: 0,
      totalPages: 0,
      number: 0
    };

    const organizationId = 123;
    const request: FilteredRequest<NodoFilterValues> = {
      filters: {
        event: RegistryPagoPaEventType.PaForNodePaSendRTV2
      },
      pagination: { page: 0, size: 10 },
      sort: []
    };

    mockApiClient.mockResolvedValue({ data: mockData } as AxiosResponse);

    const { result } = renderHook(() => getPagoPaRegistries(organizationId));

    await result.current.mutateAsync(request);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient).toHaveBeenCalledWith(organizationId, {
      eventType: RegistryPagoPaEventType.PaForNodePaSendRTV2,
      eventDateTimeFrom: undefined,
      eventDateTimeTo: undefined,
      iuv: undefined,
      outcome: undefined,
      page: 0,
      size: 10,
      sort: []
    });
  });

  it('should handle different organization IDs correctly', async () => {
    const mockData = {
      content: [],
      size: 15,
      totalElements: 0,
      totalPages: 0,
      number: 0
    };

    const differentOrgId = 999;
    const request: FilteredRequest<NodoFilterValues> = {
      filters: {
        iuv: 'SPECIAL_IUV'
      },
      pagination: { page: 2, size: 15 },
      sort: ['registryId,desc']
    };

    mockApiClient.mockResolvedValue({ data: mockData } as AxiosResponse);

    const { result } = renderHook(() => getPagoPaRegistries(differentOrgId));

    const data = await result.current.mutateAsync(request);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient).toHaveBeenCalledWith(differentOrgId, {
      eventType: undefined,
      eventDateTimeFrom: undefined,
      eventDateTimeTo: undefined,
      iuv: 'SPECIAL_IUV',
      outcome: undefined,
      page: 2,
      size: 15,
      sort: ['registryId,desc']
    });
    expect(data).toEqual(mockData);
  });

  it('should handle null/undefined date values correctly', async () => {
    const mockData = {
      content: [],
      size: 10,
      totalElements: 0,
      totalPages: 0,
      number: 0
    };

    const organizationId = 123;
    const request: FilteredRequest<NodoFilterValues> = {
      filters: {
        eventDate: {
          from: undefined,
          to: undefined
        }
      },
      pagination: { page: 0, size: 10 },
      sort: []
    };

    mockDateFormatter
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined);

    mockApiClient.mockResolvedValue({ data: mockData } as AxiosResponse);

    const { result } = renderHook(() => getPagoPaRegistries(organizationId));

    await result.current.mutateAsync(request);

    expect(mockApiClient).toHaveBeenCalledWith(organizationId, {
      eventType: undefined,
      eventDateTimeFrom: undefined,
      eventDateTimeTo: undefined,
      iuv: undefined,
      outcome: undefined,
      page: 0,
      size: 10,
      sort: []
    });
  });
});
