/* eslint-disable sonarjs/no-nested-functions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOrgSilServiceForm } from './useOrgSilServiceForm';
import { OrgSilServiceType } from '../../../../generated/data-contracts';
import { OrgSilServiceFormData } from '../schema';
import { PageRoutes } from '../..';

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mockNavigate
}));

vi.mock('../../../api/orgSilService/index', () => ({
  default: {
    createOrgSilService: vi.fn()
  }
}));

vi.mock('../utils/orgSilServiceFormUtils', () => ({
  transformFormDataToDTO: vi.fn()
}));

import orgSilService from '../../../api/orgSilService/index';
import { transformFormDataToDTO } from '../utils/orgSilServiceFormUtils';

describe('useOrgSilServiceForm', () => {
  const organizationId = 123;
  const mockFormData: OrgSilServiceFormData = {
    applicationName: 'Test API',
    serviceUrl: 'https://test.api.com/v1',
    serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
    flagLegacy: false
  };

  const mockDTO = {
    applicationName: 'Test API',
    serviceUrl: 'https://test.api.com/v1',
    serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
    organizationId: 123,
    flagLegacy: false
  };

  const mockSuccessResponse = {
    applicationName: 'Test API',
    orgSilServiceId: 'service-123'
  };

  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(transformFormDataToDTO).mockReturnValue(mockDTO);
    mockMutateAsync.mockResolvedValue(mockSuccessResponse);

    vi.mocked(orgSilService.createOrgSilService).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    } as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.createService).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });

    it('should call createOrgSilService with correct organizationId', () => {
      renderHook(() => useOrgSilServiceForm({ organizationId }));

      expect(orgSilService.createOrgSilService).toHaveBeenCalledWith({
        organizationId
      });
    });
  });

  describe('Loading State', () => {
    it('should reflect loading state from mutation', () => {
      vi.mocked(orgSilService.createOrgSilService).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true
      } as any);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      expect(result.current.isLoading).toBe(true);
    });

    it('should reflect loading state changes between renders', () => {
      const { result, rerender } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      expect(result.current.isLoading).toBe(false);

      vi.mocked(orgSilService.createOrgSilService).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true
      } as any);

      rerender();
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Successful Service Creation', () => {
    it('should create service successfully and navigate to success page', async () => {
      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(transformFormDataToDTO).toHaveBeenCalledWith(
        mockFormData,
        organizationId
      );

      expect(mockMutateAsync).toHaveBeenCalledWith(mockDTO);

      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'org-sil-service-create',
          i18nParams: { applicationName: mockSuccessResponse.applicationName },
          orgSilServiceId: mockSuccessResponse.orgSilServiceId
        }
      });

      expect(result.current.error).toBeNull();
    });

    it('should clear error before creating service', async () => {
      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      act(() => {
        result.current.clearError();
      });

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle different service types correctly', async () => {
      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      const actualizationFormData = {
        ...mockFormData,
        serviceType: OrgSilServiceType.ACTUALIZATION
      };

      const actualizationDTO = {
        ...mockDTO,
        serviceType: OrgSilServiceType.ACTUALIZATION
      };

      vi.mocked(transformFormDataToDTO).mockReturnValue(actualizationDTO);

      await act(async () => {
        await result.current.createService(actualizationFormData);
      });

      expect(transformFormDataToDTO).toHaveBeenCalledWith(
        actualizationFormData,
        organizationId
      );
      expect(mockMutateAsync).toHaveBeenCalledWith(actualizationDTO);
    });
  });

  describe('Error Handling', () => {
    it('should handle mutation error and navigate to error page', async () => {
      const errorMessage = 'Service creation failed';
      const mockError = new Error(errorMessage);
      mockMutateAsync.mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(result.current.error).toBe(errorMessage);

      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR, {
        replace: true,
        state: { errorType: 'default' }
      });
    });

    it('should handle non-Error objects as generic error', async () => {
      const nonErrorObject = 'Something went wrong';
      mockMutateAsync.mockRejectedValue(nonErrorObject);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(result.current.error).toBe('Error during service creation');
      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR, {
        replace: true,
        state: { errorType: 'default' }
      });
    });

    it('should handle transformation error', async () => {
      const transformError = new Error('Transformation failed');
      vi.mocked(transformFormDataToDTO).mockImplementation(() => {
        throw transformError;
      });

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(result.current.error).toBe('Transformation failed');
      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR, {
        replace: true,
        state: { errorType: 'default' }
      });
    });

    it('should clear error when clearError is called', async () => {
      const mockError = new Error('Test error');
      mockMutateAsync.mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle legacy authentication data correctly', async () => {
      const legacyFormData: OrgSilServiceFormData = {
        applicationName: 'Legacy API',
        serviceUrl: 'https://legacy.api.com/v1',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
        flagLegacy: true,
        authConfigType: 'basic',
        basicUser: 'testuser',
        basicPassword: 'testpass',
        basicAuthURL: 'https://auth.legacy.com/basic'
      };

      const legacyDTO = {
        ...mockDTO,
        applicationName: 'Legacy API',
        serviceUrl: 'https://legacy.api.com/v1',
        flagLegacy: true,
        authConfigType: 'basic',
        basicUser: 'testuser',
        basicPassword: 'testpass',
        basicAuthURL: 'https://auth.legacy.com/basic'
      };

      vi.mocked(transformFormDataToDTO).mockReturnValue(legacyDTO);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      await act(async () => {
        await result.current.createService(legacyFormData);
      });

      expect(transformFormDataToDTO).toHaveBeenCalledWith(
        legacyFormData,
        organizationId
      );
      expect(mockMutateAsync).toHaveBeenCalledWith(legacyDTO);
    });

    it('should handle multiple rapid calls correctly', async () => {
      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      await act(async () => {
        const promises = [
          result.current.createService(mockFormData),
          result.current.createService(mockFormData),
          result.current.createService(mockFormData)
        ];
        await Promise.all(promises);
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(3);
      expect(transformFormDataToDTO).toHaveBeenCalledTimes(3);
    });

    it('should maintain error state between operations', async () => {
      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      mockMutateAsync.mockRejectedValueOnce(new Error('First error'));

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(result.current.error).toBe('First error');

      mockMutateAsync.mockResolvedValueOnce(mockSuccessResponse);

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Integration with Dependencies', () => {
    it('should pass organizationId correctly through the flow', async () => {
      const customOrgId = 456;

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId: customOrgId })
      );

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(orgSilService.createOrgSilService).toHaveBeenCalledWith({
        organizationId: customOrgId
      });
      expect(transformFormDataToDTO).toHaveBeenCalledWith(
        mockFormData,
        customOrgId
      );
    });

    it('should handle navigation state correctly', async () => {
      const customResponse = {
        applicationName: 'Custom API Service',
        orgSilServiceId: 'custom-service-456'
      };
      mockMutateAsync.mockResolvedValue(customResponse);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'org-sil-service-create',
          i18nParams: { applicationName: customResponse.applicationName },
          orgSilServiceId: customResponse.orgSilServiceId
        }
      });
    });

    it('should work with different organizationId values', () => {
      const orgIds = [1, 999, 12345];

      orgIds.forEach((orgId) => {
        renderHook(() => useOrgSilServiceForm({ organizationId: orgId }));

        expect(orgSilService.createOrgSilService).toHaveBeenCalledWith({
          organizationId: orgId
        });
      });
    });
  });

  describe('Error Edge Cases', () => {
    it('should handle null error objects', async () => {
      mockMutateAsync.mockRejectedValue(null);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(result.current.error).toBe('Error during service creation');
    });

    it('should handle undefined error objects', async () => {
      mockMutateAsync.mockRejectedValue(undefined);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(result.current.error).toBe('Error during service creation');
    });

    it('should handle errors during navigation', async () => {
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      await expect(async () => {
        await act(async () => {
          await result.current.createService(mockFormData);
        });
      }).rejects.toThrow('Navigation failed');

      expect(mockMutateAsync).toHaveBeenCalledWith(mockDTO);
    });
  });

  describe('Loading State Management', () => {
    it('should reflect isPending state from mutation', () => {
      vi.mocked(orgSilService.createOrgSilService).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true
      } as any);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      expect(result.current.isLoading).toBe(true);
    });

    it('should handle loading state transitions correctly', () => {
      const { result, rerender } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      expect(result.current.isLoading).toBe(false);

      vi.mocked(orgSilService.createOrgSilService).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true
      } as any);

      rerender();
      expect(result.current.isLoading).toBe(true);

      vi.mocked(orgSilService.createOrgSilService).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false
      } as any);

      rerender();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent state during async operations', async () => {
      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle rapid successive operations', async () => {
      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      const formData1 = { ...mockFormData, applicationName: 'API 1' };
      const formData2 = { ...mockFormData, applicationName: 'API 2' };

      await act(async () => {
        const promise1 = result.current.createService(formData1);
        const promise2 = result.current.createService(formData2);

        await Promise.all([promise1, promise2]);
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
      expect(result.current.error).toBeNull();
    });

    it('should handle async error recovery', async () => {
      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      mockMutateAsync.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(result.current.error).toBe('Network error');

      mockMutateAsync.mockResolvedValueOnce(mockSuccessResponse);

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(result.current.error).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith(
        PageRoutes.RESPONSES_SUCCESS,
        expect.any(Object)
      );
    });
  });
});
