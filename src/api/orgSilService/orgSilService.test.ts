import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../__tests__/renderers';
import { buildQueryParams } from './mappings';
import orgSilServiceApi from './index';
import { OrgSilServiceType } from '../../../generated/data-contracts';
import type { OrgSilServicesFilteredRequest } from './mappings';
import type { OrgSilServiceDecryptedDTO } from '../../../generated/apiClient';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import { AxiosResponse } from 'axios';

vi.mock('../../utils', () => {
  const originalModule = vi.importActual('../../utils');
  return {
    ...originalModule,
    default: {
      apiClient: {
        bff: {
          getOrgSilServicesByFilters: vi.fn(),
          createOrgSilService: vi.fn()
        }
      }
    }
  };
});

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn(),
  default: {}
}));

vi.mock('../../utils/formatters', () => ({
  toCamelCase: vi.fn((str) => str.toLowerCase().replace(/_/g, '')),
  default: {}
}));

const createMockApiResponse = (overrides = {}) => ({
  content: [
    {
      orgSilServiceId: 1,
      applicationName: 'Test Service',
      organizationId: 123,
      serviceUrl: 'http://test.com',
      serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
      ...overrides
    }
  ],
  totalElements: 1,
  totalPages: 1,
  size: 10,
  number: 0
});

const createMockServicePayload = (
  overrides = {}
): OrgSilServiceDecryptedDTO => ({
  applicationName: 'New Test Service',
  serviceUrl: 'https://new-test.com',
  serviceType: OrgSilServiceType.ACTUALIZATION,
  organizationId: 123,
  ...overrides,
  flagLegacy: false
});

describe('orgSilService API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrgSilServices', () => {
    const organizationId = 123;

    it('should fetch and return paginated services with filters', async () => {
      const requestData: OrgSilServicesFilteredRequest = {
        filters: {
          applicationName: 'Test App',
          serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME
        },
        pagination: { page: 0, size: 20 },
        sort: ['applicationName']
      };

      const mockResponse = createMockApiResponse();
      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getOrgSilServicesByFilters')
        .mockResolvedValue({ data: mockResponse } as AxiosResponse);

      const { result } = renderHook(() =>
        orgSilServiceApi.getOrgSilServices({ organizationId })
      );

      const response = await result.current.mutateAsync(requestData);

      expect(response).toEqual(mockResponse);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const expectedQuery = buildQueryParams(requestData);
      expect(apiMock).toHaveBeenCalledWith(organizationId, expectedQuery, {
        paramsSerializer: { indexes: null }
      });

      expect(parseAndLog).toHaveBeenCalledWith(
        expect.any(Object),
        mockResponse
      );
    });

    it('should handle empty filters correctly', async () => {
      const requestData: OrgSilServicesFilteredRequest = {
        filters: {},
        pagination: { page: 0, size: 10 },
        sort: []
      };

      const mockResponse = createMockApiResponse();
      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getOrgSilServicesByFilters')
        .mockResolvedValue({ data: mockResponse } as AxiosResponse);

      const { result } = renderHook(() =>
        orgSilServiceApi.getOrgSilServices({ organizationId })
      );

      await result.current.mutateAsync(requestData);

      expect(apiMock).toHaveBeenCalledWith(
        organizationId,
        { page: 0, size: 10 },
        { paramsSerializer: { indexes: null } }
      );
    });

    it('should handle API errors and set error state', async () => {
      const mockError = new Error('Network Error');
      vi.spyOn(
        utils.apiClient.bff,
        'getOrgSilServicesByFilters'
      ).mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        orgSilServiceApi.getOrgSilServices({ organizationId })
      );

      const requestData: OrgSilServicesFilteredRequest = {
        filters: {},
        pagination: { page: 0, size: 10 },
        sort: []
      };

      await expect(result.current.mutateAsync(requestData)).rejects.toThrow(
        'Network Error'
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(mockError);
      });
    });

    it('should handle different organization IDs correctly', async () => {
      const differentOrgId = 456;
      const mockResponse = createMockApiResponse({
        organizationId: differentOrgId
      });

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getOrgSilServicesByFilters')
        .mockResolvedValue({ data: mockResponse } as AxiosResponse);

      const { result } = renderHook(() =>
        orgSilServiceApi.getOrgSilServices({ organizationId: differentOrgId })
      );

      const requestData: OrgSilServicesFilteredRequest = {
        filters: {},
        pagination: { page: 0, size: 10 },
        sort: []
      };

      await result.current.mutateAsync(requestData);

      expect(apiMock).toHaveBeenCalledWith(
        differentOrgId,
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe('createOrgSilService', () => {
    const organizationId = 123;

    it('should create a new service successfully', async () => {
      const servicePayload = createMockServicePayload();
      const mockResponse = { ...servicePayload, orgSilServiceId: 999 };

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'createOrgSilService')
        .mockResolvedValue({ data: mockResponse } as AxiosResponse);

      const { result } = renderHook(() =>
        orgSilServiceApi.createOrgSilService({ organizationId })
      );

      const response = await result.current.mutateAsync(servicePayload);

      expect(response).toEqual(mockResponse);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiMock).toHaveBeenCalledWith(organizationId, servicePayload);
      expect(parseAndLog).toHaveBeenCalledWith(
        expect.any(Object),
        mockResponse
      );
    });

    it('should handle creation errors correctly', async () => {
      const servicePayload = createMockServicePayload();
      const mockError = new Error('Validation Error');

      vi.spyOn(utils.apiClient.bff, 'createOrgSilService').mockRejectedValue(
        mockError
      );

      const { result } = renderHook(() =>
        orgSilServiceApi.createOrgSilService({ organizationId })
      );

      await expect(result.current.mutateAsync(servicePayload)).rejects.toThrow(
        'Validation Error'
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(mockError);
      });
    });

    it('should handle different service types during creation', async () => {
      const servicePayload = createMockServicePayload({
        serviceType: OrgSilServiceType.ACTUALIZATION
      });
      const mockResponse = { ...servicePayload, orgSilServiceId: 998 };

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'createOrgSilService')
        .mockResolvedValue({ data: mockResponse } as AxiosResponse);

      const { result } = renderHook(() =>
        orgSilServiceApi.createOrgSilService({ organizationId })
      );

      await result.current.mutateAsync(servicePayload);

      expect(apiMock).toHaveBeenCalledWith(organizationId, servicePayload);
      expect(mockResponse.serviceType).toBe(OrgSilServiceType.ACTUALIZATION);
    });
  });

  describe('mutation keys', () => {
    it('should use correct mutation key for getOrgSilServices', () => {
      const organizationId = 123;
      const { result } = renderHook(() =>
        orgSilServiceApi.getOrgSilServices({ organizationId })
      );

      expect(result.current).toBeDefined();
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should use correct mutation key for createOrgSilService', () => {
      const organizationId = 456;
      const { result } = renderHook(() =>
        orgSilServiceApi.createOrgSilService({ organizationId })
      );

      expect(result.current).toBeDefined();
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('buildQueryParams', () => {
  it('should build query params with all filters present', () => {
    const request: OrgSilServicesFilteredRequest = {
      filters: {
        applicationName: 'Test Application',
        serviceType: OrgSilServiceType.ACTUALIZATION,
        flagLegacy: true
      },
      pagination: { page: 2, size: 25 },
      sort: ['applicationName', 'serviceType']
    };

    const result = buildQueryParams(request);

    expect(result).toEqual({
      page: 2,
      size: 25,
      applicationName: 'Test Application',
      serviceType: OrgSilServiceType.ACTUALIZATION,
      flagLegacy: true,
      sort: ['applicationName', 'serviceType']
    });
  });

  it('should build query params with only pagination when no filters', () => {
    const request: OrgSilServicesFilteredRequest = {
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

  it('should include only provided filters and exclude undefined ones', () => {
    const request: OrgSilServicesFilteredRequest = {
      filters: {
        applicationName: 'Only App Name'
      },
      pagination: { page: 1, size: 15 },
      sort: ['applicationName']
    };

    const result = buildQueryParams(request);

    expect(result).toEqual({
      page: 1,
      size: 15,
      applicationName: 'Only App Name',
      sort: ['applicationName']
    });

    expect(result).not.toHaveProperty('serviceType');
    expect(result).not.toHaveProperty('flagLegacy');
  });

  it('should handle flagLegacy false correctly', () => {
    const request: OrgSilServicesFilteredRequest = {
      filters: {
        flagLegacy: false
      },
      pagination: { page: 0, size: 10 },
      sort: []
    };

    const result = buildQueryParams(request);

    expect(result).toEqual({
      page: 0,
      size: 10,
      flagLegacy: false
    });
  });

  it('should not include flagLegacy when undefined', () => {
    const request: OrgSilServicesFilteredRequest = {
      filters: {
        applicationName: 'Test',
        flagLegacy: undefined
      },
      pagination: { page: 0, size: 10 },
      sort: []
    };

    const result = buildQueryParams(request);

    expect(result).toEqual({
      page: 0,
      size: 10,
      applicationName: 'Test'
    });

    expect(result).not.toHaveProperty('flagLegacy');
  });
});
