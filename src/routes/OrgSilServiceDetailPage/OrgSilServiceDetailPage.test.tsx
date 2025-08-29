/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '../../__tests__/renderers';
import { useParams } from 'react-router';
import { AxiosError } from 'axios';
import OrgSilServiceDetailPage from './OrgSilServiceDetailPage';
import orgSilServiceApi from '../../api/orgSilService';
import { useStore } from '../../store/GlobalStore';
import { getOrgSilServiceSectionsConfig } from './model/OrgSilServiceSectionConfigs';
import {
  OrgSilServiceDecryptedDTO,
  OrgSilServiceType,
  JwtAlgorithm
} from '../../../generated/data-contracts';
import { STATE } from '../../store/types';
import { PageRoutes } from '..';
import utils from '../../utils';

const mockNavigate = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useParams: vi.fn(),
    useNavigate: () => mockNavigate,
    generatePath: vi.fn(
      (_route, params) => `/test-route/${params.orgSilServiceId}`
    )
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('../../api/orgSilService', () => ({
  default: {
    getOrgSilServiceById: vi.fn(),
    deleteOrgSilService: vi.fn()
  }
}));

vi.mock('../../store/GlobalStore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useStore: vi.fn()
  };
});

vi.mock('./model/OrgSilServiceSectionConfigs', () => ({
  getOrgSilServiceSectionsConfig: vi.fn()
}));

vi.mock('../../utils', () => ({
  default: {
    dialog: {
      open: vi.fn(),
      close: vi.fn(),
      status: {
        isDialogVisible: { value: false },
        dialogPayload: { value: { title: '', open: false } }
      }
    },
    config: {
      deployPath: '/piattaformaunitaria'
    },
    notify: {
      emit: vi.fn()
    }
  }
}));

const mockOrgSilService: OrgSilServiceDecryptedDTO = {
  orgSilServiceId: 1,
  applicationName: 'Test Payment Service',
  serviceUrl: 'https://api.payment.test.com/webhook',
  serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
  organizationId: 123,
  flagLegacy: false
};

const mockOrgSilServiceLegacy: OrgSilServiceDecryptedDTO = {
  ...mockOrgSilService,
  flagLegacy: true,
  legacyBasicAuthConfig: {
    authUrl: 'https://auth.test.com',
    user: 'testuser',
    authConfig: ''
  },
  legacyJwtAuthConfig: {
    kid: 'test-key-id',
    issuer: 'https://issuer.test.com',
    subject: 'test-subject',
    algorithm: JwtAlgorithm.ES256,
    signingKey: 'test-signing-key',
    authConfig: ''
  }
};

describe('OrgSilServiceDetailPage', () => {
  const mockUseParams = vi.mocked(useParams);
  const mockUseStore = vi.mocked(useStore);
  const mockGetOrgSilServiceById = vi.mocked(
    orgSilServiceApi.getOrgSilServiceById
  );
  const mockDeleteOrgSilService = vi.mocked(
    orgSilServiceApi.deleteOrgSilService
  );
  const mockGetSections = vi.mocked(getOrgSilServiceSectionsConfig);

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseParams.mockReturnValue({ orgSilServiceId: '1' });
    mockUseStore.mockReturnValue({
      state: { [STATE.ORGANIZATION_ID]: 123 }
    } as any);

    mockGetSections.mockReturnValue([
      {
        title: { label: 'Configurazione Generale', variant: 'h6' as const },
        data: [
          { label: 'Nome Applicazione', value: 'Test Payment Service' },
          {
            label: 'URL Servizio',
            value: 'https://api.payment.test.com/webhook'
          }
        ],
        inline: true,
        divider: false
      }
    ]);
  });

  it('renders OrgSilService Detail without crashing', () => {
    mockGetOrgSilServiceById.mockReturnValue({
      data: { response: mockOrgSilService },
      isSuccess: true,
      isLoading: false
    } as any);

    mockDeleteOrgSilService.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    } as any);

    render(<OrgSilServiceDetailPage />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Test Payment Service'
    );
    expect(
      screen.getByText('orgSilServiceDetail.description')
    ).toBeInTheDocument();

    const serviceNameElements = screen.getAllByText('Test Payment Service');
    expect(serviceNameElements).toHaveLength(2);
  });

  it('calls API with correct parameters', () => {
    mockGetOrgSilServiceById.mockReturnValue({
      data: { response: mockOrgSilService },
      isSuccess: true,
      isLoading: false
    } as any);

    mockDeleteOrgSilService.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    } as any);

    render(<OrgSilServiceDetailPage />);

    expect(mockGetOrgSilServiceById).toHaveBeenCalledWith({
      organizationId: 123,
      orgSilServiceId: 1
    });
  });

  it('calls sections config when data is loaded', async () => {
    mockGetOrgSilServiceById.mockReturnValue({
      data: { response: mockOrgSilService },
      isSuccess: true,
      isLoading: false
    } as any);

    mockDeleteOrgSilService.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    } as any);

    render(<OrgSilServiceDetailPage />);

    await waitFor(() => {
      expect(mockGetSections).toHaveBeenCalledWith(
        mockOrgSilService,
        expect.any(Function)
      );
    });
  });

  it('handles loading state correctly', () => {
    mockGetOrgSilServiceById.mockReturnValue({
      data: undefined,
      isSuccess: false,
      isLoading: true
    } as any);

    mockDeleteOrgSilService.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    } as any);

    render(<OrgSilServiceDetailPage />);

    expect(screen.getByText('-')).toBeInTheDocument();

    const editButton = screen.getByRole('button', { name: /commons.edit/i });
    const deleteButton = screen.getByRole('button', {
      name: /commons.delete/i
    });

    expect(editButton).not.toBeDisabled();
    expect(deleteButton).not.toBeDisabled();
  });

  it('handles edit button click', () => {
    mockGetOrgSilServiceById.mockReturnValue({
      data: { response: mockOrgSilService },
      isSuccess: true,
      isLoading: false
    } as any);

    mockDeleteOrgSilService.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    } as any);

    render(<OrgSilServiceDetailPage />);

    const editButton = screen.getByRole('button', { name: /commons.edit/i });
    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/test-route/1');
  });

  it('handles legacy service correctly', async () => {
    mockGetOrgSilServiceById.mockReturnValue({
      data: { response: mockOrgSilServiceLegacy },
      isSuccess: true,
      isLoading: false
    } as any);

    mockDeleteOrgSilService.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    } as any);

    render(<OrgSilServiceDetailPage />);

    await waitFor(() => {
      expect(mockGetSections).toHaveBeenCalledWith(
        mockOrgSilServiceLegacy,
        expect.any(Function)
      );
    });
  });

  it('handles different organization IDs', () => {
    mockUseStore.mockReturnValue({
      state: { [STATE.ORGANIZATION_ID]: 999 }
    } as any);

    mockGetOrgSilServiceById.mockReturnValue({
      data: { response: mockOrgSilService },
      isSuccess: true,
      isLoading: false
    } as any);

    mockDeleteOrgSilService.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    } as any);

    render(<OrgSilServiceDetailPage />);

    expect(mockGetOrgSilServiceById).toHaveBeenCalledWith({
      organizationId: 999,
      orgSilServiceId: 1
    });
  });

  it('handles API errors correctly', () => {
    mockGetOrgSilServiceById.mockReturnValue({
      data: null,
      isSuccess: false,
      isLoading: false,
      isError: true,
      error: new Error('API Error')
    } as any);

    mockDeleteOrgSilService.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    } as any);

    render(<OrgSilServiceDetailPage />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('handles different service types', async () => {
    const actualizationService = {
      ...mockOrgSilService,
      serviceType: OrgSilServiceType.ACTUALIZATION
    };

    mockGetOrgSilServiceById.mockReturnValue({
      data: { response: actualizationService },
      isSuccess: true,
      isLoading: false
    } as any);

    mockDeleteOrgSilService.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    } as any);

    render(<OrgSilServiceDetailPage />);

    await waitFor(() => {
      expect(mockGetSections).toHaveBeenCalledWith(
        actualizationService,
        expect.any(Function)
      );
    });
  });

  it('handles invalid parameters gracefully', () => {
    mockUseParams.mockReturnValue({ orgSilServiceId: undefined });

    mockGetOrgSilServiceById.mockReturnValue({
      data: { response: mockOrgSilService },
      isSuccess: true,
      isLoading: false
    } as any);

    mockDeleteOrgSilService.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false
    } as any);

    render(<OrgSilServiceDetailPage />);

    expect(mockGetOrgSilServiceById).toHaveBeenCalledWith({
      organizationId: 123,
      orgSilServiceId: NaN
    });
  });

  describe('Delete functionality', () => {
    it('should show delete dialog when delete button is clicked', () => {
      mockGetOrgSilServiceById.mockReturnValue({
        data: { response: mockOrgSilService },
        isSuccess: true,
        isLoading: false
      } as any);

      mockDeleteOrgSilService.mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false
      } as any);

      render(<OrgSilServiceDetailPage />);

      const deleteButton = screen.getByRole('button', {
        name: /commons.delete/i
      });
      fireEvent.click(deleteButton);

      expect(utils.dialog.open).toHaveBeenCalledWith({
        title: 'orgSilServiceDetail.delete.title',
        message: 'orgSilServiceDetail.delete.message',
        confirmLabel: 'commons.delete',
        cancelLabel: 'commons.cancel',
        onConfirm: expect.any(Function),
        onClose: expect.any(Function),
        'data-testid': 'delete-orgSilService-dialog'
      });
    });

    it('should delete service successfully and navigate back', async () => {
      mockGetOrgSilServiceById.mockReturnValue({
        data: { response: mockOrgSilService },
        isSuccess: true,
        isLoading: false
      } as any);

      const mockDeleteMutation = {
        mutateAsync: vi.fn().mockResolvedValue({ success: true }),
        isPending: false
      };

      mockDeleteOrgSilService.mockReturnValue(mockDeleteMutation as any);

      render(<OrgSilServiceDetailPage />);

      const deleteButton = screen.getByRole('button', {
        name: /commons.delete/i
      });
      fireEvent.click(deleteButton);

      const dialogOpenCalls = vi.mocked(utils.dialog.open).mock.calls;
      const lastCall = dialogOpenCalls[dialogOpenCalls.length - 1];
      const onConfirm = lastCall?.[0]?.onConfirm;

      if (onConfirm) {
        onConfirm();
      }

      await waitFor(() => {
        expect(mockDeleteMutation.mutateAsync).toHaveBeenCalledWith(1);
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        PageRoutes.ORG_SIL_SERVICE_INDEX
      );
    });

    it('should handle 409 conflict error and show conflict dialog', async () => {
      mockGetOrgSilServiceById.mockReturnValue({
        data: { response: mockOrgSilService },
        isSuccess: true,
        isLoading: false
      } as any);

      const conflictError = new AxiosError(
        'Conflict',
        '409',
        undefined,
        undefined,
        {
          status: 409,
          statusText: 'Conflict',
          data: {},
          headers: {},
          config: {}
        } as any
      );

      const mockDeleteMutation = {
        mutateAsync: vi.fn().mockRejectedValue(conflictError),
        isPending: false
      };

      mockDeleteOrgSilService.mockReturnValue(mockDeleteMutation as any);

      render(<OrgSilServiceDetailPage />);

      const deleteButton = screen.getByRole('button', {
        name: /commons.delete/i
      });
      fireEvent.click(deleteButton);

      const dialogOpenCalls = vi.mocked(utils.dialog.open).mock.calls;
      const deleteDialogCall = dialogOpenCalls[0];
      const onConfirm = deleteDialogCall?.[0]?.onConfirm;

      if (onConfirm) {
        onConfirm();
      }

      await waitFor(() => {
        expect(mockDeleteMutation.mutateAsync).toHaveBeenCalledWith(1);
      });

      expect(utils.dialog.open).toHaveBeenCalledTimes(2);
      expect(utils.dialog.open).toHaveBeenLastCalledWith({
        title: 'orgSilServiceDetail.delete.conflict.title',
        message: 'orgSilServiceDetail.delete.conflictMessage',
        confirmLabel: 'commons.close',
        onConfirm: expect.any(Function),
        onClose: expect.any(Function),
        'data-testid': 'conflict-error-dialog'
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle generic delete errors silently', async () => {
      mockGetOrgSilServiceById.mockReturnValue({
        data: { response: mockOrgSilService },
        isSuccess: true,
        isLoading: false
      } as any);

      const genericError = new Error('Generic API error');

      const mockDeleteMutation = {
        mutateAsync: vi.fn().mockRejectedValue(genericError),
        isPending: false
      };

      mockDeleteOrgSilService.mockReturnValue(mockDeleteMutation as any);

      render(<OrgSilServiceDetailPage />);

      const deleteButton = screen.getByRole('button', {
        name: /commons.delete/i
      });
      fireEvent.click(deleteButton);

      const dialogOpenCalls = vi.mocked(utils.dialog.open).mock.calls;
      const deleteDialogCall = dialogOpenCalls[0];
      const onConfirm = deleteDialogCall?.[0]?.onConfirm;

      if (onConfirm) {
        onConfirm();
      }

      await waitFor(() => {
        expect(mockDeleteMutation.mutateAsync).toHaveBeenCalledWith(1);
      });

      expect(utils.dialog.open).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should disable delete button during deletion', () => {
      mockGetOrgSilServiceById.mockReturnValue({
        data: { response: mockOrgSilService },
        isSuccess: true,
        isLoading: false
      } as any);

      mockDeleteOrgSilService.mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: true
      } as any);

      render(<OrgSilServiceDetailPage />);

      const deleteButton = screen.getByRole('button', {
        name: /commons.delete/i
      });
      expect(deleteButton).toBeDisabled();
    });

    it('should not proceed with delete if orgSilServiceId is missing', async () => {
      mockUseParams.mockReturnValue({ orgSilServiceId: undefined });

      mockGetOrgSilServiceById.mockReturnValue({
        data: { response: mockOrgSilService },
        isSuccess: true,
        isLoading: false
      } as any);

      const mockDeleteMutation = {
        mutateAsync: vi.fn(),
        isPending: false
      };

      mockDeleteOrgSilService.mockReturnValue(mockDeleteMutation as any);

      render(<OrgSilServiceDetailPage />);

      const deleteButton = screen.getByRole('button', {
        name: /commons.delete/i
      });
      fireEvent.click(deleteButton);

      const dialogOpenCalls = vi.mocked(utils.dialog.open).mock.calls;
      const deleteDialogCall = dialogOpenCalls[0];
      const onConfirm = deleteDialogCall?.[0]?.onConfirm;

      if (onConfirm) {
        onConfirm();
      }

      await waitFor(() => {
        expect(mockDeleteMutation.mutateAsync).not.toHaveBeenCalled();
      });
    });

    it('should initialize delete mutation with correct organization ID', () => {
      mockGetOrgSilServiceById.mockReturnValue({
        data: { response: mockOrgSilService },
        isSuccess: true,
        isLoading: false
      } as any);

      mockDeleteOrgSilService.mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false
      } as any);

      render(<OrgSilServiceDetailPage />);

      expect(mockDeleteOrgSilService).toHaveBeenCalledWith({
        organizationId: 123
      });
    });
  });
});
