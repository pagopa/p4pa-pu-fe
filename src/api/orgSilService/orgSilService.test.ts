import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../__tests__/renderers';
import { buildQueryParams } from './mappings';
import orgSilServiceApi from './index';
import { OrgSilServiceType } from '../../../generated/data-contracts';
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
          getOrgSilServicesByFilters: vi.fn()
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

      expect(apiMock).toHaveBeenCalledWith(organizationId, expectedQuery, {
        paramsSerializer: {
          indexes: null
        }
      });
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
