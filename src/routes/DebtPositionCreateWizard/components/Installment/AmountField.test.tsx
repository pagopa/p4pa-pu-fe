import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useForm } from 'react-hook-form';
import AmountField from './AmountField';

// Mock dei moduli
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'debtPositionCreateWizard.step3.installments.amount.label': 'Importo',
        'validation.amount.required': "L'importo è obbligatorio",
        'validation.amount.positive': "L'importo deve essere positivo",
        'validation.amount.max': "L'importo non può superare 999,999,999.99"
      };
      return translations[key] || key;
    }
  })
}));

vi.mock('../../../../utils/fieldValidation', () => ({
  createAmountValidator: () => ({
    required: { value: true, message: "L'importo è obbligatorio" },
    pattern: {
      value: /^\d+(\.\d{1,2})?$/,
      message: 'Formato importo non valido'
    }
  })
}));

// Componente di test wrapper per consentire l'uso di react-hook-form
type FormData = {
  installments: Array<{
    amount: string;
  }>;
};

const TestWrapper = ({
  defaultValue = '',
  disabled = false,
  error = undefined,
  onAmountChangeMock = vi.fn(),
  validateInstallmentAmountMock = vi.fn()
}: {
  defaultValue?: string;
  disabled?: boolean;
  error?: { message?: string };
  onAmountChangeMock?: ReturnType<typeof vi.fn>;
  validateInstallmentAmountMock?: ReturnType<typeof vi.fn>;
}) => {
  const { control, trigger } = useForm<FormData>({
    defaultValues: {
      installments: [{ amount: defaultValue }]
    },
    mode: 'onChange'
  });

  return (
    <AmountField<FormData>
      control={control}
      amountPath="installments.0.amount"
      index={0}
      disabled={disabled}
      error={error}
      validateInstallmentAmount={validateInstallmentAmountMock}
      trigger={trigger}
      onAmountChange={onAmountChangeMock}
    />
  );
};

describe('AmountField', () => {
  let onAmountChangeMock: ReturnType<typeof vi.fn>;
  let validateInstallmentAmountMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onAmountChangeMock = vi.fn();
    validateInstallmentAmountMock = vi.fn();
  });

  test('dovrebbe renderizzare correttamente il campo', () => {
    render(
      <TestWrapper
        onAmountChangeMock={onAmountChangeMock}
        validateInstallmentAmountMock={validateInstallmentAmountMock}
      />
    );

    const inputElement = screen.getByLabelText(/Importo/i);
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toBeRequired();
    expect(screen.getByText('€')).toBeInTheDocument();
  });

  test('dovrebbe mostrare il valore default se fornito', () => {
    render(
      <TestWrapper
        defaultValue="100.50"
        onAmountChangeMock={onAmountChangeMock}
        validateInstallmentAmountMock={validateInstallmentAmountMock}
      />
    );

    const inputElement = screen.getByLabelText(/Importo/i) as HTMLInputElement;
    expect(inputElement.value).toBe('100.50');
  });

  test('dovrebbe essere disabilitato quando la prop disabled è true', () => {
    render(
      <TestWrapper
        disabled={true}
        onAmountChangeMock={onAmountChangeMock}
        validateInstallmentAmountMock={validateInstallmentAmountMock}
      />
    );

    const inputElement = screen.getByLabelText(/Importo/i) as HTMLInputElement;
    expect(inputElement).toBeDisabled();
  });

  test('dovrebbe mostrare un messaggio di errore quando fornito', () => {
    const errorMessage = 'Errore di test';
    render(
      <TestWrapper
        error={{ message: errorMessage }}
        onAmountChangeMock={onAmountChangeMock}
        validateInstallmentAmountMock={validateInstallmentAmountMock}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    const inputElement = screen.getByLabelText(/Importo/i);
    expect(inputElement).toHaveAttribute('aria-invalid', 'true');
  });

  test('dovrebbe filtrare i caratteri non numerici e chiamare onAmountChange', () => {
    render(
      <TestWrapper
        onAmountChangeMock={onAmountChangeMock}
        validateInstallmentAmountMock={validateInstallmentAmountMock}
      />
    );

    const inputElement = screen.getByLabelText(/Importo/i);
    fireEvent.change(inputElement, { target: { value: 'abc123,45xyz' } });

    expect(onAmountChangeMock).toHaveBeenCalledWith('123.45');
  });

  test("dovrebbe convertire la virgola in punto durante l'input", () => {
    render(
      <TestWrapper
        onAmountChangeMock={onAmountChangeMock}
        validateInstallmentAmountMock={validateInstallmentAmountMock}
      />
    );

    const inputElement = screen.getByLabelText(/Importo/i);
    fireEvent.change(inputElement, { target: { value: '99,99' } });

    expect(onAmountChangeMock).toHaveBeenCalledWith('99.99');
  });

  test('dovrebbe chiamare validateInstallmentAmount al blur', async () => {
    render(
      <TestWrapper
        onAmountChangeMock={onAmountChangeMock}
        validateInstallmentAmountMock={validateInstallmentAmountMock}
      />
    );

    const inputElement = screen.getByLabelText(/Importo/i);
    fireEvent.blur(inputElement);

    // Verifica che validateInstallmentAmount venga chiamato dopo il timeout
    await waitFor(
      () => {
        expect(validateInstallmentAmountMock).toHaveBeenCalledWith(
          0,
          expect.any(Function)
        );
      },
      { timeout: 200 }
    );
  });
});
