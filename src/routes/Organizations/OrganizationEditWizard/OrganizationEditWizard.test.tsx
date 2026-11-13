import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
import type { UnifiedFormData } from '../../../models/OrganizationEditTypes';

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

vi.mock('../../../store/GlobalStore', async (importOriginal) => ({
  ...(await importOriginal()),
  useStore: vi.fn()
}));

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
  transformApiDataToFormData: vi.fn(
    (data) =>
      ({
        orgName: { value: data.orgName || '', readonly: true },
        orgEmail: { value: data.orgEmail || '', readonly: false },
        orgLogo: { value: data.orgLogo || null, readonly: false },
        logoRemoved: false,
        iban: { value: data.iban || '', readonly: false },
        ibanPostal: { value: data.postalIban || '', readonly: false },
        cbill: { value: data.cbillInterBankCode || '', readonly: false },
        flagTreasury: { value: data.flagTreasury ?? false, readonly: false },
        segregationCode: { value: data.segregationCode || '', readonly: false },
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
        pdndEnabled: { value: data.pdndEnabled ?? false, readonly: false },
        organizationStatus: data.status
      }) as UnifiedFormData
  )
}));

vi.mock('./components/OrganizationEditForm', () => ({
  OrganizationEditForm: ({
    formData,
    organizationId
  }: {
    formData: UnifiedFormData;
    organizationId: number;
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
  const mockGetOrganizationDetail = getOrganizationDetail as Mock;
  const mockUpdateOrganization = updateOrganization as Mock;
  const mockUseParams = useParams as Mock;
  const mockUseNavigate = useNavigate as Mock;
  const mockUseStore = useStore as Mock;
  const mockGeneratePath = generatePath as Mock;

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

  describe('Rendering', () => {
    it('renders OrganizationEditForm when data is loaded', async () => {
      render(<OrganizationEditWizard />);

      await waitFor(() => {
        expect(
          screen.getByTestId('organization-edit-form')
        ).toBeInTheDocument();
      });
    });

    it('passes organizationId, transformed formData and status to OrganizationEditForm', async () => {
      render(<OrganizationEditWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('form-organization-id')).toHaveTextContent(
          '33'
        );
        expect(screen.getByTestId('form-organization-name')).toHaveTextContent(
          'Ente P4PA intermediato 1'
        );
        expect(
          screen.getByTestId('form-organization-status')
        ).toHaveTextContent('ACTIVE');
      });
    });
  });

  describe('Data loading', () => {
    it('calls getOrganizationDetail with the resolved organization id', () => {
      render(<OrganizationEditWizard />);

      expect(mockGetOrganizationDetail).toHaveBeenCalledWith(33);
    });

    it('does not render the form while loading', () => {
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

    it('notifies and navigates to the detail page on error', async () => {
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

    it('transforms API data to form data on success', async () => {
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

  describe('Organization id resolution', () => {
    it('uses the organization id from the URL params', () => {
      render(<OrganizationEditWizard />);

      expect(mockGetOrganizationDetail).toHaveBeenCalledWith(33);
    });

    it('falls back to the store organization id when URL param is missing', () => {
      mockUseParams.mockReturnValueOnce({ organizationId: undefined });
      mockUseStore.mockReturnValueOnce({
        state: {
          organizationId: 42
        }
      });

      render(<OrganizationEditWizard />);

      expect(mockGetOrganizationDetail).toHaveBeenCalledWith(42);
    });

    it('prioritizes URL params over the store organization id', () => {
      mockUseParams.mockReturnValueOnce({ organizationId: '99' });
      mockUseStore.mockReturnValueOnce({
        state: {
          organizationId: 42
        }
      });

      render(<OrganizationEditWizard />);

      expect(mockGetOrganizationDetail).toHaveBeenCalledWith(99);
    });

    it('uses the store organization id when URL param is not a number', () => {
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

  describe('Lifecycle', () => {
    it('unmounts without throwing', () => {
      const { unmount } = render(<OrganizationEditWizard />);

      expect(() => unmount()).not.toThrow();
    });

    it('does not duplicate the form on rerender once data is ready', async () => {
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
});
