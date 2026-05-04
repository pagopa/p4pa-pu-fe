/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { DebtTypeOrgCreate } from './index';
import { useStepperLogic } from '../../hooks/useStepperLogic';
import { useDebtTypeOrgForm } from './hooks/useDebtTypeOrgForm';
import { useDebtPositionTypeOrgSearch } from '../../api/debtTypesCreated';
import { useStore } from '../../store/GlobalStore';
import { useNavigate } from 'react-router';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { render, screen, fireEvent, waitFor } from '../../__tests__/renderers';

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return { ...actual, useNavigate: vi.fn() };
});

vi.mock('../../hooks/useStepperLogic');
vi.mock('./hooks/useDebtTypeOrgForm');
vi.mock('../../api/debtTypesCreated');
vi.mock('../../store/GlobalStore', async () => {
  const actual = await vi.importActual('../../store/GlobalStore');
  return { ...actual, useStore: vi.fn() };
});

vi.mock('./steps/Step1Configuration', () => ({
  Step1Configuration: () => <div data-testid="step1" />
}));
vi.mock('./steps/Step2Behaviour', () => ({
  Step2Behaviour: () => <div data-testid="step2" />
}));
vi.mock('./steps/Step3Accounting', () => ({
  Step3Accounting: () => <div data-testid="step3" />
}));
vi.mock('./steps/Step4Notifications', () => ({
  Step4Notifications: () => <div data-testid="step4" />
}));
vi.mock('./steps/Step5Operators', () => ({
  Step5Operators: () => <div data-testid="step5" />
}));

const translations = {
  commons: {
    continue: 'Continua',
    back: 'Indietro'
  },
  debtTypeOrgCreate: {
    title: 'Crea tipo debito',
    formLabel: 'Form tipo debito',
    submit: 'Conferma',
    edit: { title: 'Modifica tipo debito' },
    stepper: {
      step1: 'Configurazione',
      step2: 'Comportamento',
      step3: 'Contabilità',
      step4: 'Notifiche',
      step5: 'Operatori'
    }
  },
  errors: {
    generic: 'Errore generico'
  }
};

i18nTestSetup(translations);

const mockNavigate = vi.fn();
const mockGoToNextStep = vi.fn();
const mockGoToPreviousStep = vi.fn();
const mockHandleSubmit = vi.fn();
const mockValidateStep = vi.fn();
const mockGetValues = vi.fn();
const mockSetError = vi.fn();
const mockClearErrors = vi.fn();
const mockMutateAsync = vi.fn();

const setupStepperLogic = (overrides = {}) => {
  (useStepperLogic as Mock).mockReturnValue({
    currentStep: 0,
    goToNextStep: mockGoToNextStep,
    goToPreviousStep: mockGoToPreviousStep,
    isFirstStep: true,
    isLastStep: false,
    ...overrides
  });
};

const setupForm = () => {
  mockGetValues.mockReturnValue({ code: 'TEST_CODE' });
  mockValidateStep.mockReturnValue({ isValid: true, errors: [] });

  (useDebtTypeOrgForm as Mock).mockReturnValue({
    methods: {
      getValues: mockGetValues,
      setError: mockSetError,
      clearErrors: mockClearErrors,
      register: vi.fn(),
      unregister: vi.fn(),
      formState: { errors: {} },
      watch: vi.fn(),
      handleSubmit: vi.fn(),
      reset: vi.fn(),
      setValue: vi.fn(),
      getFieldState: vi.fn(),
      trigger: vi.fn(),
      control: {} as any
    },
    validateStep: mockValidateStep,
    handleSubmit: mockHandleSubmit
  });
};

const setupDefaults = () => {
  (useNavigate as Mock).mockReturnValue(mockNavigate);
  (useStore as Mock).mockReturnValue({ state: { organizationId: 'org-1' } });
  (useDebtPositionTypeOrgSearch as Mock).mockReturnValue({
    mutateAsync: mockMutateAsync
  });
  mockMutateAsync.mockResolvedValue({ content: [] });
  setupStepperLogic();
  setupForm();
};

describe('DebtTypeOrgCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaults();
  });

  it('renders the form and stepper', () => {
    render(<DebtTypeOrgCreate />);

    expect(
      screen.getByRole('form', { name: 'Form tipo debito' })
    ).toBeInTheDocument();
    expect(screen.getByText('Crea tipo debito')).toBeInTheDocument();
  });

  it('renders edit title when edit prop is true', () => {
    render(<DebtTypeOrgCreate edit />);

    expect(screen.getByText('Modifica tipo debito')).toBeInTheDocument();
  });

  it('renders wizard step buttons', () => {
    render(<DebtTypeOrgCreate />);

    expect(screen.getByTestId('wizard-step-buttons')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-back-button')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-next-button')).toBeInTheDocument();
  });

  it('shows "Continua" label when not on last step', () => {
    setupStepperLogic({ isLastStep: false });
    render(<DebtTypeOrgCreate />);

    expect(screen.getByTestId('wizard-next-button')).toHaveTextContent(
      'Continua'
    );
  });

  it('shows "Conferma" label when on last step', () => {
    setupStepperLogic({ currentStep: 4, isFirstStep: false, isLastStep: true });
    render(<DebtTypeOrgCreate />);

    expect(screen.getByTestId('wizard-next-button')).toHaveTextContent(
      'Conferma'
    );
  });

  it('navigates back in browser history when on first step', () => {
    setupStepperLogic({ isFirstStep: true });
    render(<DebtTypeOrgCreate />);

    fireEvent.click(screen.getByTestId('wizard-back-button'));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('goes to previous step when not on first step', () => {
    setupStepperLogic({
      currentStep: 2,
      isFirstStep: false,
      isLastStep: false
    });
    render(<DebtTypeOrgCreate />);

    fireEvent.click(screen.getByTestId('wizard-back-button'));

    expect(mockGoToPreviousStep).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('advances to next step when validation passes', async () => {
    setupStepperLogic({
      currentStep: 1,
      isFirstStep: false,
      isLastStep: false
    });
    render(<DebtTypeOrgCreate />);

    fireEvent.click(screen.getByTestId('wizard-next-button'));

    await waitFor(() => {
      expect(mockClearErrors).toHaveBeenCalled();
      expect(mockGoToNextStep).toHaveBeenCalled();
    });
  });

  it('checks code uniqueness on step 0 before advancing', async () => {
    setupStepperLogic({
      currentStep: 0,
      isFirstStep: true,
      isLastStep: false
    });
    render(<DebtTypeOrgCreate />);

    fireEvent.click(screen.getByTestId('wizard-next-button'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        filters: { code: 'TEST_CODE' },
        pagination: { page: 0, size: 1 },
        sort: []
      });
    });
  });

  it('does not check code uniqueness on steps other than 0', async () => {
    setupStepperLogic({
      currentStep: 2,
      isFirstStep: false,
      isLastStep: false
    });
    render(<DebtTypeOrgCreate />);

    fireEvent.click(screen.getByTestId('wizard-next-button'));

    await waitFor(() => {
      expect(mockGoToNextStep).toHaveBeenCalled();
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('sets errors when validation fails', async () => {
    mockValidateStep.mockReturnValue({
      isValid: false,
      errors: [{ path: ['code'], message: 'Codice obbligatorio' }]
    });
    render(<DebtTypeOrgCreate />);

    fireEvent.click(screen.getByTestId('wizard-next-button'));

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('code', {
        type: 'manual',
        message: 'Codice obbligatorio'
      });
      expect(mockGoToNextStep).not.toHaveBeenCalled();
    });
  });

  it('does not set error when error path is empty', async () => {
    mockValidateStep.mockReturnValue({
      isValid: false,
      errors: [{ path: [], message: 'Errore generico' }]
    });
    render(<DebtTypeOrgCreate />);

    fireEvent.click(screen.getByTestId('wizard-next-button'));

    await waitFor(() => {
      expect(mockSetError).not.toHaveBeenCalled();
    });
  });

  it('calls handleSubmit on last step instead of advancing', async () => {
    setupStepperLogic({
      currentStep: 4,
      isFirstStep: false,
      isLastStep: true
    });
    render(<DebtTypeOrgCreate />);

    fireEvent.click(screen.getByTestId('wizard-next-button'));

    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalledWith({ code: 'TEST_CODE' });
      expect(mockGoToNextStep).not.toHaveBeenCalled();
    });
  });

  it('handles errors gracefully when mutateAsync rejects', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockMutateAsync.mockRejectedValue(new Error('Network error'));
    render(<DebtTypeOrgCreate />);

    fireEvent.click(screen.getByTestId('wizard-next-button'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
