import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../__tests__/renderers';
import { getClientDetail, getClientSils } from './index';
import { buildQueryParams } from './mappings';
import type { ClientSilFilteredRequest } from './mappings';
import { AxiosResponse } from 'axios';

vi.mock('../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getClients: vi.fn(),
        getClient: vi.fn()
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
        filters: {
          clientName: '',
          clientId: undefined
        },
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
          clientName: 'Test',
          clientId: ''
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
  describe('get ClientSIL Detail ', () => {
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
});
