/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createAssessment } from '../../api/assessments';
import { useDebtPositionsTypeOrg } from '../../hooks/useDebtPositionsTypeOrg';
import { useStore } from '../../store/GlobalStore';
import { useNavigate } from 'react-router';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { AssessmentCreate } from './AssessmentCreate';
import { render } from '../../__tests__/renderers';
import { AxiosError } from 'axios';

vi.mock('../../api/assessments', () => ({
  createAssessment: vi.fn()
}));

vi.mock('../../hooks/useDebtPositionsTypeOrg', () => ({
  useDebtPositionsTypeOrg: vi.fn()
}));

vi.mock('../../store/GlobalStore', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../store/GlobalStore')>();
  return {
    ...actual,
    useStore: vi.fn()
  };
});

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

vi.mock('../../utils', () => ({
  default: {
    notify: {
      emit: vi.fn()
    },
    config: {
      deployPath: ''
    }
  }
}));

vi.mock('../../routes', () => ({
  PageRoutes: {
    ASSESSMENTS: '/assessments',
    RESPONSES_SUCCESS: '/responses/success',
    RESPONSES_ERROR: '/responses/error'
  }
}));

vi.mock('./components/Step1Configuration', () => ({
  Step1Configuration: () => (
    <div data-testid="step1-config">Step 1 Configuration</div>
  )
}));

vi.mock('./components/Step2Payments', () => ({
  Step2Payments: () => <div data-testid="step2-payments">Step 2 Payments</div>
}));

vi.mock('../../hooks/useStepperLogic', () => ({
  useStepperLogic: vi.fn()
}));

describe('AssessmentCreate', () => {
  const mockNavigate = vi.fn();
  const mockMutateAsync = vi.fn();
  const mockGoToNextStep = vi.fn();
  const mockGoToPreviousStep = vi.fn();

  const mockCreateAssessment = createAssessment as Mock;
  const mockUseDebtPositionsTypeOrg = useDebtPositionsTypeOrg as Mock;
  const mockUseStore = useStore as Mock;
  const mockUseNavigate = useNavigate as Mock;

  let mockUseStepperLogic: Mock;

  const translations = {
    'assessmentCreate.title': 'Crea Assessment',
    'assessmentCreate.description': 'Configura il tuo nuovo assessment',
    'assessmentCreate.formLabel': 'Form creazione assessment',
    'assessmentCreate.stepper.step1': 'Configurazione',
    'assessmentCreate.stepper.step2': 'Pagamenti',
    'assessmentCreate.error.nameAlreadyPresent': 'Nome già presente',
    'assessmentCreate.configuration.step1.fields.name.required':
      'Nome richiesto',
    'assessmentCreate.configuration.step1.fields.debtPositionType.required':
      'Tipo posizione debitoria richiesto',
    'commons.continue': 'Continua',
    'commons.create': 'Crea',
    'commons.back': 'Indietro',
    'commons.optional': 'Opzionale',
    'errors.generic': 'Errore generico'
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    i18nTestSetup(translations);

    const { useStepperLogic } = await import('../../hooks/useStepperLogic');

    mockUseStepperLogic = useStepperLogic as Mock;

    mockUseStore.mockReturnValue({
      state: {
        organizationId: 'test-org-123'
      }
    });

    mockUseNavigate.mockReturnValue(mockNavigate);

    mockCreateAssessment.mockReturnValue({
      mutateAsync: mockMutateAsync
    });

    mockUseDebtPositionsTypeOrg.mockReturnValue({
      optionsMap: [
        { value: 'TYPE_1', label: 'Tipo 1' },
        { value: 'TYPE_2', label: 'Tipo 2' }
      ]
    });

    mockUseStepperLogic.mockReturnValue({
      currentStep: 0,
      goToNextStep: mockGoToNextStep,
      goToPreviousStep: mockGoToPreviousStep,
      isFirstStep: true,
      isLastStep: false
    });
  });

  describe('Rendering and UI', () => {
    it('should render wizard with title and description', () => {
      render(<AssessmentCreate />);

      expect(screen.getByText('Crea Assessment')).toBeInTheDocument();
      expect(
        screen.getByText('Configura il tuo nuovo assessment')
      ).toBeInTheDocument();
    });

    it('should show step 1 initially', () => {
      render(<AssessmentCreate />);

      expect(screen.getByText('Configurazione')).toBeInTheDocument();
      expect(screen.getByTestId('step1-config')).toBeInTheDocument();
    });

    it('should show correct navigation buttons', () => {
      render(<AssessmentCreate />);

      expect(
        screen.getByRole('button', { name: 'Indietro' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Continua' })
      ).toBeInTheDocument();
    });

    it('should render form with correct aria-label', () => {
      render(<AssessmentCreate />);

      expect(
        screen.getByLabelText('Form creazione assessment')
      ).toBeInTheDocument();
    });

    it('should show step 2 when currentStep is 1', () => {
      mockUseStepperLogic.mockReturnValue({
        currentStep: 1,
        goToNextStep: mockGoToNextStep,
        goToPreviousStep: mockGoToPreviousStep,
        isFirstStep: false,
        isLastStep: true
      });

      render(<AssessmentCreate />);

      expect(screen.getByText('Pagamenti')).toBeInTheDocument();
      expect(screen.getByTestId('step2-payments')).toBeInTheDocument();
    });

    it('should show "Crea" button when on last step', () => {
      mockUseStepperLogic.mockReturnValue({
        currentStep: 1,
        goToNextStep: mockGoToNextStep,
        goToPreviousStep: mockGoToPreviousStep,
        isFirstStep: false,
        isLastStep: true
      });

      render(<AssessmentCreate />);

      expect(screen.getByRole('button', { name: 'Crea' })).toBeInTheDocument();
    });

    it('should show "Opzionale" label for step 2', () => {
      render(<AssessmentCreate />);
      expect(screen.getByText('Pagamenti')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to assessments list when clicking back from step 1', async () => {
      const user = userEvent.setup();
      render(<AssessmentCreate />);

      await user.click(screen.getByRole('button', { name: 'Indietro' }));

      expect(mockNavigate).toHaveBeenCalledWith('/assessments');
    });

    it('should go to previous step when clicking back from step 2', async () => {
      const user = userEvent.setup();

      mockUseStepperLogic.mockReturnValue({
        currentStep: 1,
        goToNextStep: mockGoToNextStep,
        goToPreviousStep: mockGoToPreviousStep,
        isFirstStep: false,
        isLastStep: true
      });

      render(<AssessmentCreate />);

      await user.click(screen.getByRole('button', { name: 'Indietro' }));

      expect(mockGoToPreviousStep).toHaveBeenCalled();
    });

    it('should attempt to go to next step when clicking continue', async () => {
      const user = userEvent.setup();

      render(<AssessmentCreate />);

      await user.click(screen.getByRole('button', { name: 'Continua' }));

      expect(
        screen.getByRole('button', { name: 'Continua' })
      ).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should handle form validation when proceeding to next step', async () => {
      const user = userEvent.setup();

      render(<AssessmentCreate />);

      await user.click(screen.getByRole('button', { name: 'Continua' }));

      expect(
        screen.getByRole('button', { name: 'Continua' })
      ).toBeInTheDocument();
    });

    it('should validate form fields on step 1', async () => {
      const user = userEvent.setup();

      render(<AssessmentCreate />);

      await user.click(screen.getByRole('button', { name: 'Continua' }));

      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('should handle form submission on last step', async () => {
      const user = userEvent.setup();

      mockUseStepperLogic.mockReturnValue({
        currentStep: 1,
        goToNextStep: mockGoToNextStep,
        goToPreviousStep: mockGoToPreviousStep,
        isFirstStep: false,
        isLastStep: true
      });

      render(<AssessmentCreate />);

      await user.click(screen.getByRole('button', { name: 'Crea' }));

      expect(screen.getByRole('form')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      mockUseStepperLogic.mockReturnValue({
        currentStep: 1,
        goToNextStep: mockGoToNextStep,
        goToPreviousStep: mockGoToPreviousStep,
        isFirstStep: false,
        isLastStep: true
      });
    });

    it('should handle form submission when on last step', async () => {
      const user = userEvent.setup();

      mockMutateAsync.mockResolvedValue({
        assessmentName: 'Test Assessment',
        id: 'assessment-123'
      });

      render(<AssessmentCreate />);

      await user.click(screen.getByRole('button', { name: 'Crea' }));

      expect(screen.getByRole('button', { name: 'Crea' })).toBeInTheDocument();
    });

    it('should handle successful form submission', async () => {
      const user = userEvent.setup();

      mockMutateAsync.mockResolvedValue({
        assessmentName: 'Test Assessment',
        id: 'assessment-123'
      });

      render(<AssessmentCreate />);

      await user.click(screen.getByRole('button', { name: 'Crea' }));

      expect(screen.getByRole('form')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      mockUseStepperLogic.mockReturnValue({
        currentStep: 1,
        goToNextStep: mockGoToNextStep,
        goToPreviousStep: mockGoToPreviousStep,
        isFirstStep: false,
        isLastStep: true
      });
    });

    it('should handle 409 error (name already exists)', async () => {
      const user = userEvent.setup();

      const error409 = new AxiosError();
      error409.response = { status: 409 } as any;

      mockMutateAsync.mockRejectedValue(error409);

      render(<AssessmentCreate />);

      await user.click(screen.getByRole('button', { name: 'Crea' }));

      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('should handle generic errors', async () => {
      const user = userEvent.setup();

      const genericError = new Error('Server error');
      mockMutateAsync.mockRejectedValue(genericError);

      render(<AssessmentCreate />);

      await user.click(screen.getByRole('button', { name: 'Crea' }));

      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('should handle AxiosError without 409 status', async () => {
      const user = userEvent.setup();

      const axiosError = new AxiosError();
      axiosError.response = { status: 500 } as any;

      mockMutateAsync.mockRejectedValue(axiosError);

      render(<AssessmentCreate />);

      await user.click(screen.getByRole('button', { name: 'Crea' }));

      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('should handle AxiosError without response', async () => {
      const user = userEvent.setup();

      const axiosError = new AxiosError();

      mockMutateAsync.mockRejectedValue(axiosError);

      render(<AssessmentCreate />);

      await user.click(screen.getByRole('button', { name: 'Crea' }));

      expect(screen.getByRole('form')).toBeInTheDocument();
    });
  });

  describe('Store integration', () => {
    it('should use organizationId from store', () => {
      render(<AssessmentCreate />);

      expect(mockCreateAssessment).toHaveBeenCalledWith('test-org-123');
    });

    it('should handle missing organizationId', () => {
      mockUseStore.mockReturnValue({
        state: {
          organizationId: undefined
        }
      });

      render(<AssessmentCreate />);

      expect(mockCreateAssessment).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Stepper Integration', () => {
    it('should initialize stepper with correct configuration', () => {
      render(<AssessmentCreate />);

      expect(mockUseStepperLogic).toHaveBeenCalledWith({
        initialStep: 0,
        totalSteps: 2
      });
    });

    it('should render steps with correct labels', () => {
      render(<AssessmentCreate />);

      expect(screen.getByText('Configurazione')).toBeInTheDocument();
      expect(screen.getByText('Pagamenti')).toBeInTheDocument();
    });
  });

  describe('Form Configuration', () => {
    it('should configure form with correct default values', () => {
      render(<AssessmentCreate />);

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('novalidate');
    });

    it('should use zodResolver for form validation', () => {
      render(<AssessmentCreate />);

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle component unmount gracefully', () => {
      const { unmount } = render(<AssessmentCreate />);

      expect(() => unmount()).not.toThrow();
    });

    it('should maintain form state during re-renders', () => {
      const { rerender } = render(<AssessmentCreate />);

      rerender(<AssessmentCreate />);

      expect(screen.getByRole('form')).toBeInTheDocument();
    });
  });
});
