/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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
    createOrgSilService: vi.fn(),
    updateOrgSilService: vi.fn()
  }
}));

vi.mock('../utils/orgSilServiceFormUtils', () => ({
  transformFormDataToDTO: vi.fn()
}));

import orgSilService from '../../../api/orgSilService/index';
import { transformFormDataToDTO } from '../utils/orgSilServiceFormUtils';
import { act, renderHook } from '../../../__tests__/renderers';

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

  const mockCreateMutateAsync = vi.fn();
  const mockUpdateMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(transformFormDataToDTO).mockReturnValue(mockDTO);
    mockCreateMutateAsync.mockResolvedValue(mockSuccessResponse);
    mockUpdateMutateAsync.mockResolvedValue(mockSuccessResponse);

    vi.mocked(orgSilService.createOrgSilService).mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: false
    } as any);

    vi.mocked(orgSilService.updateOrgSilService).mockReturnValue({
      mutateAsync: mockUpdateMutateAsync,
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
      expect(typeof result.current.updateService).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });

    it('should call both createOrgSilService and updateOrgSilService with correct organizationId', () => {
      renderHook(() => useOrgSilServiceForm({ organizationId }));

      expect(orgSilService.createOrgSilService).toHaveBeenCalledWith({
        organizationId
      });
      expect(orgSilService.updateOrgSilService).toHaveBeenCalledWith({
        organizationId
      });
    });
  });

  describe('Loading State', () => {
    it('should reflect loading state from create mutation', () => {
      vi.mocked(orgSilService.createOrgSilService).mockReturnValue({
        mutateAsync: mockCreateMutateAsync,
        isPending: true
      } as any);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      expect(result.current.isLoading).toBe(true);
    });

    it('should reflect loading state from update mutation', () => {
      vi.mocked(orgSilService.updateOrgSilService).mockReturnValue({
        mutateAsync: mockUpdateMutateAsync,
        isPending: true
      } as any);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      expect(result.current.isLoading).toBe(true);
    });

    it('should reflect loading state from both mutations', () => {
      vi.mocked(orgSilService.createOrgSilService).mockReturnValue({
        mutateAsync: mockCreateMutateAsync,
        isPending: true
      } as any);

      vi.mocked(orgSilService.updateOrgSilService).mockReturnValue({
        mutateAsync: mockUpdateMutateAsync,
        isPending: true
      } as any);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

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

      expect(mockCreateMutateAsync).toHaveBeenCalledWith(mockDTO);

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

      mockCreateMutateAsync.mockRejectedValueOnce(new Error('Initial error'));
      await act(async () => {
        await result.current.createService(mockFormData);
      });
      expect(result.current.error).toBe('Initial error');

      mockCreateMutateAsync.mockResolvedValueOnce(mockSuccessResponse);
      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Successful Service Update', () => {
    it('should update service successfully and navigate to success page', async () => {
      const updateFormData = { ...mockFormData, orgSilServiceId: 456 };
      const expectedDTO = { ...mockDTO, orgSilServiceId: 456 };

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      await act(async () => {
        await result.current.updateService(updateFormData);
      });

      expect(transformFormDataToDTO).toHaveBeenCalledWith(
        updateFormData,
        organizationId
      );

      expect(mockUpdateMutateAsync).toHaveBeenCalledWith(expectedDTO);

      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'org-sil-service-edit',
          i18nParams: { applicationName: mockSuccessResponse.applicationName },
          orgSilServiceId: mockSuccessResponse.orgSilServiceId
        }
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle missing updateMutation gracefully', async () => {
      vi.mocked(orgSilService.updateOrgSilService).mockReturnValue(null as any);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.updateService).toBe('function');

      const updateFormData = { ...mockFormData, orgSilServiceId: 456 };

      await act(async () => {
        await result.current.updateService(updateFormData);
      });

      expect(result.current.error).toBe('Update functionality not available');
      expect(mockUpdateMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle create mutation error and set error state', async () => {
      const errorMessage = 'Service creation failed';
      const mockError = new Error(errorMessage);
      mockCreateMutateAsync.mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle update mutation error and set error state', async () => {
      const errorMessage = 'Service update failed';
      const mockError = new Error(errorMessage);
      mockUpdateMutateAsync.mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      const updateFormData = { ...mockFormData, orgSilServiceId: 456 };

      await act(async () => {
        await result.current.updateService(updateFormData);
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle non-Error objects as generic error', async () => {
      const nonErrorObject = 'Something went wrong';
      mockCreateMutateAsync.mockRejectedValue(nonErrorObject);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(result.current.error).toBe('Error during service creation');
    });

    it('should clear error when clearError is called', async () => {
      const mockError = new Error('Test error');
      mockCreateMutateAsync.mockRejectedValue(mockError);

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
        legacyBasicAuthConfig: {
          authUrl: 'https://auth.legacy.com/basic',
          user: 'testuser',
          psw: 'testpass',
          authConfig: 'legacyBasic'
        }
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
      expect(mockCreateMutateAsync).toHaveBeenCalledWith(legacyDTO);
    });

    it('should maintain error state between operations', async () => {
      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      mockCreateMutateAsync.mockRejectedValueOnce(new Error('First error'));

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(result.current.error).toBe('First error');

      mockCreateMutateAsync.mockResolvedValueOnce(mockSuccessResponse);

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Integration with Dependencies', () => {
    it('should pass organizationId correctly through both mutations', async () => {
      const customOrgId = 456;

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId: customOrgId })
      );

      expect(orgSilService.createOrgSilService).toHaveBeenCalledWith({
        organizationId: customOrgId
      });
      expect(orgSilService.updateOrgSilService).toHaveBeenCalledWith({
        organizationId: customOrgId
      });

      await act(async () => {
        await result.current.createService(mockFormData);
      });

      expect(transformFormDataToDTO).toHaveBeenCalledWith(
        mockFormData,
        customOrgId
      );
    });

    it('should handle navigation state correctly for create', async () => {
      const customResponse = {
        applicationName: 'Custom API Service',
        orgSilServiceId: 'custom-service-456'
      };
      mockCreateMutateAsync.mockResolvedValue(customResponse);

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

    it('should handle navigation state correctly for update', async () => {
      const customResponse = {
        applicationName: 'Updated API Service',
        orgSilServiceId: 'updated-service-789'
      };
      mockUpdateMutateAsync.mockResolvedValue(customResponse);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      const updateFormData = { ...mockFormData, orgSilServiceId: 789 };

      await act(async () => {
        await result.current.updateService(updateFormData);
      });

      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'org-sil-service-edit',
          i18nParams: { applicationName: customResponse.applicationName },
          orgSilServiceId: customResponse.orgSilServiceId
        }
      });
    });
  });

  describe('Loading State Management', () => {
    it('should reflect isPending state from both mutations', () => {
      vi.mocked(orgSilService.createOrgSilService).mockReturnValue({
        mutateAsync: mockCreateMutateAsync,
        isPending: false
      } as any);

      vi.mocked(orgSilService.updateOrgSilService).mockReturnValue({
        mutateAsync: mockUpdateMutateAsync,
        isPending: true
      } as any);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      expect(result.current.isLoading).toBe(true);
    });

    it('should be false when both mutations are not pending', () => {
      vi.mocked(orgSilService.createOrgSilService).mockReturnValue({
        mutateAsync: mockCreateMutateAsync,
        isPending: false
      } as any);

      vi.mocked(orgSilService.updateOrgSilService).mockReturnValue({
        mutateAsync: mockUpdateMutateAsync,
        isPending: false
      } as any);

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Error Edge Cases', () => {
    it('should handle transformation error in create', async () => {
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
    });

    it('should handle transformation error in update', async () => {
      const transformError = new Error('Update transformation failed');
      vi.mocked(transformFormDataToDTO).mockImplementation(() => {
        throw transformError;
      });

      const { result } = renderHook(() =>
        useOrgSilServiceForm({ organizationId })
      );

      const updateFormData = { ...mockFormData, orgSilServiceId: 456 };

      await act(async () => {
        await result.current.updateService(updateFormData);
      });

      expect(result.current.error).toBe('Update transformation failed');
    });
  });
});
