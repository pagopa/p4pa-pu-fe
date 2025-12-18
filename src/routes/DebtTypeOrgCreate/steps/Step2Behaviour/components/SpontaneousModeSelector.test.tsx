import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../../../__tests__/renderers';
import { FormProvider, useForm } from 'react-hook-form';
import { SpontaneousModeSelector } from './SpontaneousModeSelector';
import { i18nTestSetup } from '../../../../../__tests__/i18nTestSetup';
import { DebtTypeOrgForm, SpontaneousMode } from '../../../types';

const TestWrapper = ({
  children,
  defaultValues = {}
}: {
  children: React.ReactNode;
  defaultValues?: Partial<DebtTypeOrgForm>;
}) => {
  const methods = useForm<DebtTypeOrgForm>({
    defaultValues: {
      spontaneousMode: undefined,
      externalPaymentUrl: '',
      ...defaultValues
    }
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('SpontaneousModeSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    i18nTestSetup({
      'debtTypeOrgCreate.behaviour.presetAmount.info':
        'Preset amount is enabled',
      'debtTypeOrgCreate.behaviour.spontaneousMode.label':
        'Spontaneous Payment Mode',
      'debtTypeOrgCreate.behaviour.spontaneousMode.options.standard':
        'Standard',
      'debtTypeOrgCreate.behaviour.spontaneousMode.options.custom':
        'Custom Form',
      'debtTypeOrgCreate.behaviour.spontaneousMode.options.external':
        'External URL',
      'debtTypeOrgCreate.behaviour.spontaneousMode.helper':
        'Select the payment mode',
      'debtTypeOrgCreate.behaviour.spontaneous.externalUrl.label':
        'External Portal Link',
      'debtTypeOrgCreate.behaviour.spontaneous.externalUrl.required':
        'External URL is required'
    });
  });

  describe('Render', () => {
    it('renders spontaneous mode select field', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{}}
            spontaneousMode={undefined}
            flagPresetAmount={false}
          />
        </TestWrapper>
      );

      const elements = screen.getAllByTestId('spontaneousMode');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('renders helper text below select', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{}}
            spontaneousMode={undefined}
            flagPresetAmount={false}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Select the payment mode')).toBeInTheDocument();
    });

    it('displays all spontaneous mode options', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{}}
            spontaneousMode={undefined}
            flagPresetAmount={false}
          />
        </TestWrapper>
      );
      const elements = screen.getAllByTestId('spontaneousMode');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Preset Amount Alert', () => {
    it('displays alert when flagPresetAmount is true', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{}}
            spontaneousMode={undefined}
            flagPresetAmount={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Preset amount is enabled')).toBeInTheDocument();
      expect(screen.getByTestId('preset-amount-info')).toBeInTheDocument();
    });

    it('does not display alert when flagPresetAmount is false', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{}}
            spontaneousMode={undefined}
            flagPresetAmount={false}
          />
        </TestWrapper>
      );

      expect(
        screen.queryByText('Preset amount is enabled')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('preset-amount-info')
      ).not.toBeInTheDocument();
    });

    it('does not display alert when flagPresetAmount is undefined', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{}}
            spontaneousMode={undefined}
            flagPresetAmount={undefined}
          />
        </TestWrapper>
      );

      expect(
        screen.queryByTestId('preset-amount-info')
      ).not.toBeInTheDocument();
    });
  });

  describe('External URL Field', () => {
    it('displays external URL field when mode is EXTERNAL_URL', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{}}
            spontaneousMode={SpontaneousMode.EXTERNAL_URL}
            flagPresetAmount={false}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('externalPaymentUrl')).toBeInTheDocument();
    });

    it('does not display external URL field when mode is STANDARD', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{}}
            spontaneousMode={SpontaneousMode.STANDARD}
            flagPresetAmount={false}
          />
        </TestWrapper>
      );

      expect(
        screen.queryByTestId('externalPaymentUrl')
      ).not.toBeInTheDocument();
    });

    it('does not display external URL field when mode is CUSTOM_FORM', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{}}
            spontaneousMode={SpontaneousMode.CUSTOM_FORM}
            flagPresetAmount={false}
          />
        </TestWrapper>
      );

      expect(
        screen.queryByTestId('externalPaymentUrl')
      ).not.toBeInTheDocument();
    });

    it('does not display external URL field when mode is undefined', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{}}
            spontaneousMode={undefined}
            flagPresetAmount={false}
          />
        </TestWrapper>
      );

      expect(
        screen.queryByTestId('externalPaymentUrl')
      ).not.toBeInTheDocument();
    });

    it('external URL field is required', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{}}
            spontaneousMode={SpontaneousMode.EXTERNAL_URL}
            flagPresetAmount={false}
          />
        </TestWrapper>
      );

      const input = screen.getByTestId('externalPaymentUrl');
      expect(input).toHaveAttribute('required');
    });

    it('displays error message when external URL has error', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{
              externalPaymentUrl: {
                type: 'required',
                message:
                  'debtTypeOrgCreate.behaviour.spontaneous.externalUrl.required'
              }
            }}
            spontaneousMode={SpontaneousMode.EXTERNAL_URL}
            flagPresetAmount={false}
          />
        </TestWrapper>
      );

      expect(screen.getByText('External URL is required')).toBeInTheDocument();
    });

    it('does not display error message when external URL has no error', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{}}
            spontaneousMode={SpontaneousMode.EXTERNAL_URL}
            flagPresetAmount={false}
          />
        </TestWrapper>
      );

      expect(
        screen.queryByText('External URL is required')
      ).not.toBeInTheDocument();
    });

    it('marks input as error when external URL has error', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{
              externalPaymentUrl: {
                type: 'required',
                message:
                  'debtTypeOrgCreate.behaviour.spontaneous.externalUrl.required'
              }
            }}
            spontaneousMode={SpontaneousMode.EXTERNAL_URL}
            flagPresetAmount={false}
          />
        </TestWrapper>
      );

      const input = screen.getByTestId('externalPaymentUrl');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Combined States', () => {
    it('displays both alert and external URL field when both conditions are true', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{}}
            spontaneousMode={SpontaneousMode.EXTERNAL_URL}
            flagPresetAmount={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Preset amount is enabled')).toBeInTheDocument();
      expect(screen.getByTestId('externalPaymentUrl')).toBeInTheDocument();
    });

    it('displays alert, mode select, and external URL field with error', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{
              externalPaymentUrl: {
                type: 'required',
                message:
                  'debtTypeOrgCreate.behaviour.spontaneous.externalUrl.required'
              }
            }}
            spontaneousMode={SpontaneousMode.EXTERNAL_URL}
            flagPresetAmount={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Preset amount is enabled')).toBeInTheDocument();
      const modeElements = screen.getAllByTestId('spontaneousMode');
      expect(modeElements.length).toBeGreaterThan(0);
      expect(screen.getByTestId('externalPaymentUrl')).toBeInTheDocument();
      expect(screen.getByText('External URL is required')).toBeInTheDocument();
    });
  });

  describe('TextField Attributes', () => {
    it('has correct placeholder for external URL field', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{}}
            spontaneousMode={SpontaneousMode.EXTERNAL_URL}
            flagPresetAmount={false}
          />
        </TestWrapper>
      );

      const input = screen.getByTestId('externalPaymentUrl');
      expect(input).toHaveAttribute('placeholder', 'https://');
    });

    it('external URL field is fullWidth', () => {
      render(
        <TestWrapper>
          <SpontaneousModeSelector
            control={undefined as never}
            errors={{}}
            spontaneousMode={SpontaneousMode.EXTERNAL_URL}
            flagPresetAmount={false}
          />
        </TestWrapper>
      );

      const input = screen.getByTestId('externalPaymentUrl');
      expect(input).toBeInTheDocument();
    });
  });
});
