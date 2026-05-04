/* eslint-disable sonarjs/no-nested-functions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '../../../__tests__/renderers';
import {
  useOrgSilServices,
  useActualizationServices,
  useNotificationServices
} from './useOrgSilServices';
import { OrgSilServiceType } from '../../../../generated/data-contracts';
import { setOrganizationId } from '../../../store/OrganizationIdStore';

vi.mock('../../../api/orgSilServices', () => ({
  default: {
    getOrgSilServices: vi.fn()
  }
}));

import orgSilServicesApi from '../../../api/orgSilServices';

const mockGetOrgSilServices = vi.mocked(orgSilServicesApi.getOrgSilServices);

describe('useOrgSilServices', () => {
  const mockOrganizationId = 123;
  const mockQueryResult = {
    data: [
      { orgSilServiceId: 1, applicationName: 'Test Service 1' },
      { orgSilServiceId: 2, applicationName: 'Test Service 2' }
    ],
    isLoading: false,
    isError: false,
    error: null
  };

  beforeEach(() => {
    vi.clearAllMocks();

    setOrganizationId(mockOrganizationId);

    mockGetOrgSilServices.mockReturnValue(mockQueryResult as any);
  });

  describe('useOrgSilServices', () => {
    it('calls getOrgSilServices with correct parameters', () => {
      const serviceType = OrgSilServiceType.ACTUALIZATION;

      renderHook(() => useOrgSilServices(serviceType));

      expect(mockGetOrgSilServices).toHaveBeenCalledWith(
        mockOrganizationId,
        serviceType
      );
      expect(mockGetOrgSilServices).toHaveBeenCalledTimes(1);
    });

    it('returns the result from getOrgSilServices', () => {
      const serviceType = OrgSilServiceType.PAID_NOTIFICATION_OUTCOME;

      const { result } = renderHook(() => useOrgSilServices(serviceType));

      expect(result.current).toBe(mockQueryResult);
    });

    it('uses organizationId from store', () => {
      const differentOrgId = 456;
      setOrganizationId(differentOrgId);

      const serviceType = OrgSilServiceType.ACTUALIZATION;

      renderHook(() => useOrgSilServices(serviceType));

      expect(mockGetOrgSilServices).toHaveBeenCalledWith(
        differentOrgId,
        serviceType
      );
    });

    it('handles different service types', () => {
      const serviceTypes = [
        OrgSilServiceType.ACTUALIZATION,
        OrgSilServiceType.PAID_NOTIFICATION_OUTCOME
      ];

      serviceTypes.forEach((serviceType) => {
        const { unmount } = renderHook(() => useOrgSilServices(serviceType));

        expect(mockGetOrgSilServices).toHaveBeenCalledWith(
          mockOrganizationId,
          serviceType
        );

        unmount();
        vi.clearAllMocks();
      });
    });
  });

  describe('useActualizationServices', () => {
    it('calls useOrgSilServices with ACTUALIZATION service type', () => {
      renderHook(() => useActualizationServices());

      expect(mockGetOrgSilServices).toHaveBeenCalledWith(
        mockOrganizationId,
        OrgSilServiceType.ACTUALIZATION
      );
    });

    it('returns the same result as useOrgSilServices', () => {
      const { result: actualResult } = renderHook(() =>
        useActualizationServices()
      );
      const { result: expectedResult } = renderHook(() =>
        useOrgSilServices(OrgSilServiceType.ACTUALIZATION)
      );

      expect(actualResult.current).toEqual(expectedResult.current);
    });
  });

  describe('useNotificationServices', () => {
    it('calls useOrgSilServices with PAID_NOTIFICATION_OUTCOME service type', () => {
      renderHook(() => useNotificationServices());

      expect(mockGetOrgSilServices).toHaveBeenCalledWith(
        mockOrganizationId,
        OrgSilServiceType.PAID_NOTIFICATION_OUTCOME
      );
    });

    it('returns the same result as useOrgSilServices', () => {
      const { result: actualResult } = renderHook(() =>
        useNotificationServices()
      );
      const { result: expectedResult } = renderHook(() =>
        useOrgSilServices(OrgSilServiceType.PAID_NOTIFICATION_OUTCOME)
      );

      expect(actualResult.current).toEqual(expectedResult.current);
    });
  });

  describe('Edge Cases', () => {
    it('handles missing organizationId gracefully', () => {
      setOrganizationId(0);

      renderHook(() => useOrgSilServices(OrgSilServiceType.ACTUALIZATION));

      expect(mockGetOrgSilServices).toHaveBeenCalledWith(
        0,
        OrgSilServiceType.ACTUALIZATION
      );
    });

    it('handles zero organizationId', () => {
      setOrganizationId(0);

      renderHook(() => useOrgSilServices(OrgSilServiceType.ACTUALIZATION));

      expect(mockGetOrgSilServices).toHaveBeenCalledWith(
        0,
        OrgSilServiceType.ACTUALIZATION
      );
    });

    it('handles API errors gracefully', () => {
      const errorResult = {
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('API Error')
      };

      mockGetOrgSilServices.mockReturnValue(errorResult as any);

      const { result } = renderHook(() =>
        useOrgSilServices(OrgSilServiceType.ACTUALIZATION)
      );

      expect(result.current).toBe(errorResult);
    });

    it('handles loading state', () => {
      const loadingResult = {
        data: undefined,
        isLoading: true,
        isError: false,
        error: null
      };

      mockGetOrgSilServices.mockReturnValue(loadingResult as any);

      const { result } = renderHook(() =>
        useOrgSilServices(OrgSilServiceType.ACTUALIZATION)
      );

      expect(result.current).toBe(loadingResult);
    });
  });

  describe('Hook Consistency', () => {
    it('both convenience hooks use the same base hook', () => {
      renderHook(() => useActualizationServices());
      renderHook(() => useNotificationServices());

      expect(mockGetOrgSilServices).toHaveBeenCalledTimes(2);
      expect(mockGetOrgSilServices).toHaveBeenCalledWith(
        mockOrganizationId,
        OrgSilServiceType.ACTUALIZATION
      );
      expect(mockGetOrgSilServices).toHaveBeenCalledWith(
        mockOrganizationId,
        OrgSilServiceType.PAID_NOTIFICATION_OUTCOME
      );
    });

    it('convenience hooks call the base hook with correct service types', () => {
      const { result: actualizationResult } = renderHook(() =>
        useActualizationServices()
      );
      const { result: notificationResult } = renderHook(() =>
        useNotificationServices()
      );

      expect(actualizationResult.current).toEqual(mockQueryResult);
      expect(notificationResult.current).toEqual(mockQueryResult);

      expect(mockGetOrgSilServices).toHaveBeenCalledWith(
        mockOrganizationId,
        OrgSilServiceType.ACTUALIZATION
      );
      expect(mockGetOrgSilServices).toHaveBeenCalledWith(
        mockOrganizationId,
        OrgSilServiceType.PAID_NOTIFICATION_OUTCOME
      );
    });
  });
});
