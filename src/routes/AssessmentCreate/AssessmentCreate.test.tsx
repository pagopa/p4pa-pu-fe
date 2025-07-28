import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createAssessment } from '../../api/assessments';
import { useDebtPositionsTypeOrg } from '../../hooks/useDebtPositionsTypeOrg';
import { useStore } from '../../store/GlobalStore';
import { useNavigate } from 'react-router';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { AssessmentCreate } from './AssessmentCreate';
import { render } from '../../__tests__/renderers';

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

vi.mock('./components/Step1Configuration', async () => {
  const { useFormContext } = await import('react-hook-form');

  return {
    Step1Configuration: () => {
      const {
        register,
        formState: { errors }
      } = useFormContext();

      return (
        <div data-testid="step1-config">
          <input
            {...register('assessmentName', { required: true })}
            data-testid="assessment-name-input"
            placeholder="Assessment Name"
          />
          {errors.assessmentName && (
            <span data-testid="name-error">
              {typeof errors.assessmentName.message === 'string'
                ? errors.assessmentName.message
                : 'Field error'}
            </span>
          )}
          <select
            {...register('debtPositionTypeOrgCode', { required: true })}
            data-testid="debt-position-type-select"
          >
            <option value="">Select type</option>
            <option value="TYPE_1">Tipo 1</option>
            <option value="TYPE_2">Tipo 2</option>
          </select>
          {errors.debtPositionTypeOrgCode && (
            <span data-testid="type-error">
              {typeof errors.debtPositionTypeOrgCode.message === 'string'
                ? errors.debtPositionTypeOrgCode.message
                : 'Field error'}
            </span>
          )}
        </div>
      );
    }
  };
});

vi.mock('./components/Step2Payments', async () => {
  const { useFormContext } = await import('react-hook-form');

  return {
    Step2Payments: () => {
      const { register } = useFormContext();

      return (
        <div data-testid="step2-payments">
          <input
            {...register('addPaymentsToAssessment')}
            type="checkbox"
            data-testid="add-payments-checkbox"
          />
          <label>Add payments to assessment</label>
        </div>
      );
    }
  };
});

vi.mock('../../hooks/useStepperLogic', () => ({
  useStepperLogic: vi.fn()
}));

vi.mock('./hooks/useAssessmentNameValidation', () => ({
  useAssessmentNameValidation: vi.fn()
}));

describe('AssessmentCreate', () => {
  const mockNavigate = vi.fn();
  const mockMutateAsync = vi.fn();
  const mockGoToNextStep = vi.fn();
  const mockGoToPreviousStep = vi.fn();
  const mockValidateNameMutateAsync = vi.fn();

  const mockCreateAssessment = createAssessment as Mock;
  const mockUseDebtPositionsTypeOrg = useDebtPositionsTypeOrg as Mock;
  const mockUseStore = useStore as Mock;
  const mockUseNavigate = useNavigate as Mock;

  let mockUseStepperLogic: Mock;
  let mockUseAssessmentNameValidation: Mock;

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
    const { useAssessmentNameValidation } = await import(
      './hooks/useAssessmentNameValidation'
    );

    mockUseStepperLogic = useStepperLogic as Mock;
    mockUseAssessmentNameValidation = useAssessmentNameValidation as Mock;

    mockUseStore.mockReturnValue({
      state: {
        organizationId: 'test-org-123'
      }
    });

    mockUseNavigate.mockReturnValue(mockNavigate);

    mockCreateAssessment.mockReturnValue({
      mutateAsync: mockMutateAsync
    });

    mockUseAssessmentNameValidation.mockReturnValue({
      mutateAsync: mockValidateNameMutateAsync
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

    mockValidateNameMutateAsync.mockResolvedValue(false);
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

    it('should show correct navigation buttons on first step', () => {
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

    it('should show create button when on last step', () => {
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
  });

  describe('Navigation', () => {
    it('should navigate back when clicking back from step 1', async () => {
      const user = userEvent.setup();
      render(<AssessmentCreate />);

      await user.click(screen.getByRole('button', { name: 'Indietro' }));

      expect(mockNavigate).toHaveBeenCalledWith(-1);
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
  });

  describe('Form Validation and Step Progression', () => {
    it('should not proceed to next step when form validation fails', async () => {
      const user = userEvent.setup();
      render(<AssessmentCreate />);

      await user.click(screen.getByRole('button', { name: 'Continua' }));

      expect(mockGoToNextStep).not.toHaveBeenCalled();
      expect(mockValidateNameMutateAsync).not.toHaveBeenCalled();
    });

    it('should proceed to next step when validation passes', async () => {
      const user = userEvent.setup();
      render(<AssessmentCreate />);

      const nameInput = screen.getByTestId('assessment-name-input');
      const typeSelect = screen.getByTestId('debt-position-type-select');

      await user.type(nameInput, 'Test Assessment');
      await user.selectOptions(typeSelect, 'TYPE_1');

      await user.click(screen.getByRole('button', { name: 'Continua' }));

      await waitFor(() => {
        expect(mockValidateNameMutateAsync).toHaveBeenCalledWith({
          assessmentName: 'Test Assessment',
          debtPositionTypeOrgCode: 'TYPE_1'
        });
      });

      await waitFor(() => {
        expect(mockGoToNextStep).toHaveBeenCalled();
      });
    });

    it('should show error when assessment name already exists', async () => {
      const user = userEvent.setup();

      mockValidateNameMutateAsync.mockResolvedValue(true);

      render(<AssessmentCreate />);

      const nameInput = screen.getByTestId('assessment-name-input');
      const typeSelect = screen.getByTestId('debt-position-type-select');

      await user.type(nameInput, 'Existing Assessment');
      await user.selectOptions(typeSelect, 'TYPE_1');

      await user.click(screen.getByRole('button', { name: 'Continua' }));

      await waitFor(() => {
        expect(mockValidateNameMutateAsync).toHaveBeenCalledWith({
          assessmentName: 'Existing Assessment',
          debtPositionTypeOrgCode: 'TYPE_1'
        });
      });

      expect(mockGoToNextStep).not.toHaveBeenCalled();
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

    it('should handle successful form submission', async () => {
      const user = userEvent.setup();

      mockMutateAsync.mockResolvedValue({
        assessmentName: 'Test Assessment',
        assessmentId: 'assessment-123'
      });

      render(<AssessmentCreate />);

      await user.click(screen.getByRole('button', { name: 'Crea' }));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/responses/success', {
          replace: true,
          state: {
            category: 'assessment-create',
            i18nParams: {
              assessmentName: 'Test Assessment'
            },
            assessmentId: 'assessment-123'
          }
        });
      });
    });

    it('should handle form submission error', async () => {
      const user = userEvent.setup();

      const error = new Error('Server error');
      mockMutateAsync.mockRejectedValue(error);

      render(<AssessmentCreate />);

      await user.click(screen.getByRole('button', { name: 'Crea' }));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/responses/error', {
          replace: true,
          state: {
            errorType: 'default'
          }
        });
      });
    });
  });

  describe('Store integration', () => {
    it('should use organization ID from store', () => {
      render(<AssessmentCreate />);

      expect(mockCreateAssessment).toHaveBeenCalledWith('test-org-123');
      expect(mockUseAssessmentNameValidation).toHaveBeenCalledWith(
        'test-org-123'
      );
    });

    it('should handle missing organization ID', () => {
      mockUseStore.mockReturnValue({
        state: {
          organizationId: undefined
        }
      });

      render(<AssessmentCreate />);

      expect(mockCreateAssessment).toHaveBeenCalledWith(undefined);
      expect(mockUseAssessmentNameValidation).toHaveBeenCalledWith(undefined);
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

  describe('Error Handling', () => {
    it('should handle validation error gracefully', async () => {
      const user = userEvent.setup();

      mockValidateNameMutateAsync.mockRejectedValue(
        new Error('Validation error')
      );

      render(<AssessmentCreate />);

      const nameInput = screen.getByTestId('assessment-name-input');
      const typeSelect = screen.getByTestId('debt-position-type-select');

      await user.type(nameInput, 'Test Assessment');
      await user.selectOptions(typeSelect, 'TYPE_1');

      await user.click(screen.getByRole('button', { name: 'Continua' }));

      await waitFor(() => {
        expect(mockValidateNameMutateAsync).toHaveBeenCalled();
      });
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
      expect(screen.getByTestId('step1-config')).toBeInTheDocument();
    });
  });

  describe('Form Configuration', () => {
    it('should configure form with correct default values', () => {
      render(<AssessmentCreate />);

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('novalidate');
    });

    it('should display form fields with default values', () => {
      render(<AssessmentCreate />);

      const nameInput = screen.getByTestId(
        'assessment-name-input'
      ) as HTMLInputElement;
      const typeSelect = screen.getByTestId(
        'debt-position-type-select'
      ) as HTMLSelectElement;

      expect(nameInput.value).toBe('');
      expect(typeSelect.value).toBe('');
    });
  });
});
