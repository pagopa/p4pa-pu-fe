/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';
import {
  OrgSilServiceType,
  OrgSilServiceDTO
} from '../../generated/data-contracts';
import { setOrganizationId } from '../store/OrganizationIdStore';

vi.mock('../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getOrgSilServices: vi.fn()
      }
    }
  }
}));

vi.mock('../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

vi.mock('../../../generated/zod-schema', () => ({
  orgSilServiceSchema: {}
}));

import orgSilServicesApi, { isValidService } from './orgSilServices';
import utils from '../utils';

const mockGetOrgSilServices = vi.mocked(utils.apiClient.bff.getOrgSilServices);

describe('orgSilServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setOrganizationId(123);
  });

  describe('isValidService', () => {
    it('returns true for service with valid orgSilServiceId', () => {
      const validService: OrgSilServiceDTO = {
        orgSilServiceId: 1,
        organizationId: 123,
        applicationName: 'Test Service',
        serviceUrl: 'https://test.com',
        serviceType: OrgSilServiceType.ACTUALIZATION
      };

      expect(isValidService(validService)).toBe(true);
    });

    it('returns false for service with null orgSilServiceId', () => {
      const invalidService: OrgSilServiceDTO = {
        orgSilServiceId: null,
        organizationId: 123,
        applicationName: 'Test Service',
        serviceUrl: 'https://test.com',
        serviceType: OrgSilServiceType.ACTUALIZATION
      } as any;

      expect(isValidService(invalidService)).toBe(false);
    });

    it('returns false for service with undefined orgSilServiceId', () => {
      const invalidService: OrgSilServiceDTO = {
        orgSilServiceId: undefined,
        organizationId: 123,
        applicationName: 'Test Service',
        serviceUrl: 'https://test.com',
        serviceType: OrgSilServiceType.ACTUALIZATION
      } as any;

      expect(isValidService(invalidService)).toBe(false);
    });

    it('returns false for service with zero orgSilServiceId', () => {
      const invalidService: OrgSilServiceDTO = {
        orgSilServiceId: 0,
        organizationId: 123,
        applicationName: 'Test Service',
        serviceUrl: 'https://test.com',
        serviceType: OrgSilServiceType.ACTUALIZATION
      };

      expect(isValidService(invalidService)).toBe(false);
    });

    it('returns false for service with negative orgSilServiceId', () => {
      const invalidService: OrgSilServiceDTO = {
        orgSilServiceId: -1,
        organizationId: 123,
        applicationName: 'Test Service',
        serviceUrl: 'https://test.com',
        serviceType: OrgSilServiceType.ACTUALIZATION
      };

      expect(isValidService(invalidService)).toBe(false);
    });
  });

  describe('getOrgSilServices', () => {
    const mockServices: Array<OrgSilServiceDTO> = [
      {
        orgSilServiceId: 1,
        organizationId: 123,
        applicationName: 'Valid Service 1',
        serviceUrl: 'https://service1.com',
        serviceType: OrgSilServiceType.ACTUALIZATION
      },
      {
        orgSilServiceId: 2,
        organizationId: 123,
        applicationName: 'Valid Service 2',
        serviceUrl: 'https://service2.com',
        serviceType: OrgSilServiceType.ACTUALIZATION
      },
      {
        orgSilServiceId: 0,
        organizationId: 123,
        applicationName: 'Invalid Service',
        serviceUrl: 'https://invalid.com',
        serviceType: OrgSilServiceType.ACTUALIZATION
      }
    ];

    it('fetches and filters valid services successfully', async () => {
      mockGetOrgSilServices.mockResolvedValue({
        data: mockServices
      } as any);

      const { result } = renderHook(() =>
        orgSilServicesApi.getOrgSilServices(
          123,
          OrgSilServiceType.ACTUALIZATION
        )
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetOrgSilServices).toHaveBeenCalledWith(123, {
        serviceType: OrgSilServiceType.ACTUALIZATION
      });

      expect(result.current.data).toHaveLength(2);
      expect(
        result.current.data?.every((service) => service.orgSilServiceId > 0)
      ).toBe(true);
    });

    it('returns empty array when API returns null', async () => {
      mockGetOrgSilServices.mockResolvedValue({
        data: null
      } as any);

      const { result } = renderHook(() =>
        orgSilServicesApi.getOrgSilServices(
          123,
          OrgSilServiceType.ACTUALIZATION
        )
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('returns empty array when API returns undefined', async () => {
      mockGetOrgSilServices.mockResolvedValue({
        data: undefined
      } as any);

      const { result } = renderHook(() =>
        orgSilServicesApi.getOrgSilServices(
          123,
          OrgSilServiceType.ACTUALIZATION
        )
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('returns empty array when API returns non-array data', async () => {
      mockGetOrgSilServices.mockResolvedValue({
        data: 'not an array'
      } as any);

      const { result } = renderHook(() =>
        orgSilServicesApi.getOrgSilServices(
          123,
          OrgSilServiceType.ACTUALIZATION
        )
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('query is disabled when organizationId is not provided', () => {
      const { result } = renderHook(() =>
        orgSilServicesApi.getOrgSilServices(0, OrgSilServiceType.ACTUALIZATION)
      );

      expect(result.current.isError).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(mockGetOrgSilServices).not.toHaveBeenCalled();
    });

    it('handles API errors correctly', async () => {
      const apiError = new Error('API Error');
      mockGetOrgSilServices.mockRejectedValue(apiError);

      const { result } = renderHook(() =>
        orgSilServicesApi.getOrgSilServices(
          123,
          OrgSilServiceType.ACTUALIZATION
        )
      );

      expect(mockGetOrgSilServices).toHaveBeenCalledWith(123, {
        serviceType: OrgSilServiceType.ACTUALIZATION
      });

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );

      if (result.current.isError) {
        expect(result.current.error).toEqual(apiError);
      } else {
        expect(result.current.data).toEqual([]);
      }
    });

    it('is disabled when organizationId is falsy', () => {
      const { result } = renderHook(() =>
        orgSilServicesApi.getOrgSilServices(0, OrgSilServiceType.ACTUALIZATION)
      );

      expect(result.current.isFetching).toBe(false);
      expect(mockGetOrgSilServices).not.toHaveBeenCalled();
    });

    it('retries only once on failure', async () => {
      mockGetOrgSilServices.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        orgSilServicesApi.getOrgSilServices(
          123,
          OrgSilServiceType.ACTUALIZATION
        )
      );

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );

      expect(mockGetOrgSilServices).toHaveBeenCalledTimes(2);
    });
  });

  describe('getNotificationServices', () => {
    it('calls getOrgSilServices with PAID_NOTIFICATION_OUTCOME type', async () => {
      mockGetOrgSilServices.mockResolvedValue({
        data: []
      } as any);

      const { result } = renderHook(() =>
        orgSilServicesApi.getNotificationServices(123)
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetOrgSilServices).toHaveBeenCalledWith(123, {
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME
      });
    });

    it('returns notification services successfully', async () => {
      const notificationServices: Array<OrgSilServiceDTO> = [
        {
          orgSilServiceId: 1,
          organizationId: 123,
          applicationName: 'Notification Service',
          serviceUrl: 'https://notifications.com',
          serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME
        }
      ];

      mockGetOrgSilServices.mockResolvedValue({
        data: notificationServices
      } as any);

      const { result } = renderHook(() =>
        orgSilServicesApi.getNotificationServices(123)
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(notificationServices);
    });
  });

  describe('getActualizationServices', () => {
    it('calls getOrgSilServices with ACTUALIZATION type', async () => {
      mockGetOrgSilServices.mockResolvedValue({
        data: []
      } as any);

      const { result } = renderHook(() =>
        orgSilServicesApi.getActualizationServices(123)
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetOrgSilServices).toHaveBeenCalledWith(123, {
        serviceType: OrgSilServiceType.ACTUALIZATION
      });
    });

    it('returns actualization services successfully', async () => {
      const actualizationServices: Array<OrgSilServiceDTO> = [
        {
          orgSilServiceId: 2,
          organizationId: 123,
          applicationName: 'Actualization Service',
          serviceUrl: 'https://actualization.com',
          serviceType: OrgSilServiceType.ACTUALIZATION
        }
      ];

      mockGetOrgSilServices.mockResolvedValue({
        data: actualizationServices
      } as any);

      const { result } = renderHook(() =>
        orgSilServicesApi.getActualizationServices(123)
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(actualizationServices);
    });
  });

  describe('edge cases and integration', () => {
    it('handles mixed valid and invalid services correctly', async () => {
      const mixedServices: Array<OrgSilServiceDTO> = [
        {
          orgSilServiceId: 1,
          organizationId: 123,
          applicationName: 'Valid Service',
          serviceUrl: 'https://valid.com',
          serviceType: OrgSilServiceType.ACTUALIZATION
        },
        {
          orgSilServiceId: null,
          organizationId: 123,
          applicationName: 'Null ID Service',
          serviceUrl: 'https://null.com',
          serviceType: OrgSilServiceType.ACTUALIZATION
        } as any,
        {
          orgSilServiceId: undefined,
          organizationId: 123,
          applicationName: 'Undefined ID Service',
          serviceUrl: 'https://undefined.com',
          serviceType: OrgSilServiceType.ACTUALIZATION
        } as any,
        {
          orgSilServiceId: 0,
          organizationId: 123,
          applicationName: 'Zero ID Service',
          serviceUrl: 'https://zero.com',
          serviceType: OrgSilServiceType.ACTUALIZATION
        },
        {
          orgSilServiceId: 2,
          organizationId: 123,
          applicationName: 'Another Valid Service',
          serviceUrl: 'https://valid2.com',
          serviceType: OrgSilServiceType.ACTUALIZATION
        }
      ];

      mockGetOrgSilServices.mockResolvedValue({
        data: mixedServices
      } as any);

      const { result } = renderHook(() =>
        orgSilServicesApi.getOrgSilServices(
          123,
          OrgSilServiceType.ACTUALIZATION
        )
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(2);
      expect(
        result.current.data?.every((service) => service.orgSilServiceId > 0)
      ).toBe(true);
      expect(result.current.data?.map((s) => s.applicationName)).toEqual([
        'Valid Service',
        'Another Valid Service'
      ]);
    });

    it('handles empty array from API', async () => {
      mockGetOrgSilServices.mockResolvedValue({
        data: []
      } as any);

      const { result } = renderHook(() =>
        orgSilServicesApi.getOrgSilServices(
          123,
          OrgSilServiceType.ACTUALIZATION
        )
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('validates services with extreme orgSilServiceId values', () => {
      const testCases = [
        { id: 1, expected: true },
        { id: 999999, expected: true },
        { id: 0.5, expected: true },
        { id: 0, expected: false },
        { id: -1, expected: false },
        { id: -999, expected: false },
        { id: null, expected: false },
        { id: undefined, expected: false }
      ];

      testCases.forEach(({ id, expected }) => {
        const service: OrgSilServiceDTO = {
          orgSilServiceId: id,
          organizationId: 123,
          applicationName: 'Test Service',
          serviceUrl: 'https://test.com',
          serviceType: OrgSilServiceType.ACTUALIZATION
        } as any;

        expect(isValidService(service)).toBe(expected);
      });
    });
  });
});
