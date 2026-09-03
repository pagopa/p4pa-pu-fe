import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../__tests__/renderers';
import { buildQueryParams } from './mappings';
import orgSilServiceApi from './index';
import { OrgSilServiceType } from '../../../generated/core/data-contracts';
import type { OrgSilServicesFilteredRequest } from './mappings';
import utils from '../../utils';
import { AxiosResponse } from 'axios';

vi.mock('../../utils', () => {
  const originalModule = vi.importActual('../../utils');
  return {
    ...originalModule,
    default: {
      apiClient: {
        bff: {
          getOrgSilServicesByFilters: vi.fn(),
          getOrgSilServiceDetails: vi.fn(),
          deleteOrgSilService: vi.fn()
        }
      }
    }
  };
});

vi.mock('../../utils/loaders', () => ({
  default: {
    getOrganizations: vi.fn(),
    getOrganizationsPlain: vi.fn()
  },
  parseAndLog: vi.fn()
}));

const mockApiResponse = {
  content: [
    {
      orgSilServiceId: 1,
      applicationName: 'Test Service',
      organizationId: 123,
      serviceUrl: 'http://test.com',
      serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME
    }
  ],
  totalElements: 1,
  totalPages: 1,
  size: 10,
  number: 0
};

const mockServiceDetailsResponse = {
  orgSilServiceId: 1,
  applicationName: 'Test Service Details',
  organizationId: 123,
  serviceUrl: 'http://test-details.com',
  serviceType: OrgSilServiceType.ACTUALIZATION,
  apiKey: 'decrypted-api-key-123',
  description: 'Detailed service information',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-16T14:20:00Z'
};

describe('orgSilService API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrgSilServices', () => {
    it('should return data correctly', async () => {
      const organizationId = 123;
      const requestData: OrgSilServicesFilteredRequest = {
        filters: {
          applicationName: 'Test App',
          serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME
        },
        pagination: { page: 0, size: 20 },
        sort: ['applicationName']
      };

      const expectedQuery = {
        page: 0,
        size: 20,
        applicationName: 'Test App',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
        sort: ['applicationName']
      };

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getOrgSilServicesByFilters')
        .mockResolvedValue({ data: mockApiResponse } as AxiosResponse);

      const { result } = renderHook(() =>
        orgSilServiceApi.getOrgSilServices({ organizationId })
      );

      await result.current.mutateAsync(requestData);

      await waitFor(() => {
        expect(result.current.data).toEqual(mockApiResponse);
      });

      expect(apiMock).toHaveBeenCalledWith(organizationId, expectedQuery);
    });

    it('should handle API errors correctly', async () => {
      const organizationId = 123;
      const mockError = new Error('API Error');

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getOrgSilServicesByFilters')
        .mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        orgSilServiceApi.getOrgSilServices({ organizationId })
      );

      const requestData: OrgSilServicesFilteredRequest = {
        filters: {},
        pagination: { page: 0, size: 10 },
        sort: []
      };

      await expect(result.current.mutateAsync(requestData)).rejects.toThrow(
        'API Error'
      );
      expect(apiMock).toHaveBeenCalled();
    });
  });

  describe('getOrgSilServiceById', () => {
    it('should fetch service details correctly', async () => {
      const organizationId = 123;
      const orgSilServiceId = 456;

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getOrgSilServiceDetails')
        .mockResolvedValue({
          data: mockServiceDetailsResponse
        } as AxiosResponse);

      const { result } = renderHook(() =>
        orgSilServiceApi.getOrgSilServiceById({
          organizationId,
          orgSilServiceId
        })
      );

      await waitFor(() => {
        expect(result.current.data).toEqual({
          response: mockServiceDetailsResponse
        });
      });

      expect(apiMock).toHaveBeenCalledWith(organizationId, orgSilServiceId);
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle API errors correctly', async () => {
      const organizationId = 123;
      const orgSilServiceId = 456;
      const mockError = new Error('Service not found');

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getOrgSilServiceDetails')
        .mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        orgSilServiceApi.getOrgSilServiceById({
          organizationId,
          orgSilServiceId
        })
      );

      expect(apiMock).toHaveBeenCalledWith(organizationId, orgSilServiceId);

      expect(result.current.isLoading).toBe(true);

      await expect(apiMock.mock.results[0].value).rejects.toThrow(
        'Service not found'
      );
    });

    it('should create query with correct parameters', () => {
      const organizationId = 123;
      const orgSilServiceId = 456;

      const apiMock = vi.spyOn(utils.apiClient.bff, 'getOrgSilServiceDetails');

      renderHook(() =>
        orgSilServiceApi.getOrgSilServiceById({
          organizationId,
          orgSilServiceId
        })
      );

      expect(apiMock).toHaveBeenCalledWith(organizationId, orgSilServiceId);
    });

    it('should fetch data automatically on mount', () => {
      const organizationId = 123;
      const orgSilServiceId = 456;

      const apiMock = vi.spyOn(utils.apiClient.bff, 'getOrgSilServiceDetails');

      renderHook(() =>
        orgSilServiceApi.getOrgSilServiceById({
          organizationId,
          orgSilServiceId
        })
      );

      expect(apiMock).toHaveBeenCalledWith(organizationId, orgSilServiceId);
    });

    it('should handle different organization and service IDs', async () => {
      const testCases = [
        { organizationId: 100, orgSilServiceId: 200 },
        { organizationId: 999, orgSilServiceId: 1 },
        { organizationId: 1, orgSilServiceId: 999 }
      ];

      for (const { organizationId, orgSilServiceId } of testCases) {
        const apiMock = vi
          .spyOn(utils.apiClient.bff, 'getOrgSilServiceDetails')
          .mockResolvedValue({
            data: mockServiceDetailsResponse
          } as AxiosResponse);

        const { result } = renderHook(() =>
          orgSilServiceApi.getOrgSilServiceById({
            organizationId,
            orgSilServiceId
          })
        );

        await waitFor(() => {
          expect(result.current.data).toEqual({
            response: mockServiceDetailsResponse
          });
        });

        expect(apiMock).toHaveBeenCalledWith(organizationId, orgSilServiceId);
        expect(result.current.isSuccess).toBe(true);

        vi.clearAllMocks();
      }
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

  it('should handle flagLegacy false correctly (should include it when explicitly false)', () => {
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

  it('should handle empty sort array correctly', () => {
    const request: OrgSilServicesFilteredRequest = {
      filters: {
        applicationName: 'Test App'
      },
      pagination: { page: 0, size: 10 },
      sort: []
    };

    const result = buildQueryParams(request);

    expect(result).toEqual({
      page: 0,
      size: 10,
      applicationName: 'Test App'
    });

    expect(result).not.toHaveProperty('sort');
  });

  it('should handle multiple service types correctly', () => {
    const request: OrgSilServicesFilteredRequest = {
      filters: {
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME
      },
      pagination: { page: 0, size: 10 },
      sort: []
    };

    const result = buildQueryParams(request);

    expect(result).toEqual({
      page: 0,
      size: 10,
      serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME
    });
  });
});

describe('deleteOrgSilService', () => {
  it('should delete service successfully', async () => {
    const organizationId = 123;
    const orgSilServiceId = 456;

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'deleteOrgSilService')
      .mockResolvedValue({} as AxiosResponse);

    const { result } = renderHook(() =>
      orgSilServiceApi.deleteOrgSilService({ organizationId })
    );

    await result.current.mutateAsync(orgSilServiceId);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, orgSilServiceId);
    expect(result.current.isError).toBe(false);
  });

  it('should handle API errors during deletion', async () => {
    const organizationId = 123;
    const orgSilServiceId = 456;
    const mockError = new Error('Service not found for deletion');

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'deleteOrgSilService')
      .mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      orgSilServiceApi.deleteOrgSilService({ organizationId })
    );

    await expect(result.current.mutateAsync(orgSilServiceId)).rejects.toThrow(
      'Service not found for deletion'
    );

    expect(apiMock).toHaveBeenCalledWith(organizationId, orgSilServiceId);
  });

  it('should handle different organization and service IDs for deletion', async () => {
    const testCases = [
      { organizationId: 100, orgSilServiceId: 200 },
      { organizationId: 999, orgSilServiceId: 1 },
      { organizationId: 1, orgSilServiceId: 999 }
    ];

    for (const { organizationId, orgSilServiceId } of testCases) {
      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'deleteOrgSilService')
        .mockResolvedValue({} as AxiosResponse);

      const { result } = renderHook(() =>
        orgSilServiceApi.deleteOrgSilService({ organizationId })
      );

      await result.current.mutateAsync(orgSilServiceId);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiMock).toHaveBeenCalledWith(organizationId, orgSilServiceId);

      vi.clearAllMocks();
    }
  });

  it('should handle network errors during deletion', async () => {
    const organizationId = 123;
    const orgSilServiceId = 456;
    const networkError = new Error('Network timeout');

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'deleteOrgSilService')
      .mockRejectedValue(networkError);

    const { result } = renderHook(() =>
      orgSilServiceApi.deleteOrgSilService({ organizationId })
    );

    await expect(result.current.mutateAsync(orgSilServiceId)).rejects.toThrow(
      'Network timeout'
    );

    expect(apiMock).toHaveBeenCalledWith(organizationId, orgSilServiceId);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('should handle server error responses during deletion', async () => {
    const organizationId = 123;
    const orgSilServiceId = 456;
    const serverError = new Error('Internal server error');

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'deleteOrgSilService')
      .mockRejectedValue(serverError);

    const { result } = renderHook(() =>
      orgSilServiceApi.deleteOrgSilService({ organizationId })
    );

    await expect(result.current.mutateAsync(orgSilServiceId)).rejects.toThrow(
      'Internal server error'
    );

    expect(apiMock).toHaveBeenCalledWith(organizationId, orgSilServiceId);
  });
});
