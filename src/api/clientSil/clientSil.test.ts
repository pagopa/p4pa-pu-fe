import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../__tests__/renderers';
import {
  getClientSils,
  deleteClientSil,
  getClientDetail,
  generateClientSecret
} from './index';
import { buildQueryParams } from './mappings';
import type { ClientSilFilteredRequest } from './mappings';
import { AxiosResponse } from 'axios';

vi.mock('../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getClients: vi.fn(),
        deleteClient: vi.fn(),
        getClient: vi.fn(),
        generateClientSecret: vi.fn()
      }
    }
  }
}));

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

import utils from '../../utils';

describe('ClientSil API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getClientSils', () => {
    it('should call API with correct parameters', async () => {
      const mockResponse = {
        content: [
          {
            clientId: 'client123',
            clientName: 'Test Client',
            organizationIpaCode: 'ORG001'
          }
        ],
        totalElements: 1,
        totalPages: 1,
        pageNo: 0,
        pageSize: 10
      };

      vi.mocked(utils.apiClient.bff.getClients).mockResolvedValue({
        data: mockResponse
      } as AxiosResponse);

      const { result } = renderHook(() =>
        getClientSils({ organizationId: 123 })
      );

      const mutationRequest: ClientSilFilteredRequest = {
        filters: { clientName: 'Test', clientId: 'client123' },
        pagination: { page: 0, size: 10 },
        sort: ['clientName,ASC']
      };

      result.current.mutate(mutationRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(utils.apiClient.bff.getClients).toHaveBeenCalledWith(
        123,
        {
          page: 0,
          size: 10,
          clientName: 'Test',
          clientId: 'client123',
          sort: ['clientName,ASC']
        },
        {
          paramsSerializer: {
            indexes: null
          }
        }
      );
    });
  });

  describe('buildQueryParams', () => {
    it('should build query params correctly with all filters', () => {
      const request: ClientSilFilteredRequest = {
        filters: {
          clientName: 'Test Client',
          clientId: 'client123'
        },
        pagination: { page: 1, size: 20 },
        sort: ['clientName,DESC']
      };

      const result = buildQueryParams(request);

      expect(result).toEqual({
        page: 1,
        size: 20,
        clientName: 'Test Client',
        clientId: 'client123',
        sort: ['clientName,DESC']
      });
    });

    it('should omit empty filters', () => {
      const request: ClientSilFilteredRequest = {
        filters: {},
        pagination: { page: 0, size: 10 },
        sort: []
      };

      const result = buildQueryParams(request);

      expect(result).toEqual({
        page: 0,
        size: 10
      });
    });

    it('should include only non-empty filters', () => {
      const request: ClientSilFilteredRequest = {
        filters: {
          clientName: 'Test'
        },
        pagination: { page: 0, size: 10 },
        sort: ['clientId,ASC']
      };

      const result = buildQueryParams(request);

      expect(result).toEqual({
        page: 0,
        size: 10,
        clientName: 'Test',
        sort: ['clientId,ASC']
      });
    });
  });

  describe('deleteClientSil', () => {
    it('should call deleteClient API with correct parameters', async () => {
      const organizationId = 123;
      const clientId = 'client123';

      vi.mocked(utils.apiClient.bff.deleteClient).mockResolvedValue({
        data: undefined
      } as AxiosResponse);

      const { result } = renderHook(() => deleteClientSil(organizationId));

      result.current.mutate(clientId);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(utils.apiClient.bff.deleteClient).toHaveBeenCalledWith(
        organizationId,
        clientId
      );
    });

    it('should handle delete API error', async () => {
      const organizationId = 123;
      const clientId = 'client123';
      const mockError = new Error('Delete failed');

      vi.mocked(utils.apiClient.bff.deleteClient).mockRejectedValue(mockError);

      const { result } = renderHook(() => deleteClientSil(organizationId));

      result.current.mutate(clientId);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('getClientDetail', () => {
    it('returns data correctly', async () => {
      const dataMock = {
        clientId: 'IPA_TEST_ID',
        clientName: 'IPA_TEST_NAME',
        organizationIpaCode: 'IPA_TEST',
        clientSecret: '000111'
      };

      const params = { organizationId: 33, clientId: dataMock.clientId };

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getClient')
        .mockResolvedValue({ data: dataMock } as AxiosResponse);

      const { result } = renderHook(() =>
        getClientDetail(params.organizationId, params.clientId || '')
      );

      await waitFor(() => {
        expect(apiMock).toHaveBeenCalledWith(
          params.organizationId,
          params.clientId
        );
        expect(result.current.data).toEqual(dataMock);
      });
    });
  });

  describe('generateClientSecret', () => {
    it('should call generateClientSecret API with correct parameters', async () => {
      const organizationId = 123;
      const clientId = 'client123';
      const mockResponse = {
        clientId: 'client123',
        clientName: 'Test Client',
        organizationIpaCode: 'ORG001',
        clientSecret: 'new-secret-123'
      };

      vi.mocked(utils.apiClient.bff.generateClientSecret).mockResolvedValue({
        data: mockResponse
      } as AxiosResponse);

      const { result } = renderHook(() => generateClientSecret(organizationId));

      result.current.mutate(clientId);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(utils.apiClient.bff.generateClientSecret).toHaveBeenCalledWith(
        organizationId,
        clientId
      );
      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle generateClientSecret error', async () => {
      const organizationId = 123;
      const clientId = 'client123';
      const mockError = new Error('generateClientSecret failed');

      vi.mocked(utils.apiClient.bff.generateClientSecret).mockRejectedValue(
        mockError
      );

      const { result } = renderHook(() => generateClientSecret(organizationId));

      result.current.mutate(clientId);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });
  });
});
