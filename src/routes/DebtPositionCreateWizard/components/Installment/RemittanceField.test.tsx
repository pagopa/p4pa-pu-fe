import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useForm } from 'react-hook-form';
import RemittanceField from './RemittanceField';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'debtPositionCreateWizard.step3.beneficiary.remittance.label': 'Reason',
        'debtPositionCreateWizard.step3.beneficiary.remittance.required':
          'Reason is required'
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

  test('should render the field correctly', () => {
    render(<TestWrapper validateRemittanceMock={validateRemittanceMock} />);

    const inputElement = screen.getByLabelText(/Reason/i);
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toBeRequired();
  });

  test('should show the default value if provided', () => {
    const defaultValue = 'Test reason';
    render(
      <TestWrapper
        defaultValue={defaultValue}
        validateRemittanceMock={validateRemittanceMock}
      />
    );

    const inputElement = screen.getByLabelText(/Reason/i) as HTMLInputElement;
    expect(inputElement.value).toBe(defaultValue);
  });

  test('should be disabled when the disabled prop is true', () => {
    render(
      <TestWrapper
        disabled={true}
        validateRemittanceMock={validateRemittanceMock}
      />
    );

    const inputElement = screen.getByLabelText(/Reason/i) as HTMLInputElement;
    expect(inputElement).toBeDisabled();
  });

  test('should show an error message when provided', () => {
    const errorMessage = 'Test error';
    render(
      <TestWrapper
        error={{ message: errorMessage }}
        validateRemittanceMock={validateRemittanceMock}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    const inputElement = screen.getByLabelText(/Reason/i);
    expect(inputElement).toHaveAttribute('aria-invalid', 'true');
  });

  test('should update the value when changed', () => {
    render(<TestWrapper validateRemittanceMock={validateRemittanceMock} />);

    const inputElement = screen.getByLabelText(/Reason/i);
    const testValue = 'New reason';

    fireEvent.change(inputElement, { target: { value: testValue } });

    expect((inputElement as HTMLInputElement).value).toBe(testValue);
  });

  test('should call validateRemittance on blur', async () => {
    render(<TestWrapper validateRemittanceMock={validateRemittanceMock} />);

    const inputElement = screen.getByLabelText(/Reason/i);
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

  test('should not call validateRemittance if not provided', async () => {
    render(<TestWrapper validateRemittanceMock={undefined} />);

    const inputElement = screen.getByLabelText(/Reason/i);
    fireEvent.blur(inputElement);

    // Wait for the timeout to pass to verify that it is not called
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(validateRemittanceMock).not.toHaveBeenCalled();
  });
});
