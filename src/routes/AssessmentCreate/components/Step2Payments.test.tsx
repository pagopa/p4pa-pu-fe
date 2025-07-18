/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { Step2Payments } from './Step2Payments';
import { render } from '../../../__tests__/renderers';

vi.mock('../../../components/Wizard/WizardStepWrapper', () => ({
  default: ({ children }: any) => (
    <div data-testid="wizard-step-wrapper">{children}</div>
  )
}));

vi.mock('../../../components/FormComponent', () => ({
  FormComponent: {
    ControlledRadioGroup: ({
      label,
      name,
      options,
      disabled,
      defaultValue,
      'data-testid': testId,
      sx
    }: any) => (
      <div data-testid={testId}>
        <fieldset disabled={disabled}>
          <legend>{label}</legend>
          <div style={{ flexDirection: sx?.flexDirection || 'column' }}>
            {options?.map((option: any) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  defaultChecked={option.value === defaultValue}
                  disabled={disabled}
                  data-testid={`${testId}-${option.value}`}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    )
  }
}));

const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      addPaymentsToAssessment: false
    }
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

const renderWithForm = (component: React.ReactNode) => {
  return render(<FormWrapper>{component}</FormWrapper>);
};

describe('Step2Payments', () => {
  const translations = {
    'assessmentCreate.configuration.step2.addPayments.radioLabel':
      'Aggiungere pagamenti?',
    'assessmentCreate.configuration.step2.addPayments.options.yes': 'Sì',
    'assessmentCreate.configuration.step2.addPayments.options.no': 'No'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup(translations);
  });

  describe('Rendering', () => {
    it('should render wizard step wrapper', () => {
      renderWithForm(<Step2Payments />);

      expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
    });

    it('should render radio group with correct label', () => {
      renderWithForm(<Step2Payments />);

      expect(screen.getByText('Aggiungere pagamenti?')).toBeInTheDocument();
      expect(screen.getByTestId('addPaymentsToAssessment')).toBeInTheDocument();
    });

    it('should render both radio options', () => {
      renderWithForm(<Step2Payments />);

      expect(screen.getByText('Sì')).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
    });

    it('should render radio inputs with correct values', () => {
      renderWithForm(<Step2Payments />);

      const yesRadio = screen.getByTestId('addPaymentsToAssessment-true');
      const noRadio = screen.getByTestId('addPaymentsToAssessment-false');

      expect(yesRadio).toBeInTheDocument();
      expect(noRadio).toBeInTheDocument();
      expect(yesRadio).toHaveAttribute('value', 'true');
      expect(noRadio).toHaveAttribute('value', 'false');
    });
  });

  describe('Default values', () => {
    it('should have "No" selected by default', () => {
      renderWithForm(<Step2Payments />);

      const yesRadio = screen.getByTestId('addPaymentsToAssessment-true');
      const noRadio = screen.getByTestId('addPaymentsToAssessment-false');

      expect(yesRadio).not.toBeChecked();
      expect(noRadio).toBeChecked();
    });
  });

  describe('Disabled state', () => {
    it('should disable radio group when editmode is true', () => {
      renderWithForm(<Step2Payments editmode={true} />);

      const yesRadio = screen.getByTestId('addPaymentsToAssessment-true');
      const noRadio = screen.getByTestId('addPaymentsToAssessment-false');

      expect(yesRadio).toBeDisabled();
      expect(noRadio).toBeDisabled();
    });

    it('should enable radio group when editmode is false', () => {
      renderWithForm(<Step2Payments editmode={false} />);

      const yesRadio = screen.getByTestId('addPaymentsToAssessment-true');
      const noRadio = screen.getByTestId('addPaymentsToAssessment-false');

      expect(yesRadio).not.toBeDisabled();
      expect(noRadio).not.toBeDisabled();
    });

    it('should enable radio group by default', () => {
      renderWithForm(<Step2Payments />);

      const yesRadio = screen.getByTestId('addPaymentsToAssessment-true');
      const noRadio = screen.getByTestId('addPaymentsToAssessment-false');

      expect(yesRadio).not.toBeDisabled();
      expect(noRadio).not.toBeDisabled();
    });
  });

  describe('Props behavior', () => {
    it('should handle default props', () => {
      renderWithForm(<Step2Payments />);

      expect(screen.getByTestId('addPaymentsToAssessment')).toBeInTheDocument();

      const yesRadio = screen.getByTestId('addPaymentsToAssessment-true');
      expect(yesRadio).not.toBeDisabled();
    });

    it('should handle editmode prop correctly', () => {
      renderWithForm(<Step2Payments editmode={true} />);

      const fieldset = screen
        .getByTestId('addPaymentsToAssessment')
        .querySelector('fieldset');
      expect(fieldset).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should use fieldset and legend for accessibility', () => {
      renderWithForm(<Step2Payments />);

      const fieldset = screen
        .getByTestId('addPaymentsToAssessment')
        .querySelector('fieldset');
      const legend = screen
        .getByTestId('addPaymentsToAssessment')
        .querySelector('legend');

      expect(fieldset).toBeInTheDocument();
      expect(legend).toBeInTheDocument();
      expect(legend).toHaveTextContent('Aggiungere pagamenti?');
    });

    it('should have proper radio group structure', () => {
      renderWithForm(<Step2Payments />);

      const yesRadio = screen.getByTestId('addPaymentsToAssessment-true');
      const noRadio = screen.getByTestId('addPaymentsToAssessment-false');

      expect(yesRadio).toHaveAttribute('type', 'radio');
      expect(noRadio).toHaveAttribute('type', 'radio');
      expect(yesRadio).toHaveAttribute('name', 'addPaymentsToAssessment');
      expect(noRadio).toHaveAttribute('name', 'addPaymentsToAssessment');
    });
  });

  describe('Data testids', () => {
    it('should have correct data-testid attributes', () => {
      renderWithForm(<Step2Payments />);

      expect(screen.getByTestId('addPaymentsToAssessment')).toBeInTheDocument();
      expect(
        screen.getByTestId('addPaymentsToAssessment-true')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('addPaymentsToAssessment-false')
      ).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply row direction styling', () => {
      renderWithForm(<Step2Payments />);

      const radioContainer = screen
        .getByTestId('addPaymentsToAssessment')
        .querySelector('div');
      expect(radioContainer).toHaveStyle({ flexDirection: 'row' });
    });
  });
});
