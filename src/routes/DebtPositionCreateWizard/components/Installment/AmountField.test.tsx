import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useForm } from 'react-hook-form';
import AmountField from './AmountField';

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

  test('should render the field correctly', () => {
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

  test('should show the default value if provided', () => {
    render(
      <TestWrapper
        defaultValue="100.50"
        onAmountChangeMock={onAmountChangeMock}
        validateInstallmentAmountMock={validateInstallmentAmountMock}
      />
    );

    const inputElement = screen.getByLabelText(/Importo/i) as HTMLInputElement;
    expect(inputElement.value).toBe('100,50');
  });

  test('should be disabled when the disabled prop is true', () => {
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

  test('should show an error message when provided', () => {
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

  test('should filter non-numeric characters and call onAmountChange', () => {
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

  test('should convert the comma to a dot during input', () => {
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

  test('should call validateInstallmentAmount on blur', async () => {
    render(
      <TestWrapper
        onAmountChangeMock={onAmountChangeMock}
        validateInstallmentAmountMock={validateInstallmentAmountMock}
      />
    );

    const inputElement = screen.getByLabelText(/Importo/i);
    fireEvent.blur(inputElement);

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
