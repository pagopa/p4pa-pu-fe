import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { it, describe, expect, vi, beforeEach } from 'vitest';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { useForm } from 'react-hook-form';
import DateField from './DateField';

// Disable react/prop-types rule since we're using TypeScript
/* eslint-disable react/prop-types */

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'debtPositionCreateWizard.step3.installments.dueDate.label') {
        return 'Data Scadenza';
      }
      if (key === 'debtPositionCreateWizard.step3.dueDate.invalid') {
        return 'Data non valida';
      }
      return key;
    }
  })
}));

describe('DateField', () => {
  type TestFormValues = {
    installments: Array<{
      dueDate: Date | null;
    }>;
  };

  const mockValidateDueDate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDateField = (
    props: {
      disabled?: boolean;
      flagMandatoryDueDate?: boolean;
      defaultValue?: Date | null;
      shouldTriggerError?: boolean;
    } = {}
  ) => {
    const TestComponent = () => {
      const { control, trigger, setError } = useForm<TestFormValues>({
        defaultValues: {
          installments: [{ dueDate: props.defaultValue || null }]
        }
      });

      // If shouldTriggerError is true, set the error state
      if (props.shouldTriggerError) {
        setError('installments.0.dueDate', {
          type: 'manual',
          message: 'Data non valida'
        });
      }

      return (
        <DateField<TestFormValues>
          control={control}
          dueDatePath="installments.0.dueDate"
          index={0}
          trigger={trigger}
          validateDueDate={mockValidateDueDate}
          disabled={props.disabled}
          flagMandatoryDueDate={props.flagMandatoryDueDate}
        />
      );
    };

    return render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <TestComponent />
      </LocalizationProvider>
    );
  };

  it('should correctly render the DatePicker component', () => {
    renderDateField();
    expect(screen.getByText('Data Scadenza')).toBeInTheDocument();
  });

  it('should show the field as required when flagMandatoryDueDate is true', () => {
    renderDateField({ flagMandatoryDueDate: true });
    const input = screen.getByPlaceholderText('DD/MM/YYYY');
    expect(input).toBeRequired();
  });

  it('should show the field as not required when flagMandatoryDueDate is false', () => {
    renderDateField({ flagMandatoryDueDate: false });
    const input = screen.getByPlaceholderText('DD/MM/YYYY');
    expect(input).not.toBeRequired();
  });

  it('should disable the field when disabled is true', () => {
    renderDateField({ disabled: true });
    const input = screen.getByPlaceholderText('DD/MM/YYYY');
    expect(input).toBeDisabled();
  });

  it('should show an error message when the field is invalid', async () => {
    renderDateField({ shouldTriggerError: true });

    await waitFor(() => {
      expect(screen.getByText('Data non valida')).toBeInTheDocument();
    });
  });

  it('should call validateDueDate when the date changes', async () => {
    renderDateField();
    const input = screen.getByPlaceholderText('DD/MM/YYYY');

    fireEvent.change(input, { target: { value: '10/12/2024' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(mockValidateDueDate).toHaveBeenCalled();
    });
  });
});
