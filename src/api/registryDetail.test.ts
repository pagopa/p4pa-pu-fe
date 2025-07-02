import utils from '../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';
import {
  usePagoPaRegistry,
  useSilRegistry,
  useRegistry
} from './registryDetail';
import { RequestParams } from '../../generated/apiClient';
import {
  PagoPaRegistryDTO,
  SilRegistryDTO,
  RegistryEventCategory,
  RegistryPagoPaEventType,
  RegistryEventSubType,
  RegistryOutcome,
  RegistrySilEventType
} from '../../generated/data-contracts';

vi.mock('../utils', async () => {
  const actual = await vi.importActual<typeof import('../utils')>('../utils');
  return {
    ...actual,
    apiClient: {
      bff: {
        getPagoPaRegistry: vi.fn(),
        getSilRegistry: vi.fn()
      }
    }
  };
});

vi.mock('../utils/loaders', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/loaders')>();
  return {
    ...actual,
    parseAndLog: vi.fn()
  };
});

describe('registryDetail hooks', () => {
  const mockOrganizationId = 123;
  const mockRegistryId = 'test-registry-id';
  const mockParams: RequestParams = {};

  const mockPagoPaData: PagoPaRegistryDTO = {
    registryId: 'pagopa-123',
    dateTime: '2023-12-01T10:00:00Z',
    traceId: 'trace-123',
    brokerStationId: 'station-123',
    orgFiscalCode: '12345678901',
    iuv: 'IUV123456789',
    nav: 'NAV123456789',
    ccp: 'CCP123',
    pspId: 'PSP001',
    pspChannelId: 'CHANNEL001',
    paymentMethod: 'CARD',
    eventCategory: RegistryEventCategory.INTERFACCIA,
    eventType: RegistryPagoPaEventType.PaVerifyPaymentNotice,
    eventSubType: RegistryEventSubType.REQ,
    requestorId: 'REQ001',
    grantorId: 'GRANT001',
    outcome: RegistryOutcome.OK,
    body: '{"test": "data"}'
  };

  const mockSilData: SilRegistryDTO = {
    registryId: 'sil-456',
    dateTime: '2023-12-01T10:00:00Z',
    traceId: 'trace-456',
    brokerFiscalCode: '98765432100',
    orgFiscalCode: '12345678901',
    iuv: 'IUV987654321',
    nav: 'NAV987654321',
    eventType: RegistrySilEventType.PaaSILImportaDovuto,
    eventSubType: RegistryEventSubType.REQ,
    requestorId: 'REQ002',
    grantorId: 'GRANT002',
    outcome: RegistryOutcome.OK,
    body: '{"test": "sil data"}'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePagoPaRegistry', () => {
    it('should fetch PagoPA registry data successfully', async () => {
      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getPagoPaRegistry')
        .mockResolvedValue({ data: mockPagoPaData } as AxiosResponse);

      const { result } = renderHook(() =>
        usePagoPaRegistry(mockOrganizationId, mockRegistryId, true, mockParams)
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPagoPaData);
      expect(apiMock).toHaveBeenCalledWith(
        mockOrganizationId,
        mockRegistryId,
        mockParams
      );
    });

    it('should not fetch data when enabled is false', () => {
      const apiMock = vi.spyOn(utils.apiClient.bff, 'getPagoPaRegistry');

      const { result } = renderHook(() =>
        usePagoPaRegistry(mockOrganizationId, mockRegistryId, false)
      );

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(apiMock).not.toHaveBeenCalled();
    });

    it('should not fetch data when organizationId is missing', () => {
      const apiMock = vi.spyOn(utils.apiClient.bff, 'getPagoPaRegistry');

      const { result } = renderHook(() =>
        usePagoPaRegistry(0, mockRegistryId, true)
      );

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(apiMock).not.toHaveBeenCalled();
    });

    it('should not fetch data when registryId is missing', () => {
      const apiMock = vi.spyOn(utils.apiClient.bff, 'getPagoPaRegistry');

      const { result } = renderHook(() =>
        usePagoPaRegistry(mockOrganizationId, '', true)
      );

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(apiMock).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getPagoPaRegistry')
        .mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() =>
        usePagoPaRegistry(mockOrganizationId, mockRegistryId, true)
      );

      await waitFor(() => {
        expect(apiMock).toHaveBeenCalled();
      });

      expect(result.current.data).toBeUndefined();
      expect(apiMock).toHaveBeenCalledWith(
        mockOrganizationId,
        mockRegistryId,
        undefined
      );
    });
  });

  describe('useSilRegistry', () => {
    it('should fetch SIL registry data successfully', async () => {
      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getSilRegistry')
        .mockResolvedValue({ data: mockSilData } as AxiosResponse);

      const { result } = renderHook(() =>
        useSilRegistry(mockOrganizationId, mockRegistryId, true, mockParams)
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSilData);
      expect(apiMock).toHaveBeenCalledWith(
        mockOrganizationId,
        mockRegistryId,
        mockParams
      );
    });

    it('should not fetch data when enabled is false', () => {
      const apiMock = vi.spyOn(utils.apiClient.bff, 'getSilRegistry');

      const { result } = renderHook(() =>
        useSilRegistry(mockOrganizationId, mockRegistryId, false)
      );

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(apiMock).not.toHaveBeenCalled();
    });

    it('should not fetch data when organizationId is missing', () => {
      const apiMock = vi.spyOn(utils.apiClient.bff, 'getSilRegistry');

      const { result } = renderHook(() =>
        useSilRegistry(0, mockRegistryId, true)
      );

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(apiMock).not.toHaveBeenCalled();
    });

    it('should not fetch data when registryId is missing', () => {
      const apiMock = vi.spyOn(utils.apiClient.bff, 'getSilRegistry');

      const { result } = renderHook(() =>
        useSilRegistry(mockOrganizationId, '', true)
      );

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(apiMock).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getSilRegistry')
        .mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() =>
        useSilRegistry(mockOrganizationId, mockRegistryId, true)
      );

      await waitFor(() => {
        expect(apiMock).toHaveBeenCalled();
      });

      expect(result.current.data).toBeUndefined();
      expect(apiMock).toHaveBeenCalledWith(
        mockOrganizationId,
        mockRegistryId,
        undefined
      );
    });
  });

  describe('useRegistry', () => {
    it('should use PagoPA registry when registryType is "pagopa"', async () => {
      const pagoPaApiMock = vi
        .spyOn(utils.apiClient.bff, 'getPagoPaRegistry')
        .mockResolvedValue({ data: mockPagoPaData } as AxiosResponse);

      const silApiMock = vi.spyOn(utils.apiClient.bff, 'getSilRegistry');

      const { result } = renderHook(() =>
        useRegistry(
          'pagopa',
          mockOrganizationId,
          mockRegistryId,
          true,
          mockParams
        )
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPagoPaData);
      expect(pagoPaApiMock).toHaveBeenCalledWith(
        mockOrganizationId,
        mockRegistryId,
        mockParams
      );
      expect(silApiMock).not.toHaveBeenCalled();
    });

    it('should use SIL registry when registryType is "sil"', async () => {
      const pagoPaApiMock = vi.spyOn(utils.apiClient.bff, 'getPagoPaRegistry');

      const silApiMock = vi
        .spyOn(utils.apiClient.bff, 'getSilRegistry')
        .mockResolvedValue({ data: mockSilData } as AxiosResponse);

      const { result } = renderHook(() =>
        useRegistry('sil', mockOrganizationId, mockRegistryId, true, mockParams)
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSilData);
      expect(silApiMock).toHaveBeenCalledWith(
        mockOrganizationId,
        mockRegistryId,
        mockParams
      );
      expect(pagoPaApiMock).not.toHaveBeenCalled();
    });

    it('should not fetch SIL data when registryType is "pagopa"', () => {
      vi.spyOn(utils.apiClient.bff, 'getPagoPaRegistry').mockResolvedValue({
        data: mockPagoPaData
      } as AxiosResponse);

      vi.spyOn(utils.apiClient.bff, 'getSilRegistry');

      renderHook(() =>
        useRegistry('pagopa', mockOrganizationId, mockRegistryId, true)
      );

      expect(utils.apiClient.bff.getSilRegistry).not.toHaveBeenCalled();
    });

    it('should not fetch PagoPA data when registryType is "sil"', () => {
      vi.spyOn(utils.apiClient.bff, 'getPagoPaRegistry');

      renderHook(() =>
        useRegistry('sil', mockOrganizationId, mockRegistryId, true)
      );

      expect(utils.apiClient.bff.getPagoPaRegistry).not.toHaveBeenCalled();
    });

    it('should not fetch any data when enabled is false', () => {
      vi.spyOn(utils.apiClient.bff, 'getPagoPaRegistry');
      vi.spyOn(utils.apiClient.bff, 'getSilRegistry');

      const { result } = renderHook(() =>
        useRegistry('pagopa', mockOrganizationId, mockRegistryId, false)
      );

      expect(result.current.data).toBeUndefined();
      expect(utils.apiClient.bff.getPagoPaRegistry).not.toHaveBeenCalled();
      expect(utils.apiClient.bff.getSilRegistry).not.toHaveBeenCalled();
    });
  });
});
