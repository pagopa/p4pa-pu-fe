import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { it, describe, expect, vi, beforeEach } from 'vitest';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { useForm } from 'react-hook-form';
import DateField from './DateField';

// Disabilitiamo la regola react/prop-types poiché stiamo utilizzando TypeScript
/* eslint-disable react/prop-types */

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      key === 'debtPositionCreateWizard.step3.installments.dueDate.label'
        ? 'Data Scadenza'
        : key
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
      error?: { message?: string };
      flagMandatoryDueDate?: boolean;
      value?: Date | null;
    } = {}
  ) => {
    const TestComponent = () => {
      const { control, trigger } = useForm<TestFormValues>({
        defaultValues: {
          installments: [{ dueDate: null }]
        }
      });

      return (
        <DateField<TestFormValues>
          control={control}
          dueDatePath="installments.0.dueDate"
          index={0}
          trigger={trigger}
          validateDueDate={mockValidateDueDate}
          disabled={props.disabled}
          error={props.error}
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

  it('dovrebbe renderizzare correttamente il componente DatePicker', () => {
    renderDateField();
    expect(screen.getByText('Data Scadenza')).toBeInTheDocument();
  });

  it('dovrebbe mostrare il campo come obbligatorio quando flagMandatoryDueDate è true', () => {
    renderDateField({ flagMandatoryDueDate: true });
    const input = screen.getByPlaceholderText('DD/MM/YYYY');
    expect(input).toBeRequired();
  });

  it('dovrebbe mostrare il campo come non obbligatorio quando flagMandatoryDueDate è false', () => {
    renderDateField({ flagMandatoryDueDate: false });
    const input = screen.getByPlaceholderText('DD/MM/YYYY');
    expect(input).not.toBeRequired();
  });

  it('dovrebbe disabilitare il campo quando disabled è true', () => {
    renderDateField({ disabled: true });
    const input = screen.getByPlaceholderText('DD/MM/YYYY');
    expect(input).toBeDisabled();
  });

  it('dovrebbe mostrare un messaggio di errore quando viene fornito un errore', () => {
    const errorMessage = 'Data non valida';
    renderDateField({ error: { message: errorMessage } });
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('dovrebbe chiamare validateDueDate quando la data cambia', async () => {
    const TestComponent = () => {
      const { control, trigger } = useForm<TestFormValues>({
        defaultValues: {
          installments: [{ dueDate: null }]
        }
      });

      return (
        <DateField<TestFormValues>
          control={control}
          dueDatePath="installments.0.dueDate"
          index={0}
          trigger={trigger}
          validateDueDate={mockValidateDueDate}
        />
      );
    };

    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <TestComponent />
      </LocalizationProvider>
    );

    const input = screen.getByPlaceholderText('DD/MM/YYYY');

    fireEvent.change(input, { target: { value: '10/12/2024' } });

    fireEvent.blur(input);

    await waitFor(
      () => {
        expect(mockValidateDueDate).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );
  });
});
