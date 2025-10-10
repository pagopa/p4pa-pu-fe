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
import { OrganizationStatus } from '../../../../generated/data-contracts';

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

vi.mock('./components/Step/Step1EntityProfile', () => ({
  default: vi.fn(({ onNext, onBack }) => (
    <div data-testid="step1-entity-profile">
      Step 1 Entity Profile
      <button onClick={onNext}>Next Step 1</button>
      <button onClick={onBack}>Back Step 1</button>
    </div>
  ))
}));

vi.mock('./components/Step/Step2EntityConfiguration', () => ({
  default: vi.fn(({ onNext, onBack, data }) => (
    <div data-testid="step2-entity-configuration">
      Step 2 Entity Configuration
      <button onClick={() => onNext(data)}>Save</button>
      <button onClick={onBack}>Back Step 2</button>
    </div>
  ))
}));

vi.mock('../../../components/Stepper', () => ({
  StepperContainer: ({
    title,
    description,
    steps,
    activeStep
  }: {
    title: string;
    description: string;
    steps: Array<{ label: string; content: React.ReactNode }>;
    activeStep: number;
  }) => (
    <div>
      <div data-testid="stepper-title">{title}</div>
      <div data-testid="stepper-description">{description}</div>
      <div data-testid="stepper-container">
        {steps.map((step, index) => (
          <div key={index} data-testid={`step-label-${index}`}>
            {step.label}
          </div>
        ))}
      </div>
      <div data-testid={`step-content-${activeStep}`}>
        {steps[activeStep].content}
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
  const mockMutateAsync = vi.fn();

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
      continue: 'Continua'
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
      mutateAsync: mockMutateAsync
    });

    vi.mocked(utils.notify.emit).mockClear();
  });

  describe('Rendering and UI', () => {
    it('should render wizard with stepper', () => {
      render(<OrganizationEditWizard />);

      expect(screen.getByText('Modifica Ente')).toBeInTheDocument();
      expect(screen.getByTestId('step1-entity-profile')).toBeInTheDocument();
    });

    it('should show step 1 initially', () => {
      render(<OrganizationEditWizard />);

      expect(screen.getByTestId('step1-entity-profile')).toBeInTheDocument();
      expect(
        screen.queryByTestId('step2-entity-configuration')
      ).not.toBeInTheDocument();
    });

    it('should render stepper with 2 steps', () => {
      render(<OrganizationEditWizard />);

      expect(screen.getByText('Anagrafica Ente')).toBeInTheDocument();
      expect(screen.getByText('Configurazione Ente')).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('should load organization detail on mount', () => {
      render(<OrganizationEditWizard />);

      expect(mockGetOrganizationDetail).toHaveBeenCalledWith(33);
    });

    it('should handle loading state', () => {
      mockGetOrganizationDetail.mockReturnValue({
        data: undefined,
        isLoading: true,
        isSuccess: false,
        isError: false
      });

      render(<OrganizationEditWizard />);

      expect(
        screen.queryByTestId('step1-entity-profile')
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

    it('should populate form data when organization detail loads', async () => {
      render(<OrganizationEditWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('step1-entity-profile')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation between steps', () => {
    it('should navigate to step 2 when clicking next on step 1', async () => {
      render(<OrganizationEditWizard />);

      const nextButton = screen.getByText('Next Step 1');
      nextButton.click();

      await waitFor(() => {
        expect(
          screen.getByTestId('step2-entity-configuration')
        ).toBeInTheDocument();
      });
    });

    it('should navigate back to organizations detail when clicking back on step 1', async () => {
      render(<OrganizationEditWizard />);

      const backButton = screen.getByText('Back Step 1');
      backButton.click();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
        expect(mockNavigate.mock.calls[0][0]).toContain('/organizations/33');
      });
    });

    it('should navigate back to step 1 when clicking back on step 2', async () => {
      render(<OrganizationEditWizard />);

      const nextButton = screen.getByText('Next Step 1');
      nextButton.click();

      await waitFor(() => {
        expect(
          screen.getByTestId('step2-entity-configuration')
        ).toBeInTheDocument();
      });

      const backButton = screen.getByText('Back Step 2');
      backButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('step1-entity-profile')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      mockMutateAsync.mockResolvedValue({});
    });

    it('should call updateOrganization when submitting from step 2', async () => {
      render(<OrganizationEditWizard />);

      const nextButton = screen.getByText('Next Step 1');
      nextButton.click();

      await waitFor(() => {
        expect(
          screen.getByTestId('step2-entity-configuration')
        ).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save');
      saveButton.click();

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
      });
    });

    it('should show success notification on successful update', async () => {
      render(<OrganizationEditWizard />);

      const nextButton = screen.getByText('Next Step 1');
      nextButton.click();

      await waitFor(() => {
        expect(
          screen.getByTestId('step2-entity-configuration')
        ).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save');
      saveButton.click();

      await waitFor(() => {
        expect(utils.notify.emit).toHaveBeenCalledWith(
          'Ente aggiornato con successo',
          'success'
        );
      });
    });

    it('should navigate to organization detail on successful update', async () => {
      render(<OrganizationEditWizard />);

      const nextButton = screen.getByText('Next Step 1');
      nextButton.click();

      await waitFor(() => {
        expect(
          screen.getByTestId('step2-entity-configuration')
        ).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save');
      saveButton.click();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
        expect(
          mockNavigate.mock.calls[mockNavigate.mock.calls.length - 1][0]
        ).toContain('/organizations/33');
      });
    });

    it('should handle update error', async () => {
      const errorMessage = 'Update failed';
      mockMutateAsync.mockRejectedValue(new Error(errorMessage));

      render(<OrganizationEditWizard />);

      const nextButton = screen.getByText('Next Step 1');
      nextButton.click();

      await waitFor(() => {
        expect(
          screen.getByTestId('step2-entity-configuration')
        ).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save');
      saveButton.click();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe('Store Integration', () => {
    it('should use organizationId from URL params', () => {
      render(<OrganizationEditWizard />);

      expect(mockGetOrganizationDetail).toHaveBeenCalledWith(33);
    });

    it('should handle missing organizationId', () => {
      mockUseParams.mockReturnValueOnce({ organizationId: undefined });
      mockGetOrganizationDetail.mockReturnValue({
        data: undefined,
        isLoading: false,
        isSuccess: false,
        isError: false
      });

      render(<OrganizationEditWizard />);

      expect(mockGetOrganizationDetail).toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle component unmount gracefully', () => {
      const { unmount } = render(<OrganizationEditWizard />);

      expect(() => unmount()).not.toThrow();
    });

    it('should maintain form state during re-renders', () => {
      const { rerender } = render(<OrganizationEditWizard />);

      rerender(<OrganizationEditWizard />);

      expect(screen.getByTestId('step1-entity-profile')).toBeInTheDocument();
    });
  });

  describe('Data Transformation', () => {
    it('should correctly transform API data to form data', async () => {
      render(<OrganizationEditWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('step1-entity-profile')).toBeInTheDocument();
      });

      expect(mockGetOrganizationDetail).toHaveBeenCalledWith(33);
    });

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
        expect(screen.getByTestId('step1-entity-profile')).toBeInTheDocument();
      });
    });
  });

  describe('URL Parameters', () => {
    it('should parse organizationId from URL params correctly', () => {
      mockUseParams.mockReturnValue({ organizationId: '123' });

      render(<OrganizationEditWizard />);

      expect(mockGetOrganizationDetail).toHaveBeenCalledWith(123);
    });

    it('should handle invalid organizationId format', () => {
      mockUseParams.mockReturnValueOnce({ organizationId: 'invalid' });
      mockGetOrganizationDetail.mockReturnValue({
        data: undefined,
        isLoading: false,
        isSuccess: false,
        isError: false
      });

      render(<OrganizationEditWizard />);

      expect(mockGetOrganizationDetail).toHaveBeenCalled();
    });
  });

  describe('Stepper Configuration', () => {
    it('should have correct step labels', () => {
      render(<OrganizationEditWizard />);

      expect(screen.getByText('Anagrafica Ente')).toBeInTheDocument();
      expect(screen.getByText('Configurazione Ente')).toBeInTheDocument();
    });

    it('should start at step 0', () => {
      render(<OrganizationEditWizard />);

      expect(screen.getByTestId('step1-entity-profile')).toBeInTheDocument();
    });
  });
});
