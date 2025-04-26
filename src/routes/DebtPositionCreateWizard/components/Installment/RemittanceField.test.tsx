import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useForm } from 'react-hook-form';
import RemittanceField from './RemittanceField';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'debtPositionCreateWizard.step3.beneficiary.remittance.label':
          'Causale',
        'debtPositionCreateWizard.step3.beneficiary.remittance.required':
          'La causale è obbligatoria'
      };
      return translations[key] || key;
    }
  })
}));

type FormData = {
  installments: Array<{
    remittance: string;
  }>;
};

const TestWrapper = ({
  defaultValue = '',
  disabled = false,
  error = undefined,
  validateRemittanceMock = vi.fn()
}: {
  defaultValue?: string;
  disabled?: boolean;
  error?: { message?: string };
  validateRemittanceMock?: ReturnType<typeof vi.fn>;
}) => {
  const { control, trigger } = useForm<FormData>({
    defaultValues: {
      installments: [{ remittance: defaultValue }]
    },
    mode: 'onChange'
  });

  return (
    <RemittanceField<FormData>
      control={control}
      remittancePath="installments.0.remittance"
      index={0}
      disabled={disabled}
      error={error}
      validateRemittance={validateRemittanceMock}
      trigger={trigger}
    />
  );
};

describe('RemittanceField', () => {
  let validateRemittanceMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    validateRemittanceMock = vi.fn();
  });

  test('dovrebbe renderizzare correttamente il campo', () => {
    render(<TestWrapper validateRemittanceMock={validateRemittanceMock} />);

    const inputElement = screen.getByLabelText(/Causale/i);
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toBeRequired();
  });

  test('dovrebbe mostrare il valore default se fornito', () => {
    const defaultValue = 'Causale di test';
    render(
      <TestWrapper
        defaultValue={defaultValue}
        validateRemittanceMock={validateRemittanceMock}
      />
    );

    const inputElement = screen.getByLabelText(/Causale/i) as HTMLInputElement;
    expect(inputElement.value).toBe(defaultValue);
  });

  test('dovrebbe essere disabilitato quando la prop disabled è true', () => {
    render(
      <TestWrapper
        disabled={true}
        validateRemittanceMock={validateRemittanceMock}
      />
    );

    const inputElement = screen.getByLabelText(/Causale/i) as HTMLInputElement;
    expect(inputElement).toBeDisabled();
  });

  test('dovrebbe mostrare un messaggio di errore quando fornito', () => {
    const errorMessage = 'Errore di test';
    render(
      <TestWrapper
        error={{ message: errorMessage }}
        validateRemittanceMock={validateRemittanceMock}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    const inputElement = screen.getByLabelText(/Causale/i);
    expect(inputElement).toHaveAttribute('aria-invalid', 'true');
  });

  test('dovrebbe aggiornare il valore quando viene modificato', () => {
    render(<TestWrapper validateRemittanceMock={validateRemittanceMock} />);

    const inputElement = screen.getByLabelText(/Causale/i);
    const testValue = 'Nuova causale';

    fireEvent.change(inputElement, { target: { value: testValue } });

    expect((inputElement as HTMLInputElement).value).toBe(testValue);
  });

  test('dovrebbe chiamare validateRemittance al blur', async () => {
    render(<TestWrapper validateRemittanceMock={validateRemittanceMock} />);

    const inputElement = screen.getByLabelText(/Causale/i);
    fireEvent.blur(inputElement);

    // Verify that validateRemittance is called after the timeout
    await waitFor(
      () => {
        expect(validateRemittanceMock).toHaveBeenCalledWith(
          0,
          expect.any(Function)
        );
      },
      { timeout: 200 }
    );
  });

  test('non dovrebbe chiamare validateRemittance se non è fornito', async () => {
    render(<TestWrapper validateRemittanceMock={undefined} />);

    const inputElement = screen.getByLabelText(/Causale/i);
    fireEvent.blur(inputElement);

    // Wait for the timeout to pass to verify that it is not called
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(validateRemittanceMock).not.toHaveBeenCalled();
  });
});
