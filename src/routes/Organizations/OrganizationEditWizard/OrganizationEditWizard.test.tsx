/**
 * Tests for OrganizationEditWizard component
 * Tests the unified form container that loads organization data and renders OrganizationEditForm
 */

import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import { randomUUID } from 'node:crypto';
import { render, screen, waitFor } from '../../../__tests__/renderers';
import {
  getOrganizationDetail,
  updateOrganization
} from '../../../api/organizations';
import { useNavigate, useParams, generatePath } from 'react-router';
import { useStore } from '../../../store/GlobalStore';
import OrganizationEditWizard from './OrganizationEditWizard';
import utils from '../../../utils';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { OrganizationStatus } from '../../../../generated/core/data-contracts';
import { UnifiedFormData } from '../../../models/OrganizationEditTypes';

vi.mock('../../../api/organizations', () => ({
  getOrganizationDetail: vi.fn(),
  updateOrganization: vi.fn()
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
    generatePath: vi.fn()
  };
});

vi.mock('../../../store/GlobalStore', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../store/GlobalStore')>();
  return {
    ...actual,
    useStore: vi.fn()
  };
});

vi.mock('../../../utils', () => ({
  default: {
    notify: {
      emit: vi.fn()
    },
    config: {
      deployPath: ''
    }
  }
}));

vi.mock('../../../utils/organizationFormTransformers', () => ({
  transformApiDataToFormData: vi.fn((data) => {
    return {
      orgName: { value: data.orgName || '', readonly: true },
      orgFiscalCode: { value: data.orgFiscalCode || '', readonly: true },
      orgEmail: { value: data.orgEmail || '', readonly: false },
      orgLogo: { value: data.orgLogo || null, readonly: false },
      logoRemoved: false,
      iban: { value: data.iban || '', readonly: false },
      ibanPostal: { value: data.postalIban || '', readonly: false },
      cbill: { value: data.cbillInterBankCode || '', readonly: false },
      flagTreasury: { value: data.flagTreasury ?? false, readonly: false },
      segregationCode: { value: data.segregationCode || '', readonly: false },
      generateNoticeApiKey: {
        value: data.generateNoticeApiKey || '',
        readonly: false
      },
      additionalLanguage: {
        value: !!data.additionalLanguage,
        readonly: false
      },
      selectedLanguage: {
        value: data.additionalLanguage?.toLowerCase() || '',
        readonly: false
      },
      flagNotifyOutcomePush: {
        value: data.flagNotifyOutcomePush ?? null,
        readonly: false
      },
      flagPaymentNotification: {
        value: data.flagPaymentNotification ?? null,
        readonly: false
      },
      flagNotifyIo: { value: data.flagNotifyIo ?? false, readonly: false },
      ioApiKey: { value: data.ioApiKey || '', readonly: false },
      pdndEnabled: { value: data.pdndEnabled ?? false, readonly: false },
      sendApiKey: { value: data.sendApiKey || '', readonly: false },
      organizationStatus: data.status
    } as UnifiedFormData;
  })
}));

vi.mock('./components/OrganizationEditForm', () => ({
  OrganizationEditForm: ({
    formData,
    organizationId
  }: {
    formData: UnifiedFormData;
    organizationId: number;
    originalData: unknown;
  }) => (
    <div data-testid="organization-edit-form">
      <div data-testid="form-organization-id">{organizationId}</div>
      <div data-testid="form-organization-name">{formData.orgName.value}</div>
      <div data-testid="form-organization-status">
        {formData.organizationStatus}
      </div>
    </div>
  )
}));

describe('OrganizationEditWizard', () => {
  const mockNavigate = vi.fn();
  const mockGeneratePath = vi.fn();
  const mockGetOrganizationDetail = getOrganizationDetail as Mock;
  const mockUpdateOrganization = updateOrganization as Mock;
  const mockUseParams = useParams as Mock;
  const mockUseNavigate = useNavigate as Mock;
  const mockUseStore = useStore as Mock;

  const organizationDetailMock = {
    organizationId: 33,
    flagTreasury: false,
    externalOrganizationId: 'EXT123',
    ipaCode: 'IPA_TEST',
    orgFiscalCode: '99999999990',
    orgName: 'Ente P4PA intermediato 1',
    orgTypeCode: '03',
    orgEmail: 'enteditest@email.it',
    postalIban: 'IT60X0542811101000000123456',
    iban: 'IT111',
    password: randomUUID(),
    segregationCode: '00',
    cbillInterBankCode: 'CBILL001',
    orgLogo: 'data:image/png;base64,iVBORw0KGgo...',
    status: OrganizationStatus.ACTIVE,
    additionalLanguage: 'EN',
    startDate: '2024-12-19',
    brokerId: 1,
    ioApiKey: '111',
    sendApiKey: '222',
    generateNoticeApiKey: '333',
    flagNotifyIo: true,
    flagNotifyOutcomePush: false,
    flagPaymentNotification: false,
    pdndEnabled: false
  };

  const translations = {
    organizationEditWizard: {
      title: 'Modifica Ente',
      description: 'Modifica i dati del tuo ente',
      errorLoadingData: 'Errore nel caricamento dei dati',
      successMessage: 'Ente aggiornato con successo',
      updateError: "Errore durante l'aggiornamento",
      titleCreate: 'Configura ente gestito',
      titleEdit: 'Modifica ente gestito',
      descriptionCreate:
        "Inserisci le informazioni e le configurazioni relative all'ente intermediato.",
      descriptionEdit:
        "Aggiorna le informazioni e le configurazioni relative all'ente intermediato.",
      step1: {
        label: 'Anagrafica Ente',
        title: 'Anagrafica Ente'
      },
      step2: {
        label: 'Configurazione Ente',
        title: 'Configurazione Ente'
      }
    },
    commons: {
      back: 'Indietro',
      continue: 'Continua',
      requiredFieldDescription: '* Indica un campo obbligatorio'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup(translations);

    mockUseParams.mockReturnValue({ organizationId: '33' });
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseStore.mockReturnValue({
      state: {
        organizationId: '33'
      }
    });

    mockGeneratePath.mockImplementation(
      (path: string, params?: Record<string, string>) => {
        if (params?.organizationId) {
          return path.replace(':organizationId', params.organizationId);
        }
        return path;
      }
    );
    (generatePath as Mock).mockImplementation(mockGeneratePath);

    mockGetOrganizationDetail.mockReturnValue({
      data: organizationDetailMock,
      isLoading: false,
      isSuccess: true,
      isError: false
    });

    mockUpdateOrganization.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({})
    });

    vi.mocked(utils.notify.emit).mockClear();
  });

  describe('Rendering and UI', () => {
    it('should render OrganizationEditForm when data is loaded', async () => {
      render(<OrganizationEditWizard />);

      await waitFor(() => {
        expect(
          screen.getByTestId('organization-edit-form')
        ).toBeInTheDocument();
      });
    });

    it('should pass correct organizationId to OrganizationEditForm', async () => {
      render(<OrganizationEditWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('form-organization-id')).toHaveTextContent(
          '33'
        );
      });
    });

    it('should pass transformed formData to OrganizationEditForm', async () => {
      render(<OrganizationEditWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('form-organization-name')).toHaveTextContent(
          'Ente P4PA intermediato 1'
        );
      });
    });

    it('should pass organization status to OrganizationEditForm', async () => {
      render(<OrganizationEditWizard />);

      await waitFor(() => {
        expect(
          screen.getByTestId('form-organization-status')
        ).toHaveTextContent('ACTIVE');
      });
    });
  });

  describe('Data Loading', () => {
    it('should load organization detail on mount', () => {
      render(<OrganizationEditWizard />);

      expect(mockGetOrganizationDetail).toHaveBeenCalledWith(33);
    });

    it('should handle loading state - not render form while loading', () => {
      mockGetOrganizationDetail.mockReturnValue({
        data: undefined,
        isLoading: true,
        isSuccess: false,
        isError: false
      });

      render(<OrganizationEditWizard />);

      expect(
        screen.queryByTestId('organization-edit-form')
      ).not.toBeInTheDocument();
    });

    it('should handle error state', async () => {
      mockGetOrganizationDetail.mockReturnValue({
        data: undefined,
        isLoading: false,
        isSuccess: false,
        isError: true
      });

      render(<OrganizationEditWizard />);

      await waitFor(() => {
        expect(utils.notify.emit).toHaveBeenCalledWith(
          'Errore nel caricamento dei dati',
          'error'
        );
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it('should transform API data to form data when organization detail loads', async () => {
      const { transformApiDataToFormData } = await import(
        '../../../utils/organizationFormTransformers'
      );

      render(<OrganizationEditWizard />);

      await waitFor(() => {
        expect(transformApiDataToFormData).toHaveBeenCalledWith(
          organizationDetailMock
        );
      });
    });
  });

  describe('Store Integration', () => {
    it('should use organizationId from URL params', () => {
      render(<OrganizationEditWizard />);

      expect(mockGetOrganizationDetail).toHaveBeenCalledWith(33);
    });

    it('should handle missing organizationId in URL params', () => {
      mockUseParams.mockReturnValueOnce({ organizationId: undefined });
      mockUseStore.mockReturnValueOnce({
        state: {
          organizationId: 42
        }
      });

      render(<OrganizationEditWizard />);

      expect(mockGetOrganizationDetail).toHaveBeenCalledWith(42);
    });

    it('should prioritize URL params over store organizationId', () => {
      mockUseParams.mockReturnValueOnce({ organizationId: '99' });
      mockUseStore.mockReturnValueOnce({
        state: {
          organizationId: 42
        }
      });

      render(<OrganizationEditWizard />);

      expect(mockGetOrganizationDetail).toHaveBeenCalledWith(99);
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle component unmount gracefully', () => {
      const { unmount } = render(<OrganizationEditWizard />);

      expect(() => unmount()).not.toThrow();
    });

    it('should not re-render form if data is already ready', async () => {
      const { rerender } = render(<OrganizationEditWizard />);

      await waitFor(() => {
        expect(
          screen.getByTestId('organization-edit-form')
        ).toBeInTheDocument();
      });

      const initialRenderCount = screen.getAllByTestId(
        'organization-edit-form'
      ).length;

      rerender(<OrganizationEditWizard />);

      expect(screen.getAllByTestId('organization-edit-form')).toHaveLength(
        initialRenderCount
      );
    });
  });

  describe('Data Transformation', () => {
    it('should handle null values in organization detail', async () => {
      const dataWithNulls = {
        ...organizationDetailMock,
        orgLogo: null,
        additionalLanguage: null
      };

      mockGetOrganizationDetail.mockReturnValue({
        data: dataWithNulls,
        isLoading: false,
        isSuccess: true,
        isError: false
      });

      render(<OrganizationEditWizard />);

      await waitFor(() => {
        expect(
          screen.getByTestId('organization-edit-form')
        ).toBeInTheDocument();
      });
    });

    it('should handle DRAFT organization status', async () => {
      const draftData = {
        ...organizationDetailMock,
        status: OrganizationStatus.DRAFT
      };

      mockGetOrganizationDetail.mockReturnValue({
        data: draftData,
        isLoading: false,
        isSuccess: true,
        isError: false
      });

      render(<OrganizationEditWizard />);

      await waitFor(() => {
        expect(
          screen.getByTestId('form-organization-status')
        ).toHaveTextContent('DRAFT');
      });
    });
  });

  describe('URL Parameters', () => {
    it('should parse organizationId from URL params correctly', () => {
      mockUseParams.mockReturnValue({ organizationId: '123' });

      render(<OrganizationEditWizard />);

      expect(mockGetOrganizationDetail).toHaveBeenCalledWith(123);
    });

    it('should handle invalid organizationId format in URL', () => {
      mockUseParams.mockReturnValueOnce({ organizationId: 'invalid' });
      mockUseStore.mockReturnValueOnce({
        state: {
          organizationId: 42
        }
      });

      render(<OrganizationEditWizard />);

      expect(mockGetOrganizationDetail).toHaveBeenCalledWith(42);
    });
  });

  describe('Error Handling', () => {
    it('should navigate to organization detail page on error', async () => {
      mockGetOrganizationDetail.mockReturnValue({
        data: undefined,
        isLoading: false,
        isSuccess: false,
        isError: true
      });

      render(<OrganizationEditWizard />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
        expect(mockGeneratePath).toHaveBeenCalled();
      });
    });

    it('should show error notification on loading error', async () => {
      mockGetOrganizationDetail.mockReturnValue({
        data: undefined,
        isLoading: false,
        isSuccess: false,
        isError: true
      });

      render(<OrganizationEditWizard />);

      await waitFor(() => {
        expect(utils.notify.emit).toHaveBeenCalledWith(
          'Errore nel caricamento dei dati',
          'error'
        );
      });
    });
  });
});
