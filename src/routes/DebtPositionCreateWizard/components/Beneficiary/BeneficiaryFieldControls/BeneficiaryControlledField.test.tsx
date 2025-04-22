import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BeneficiaryControlledField } from './BeneficiaryControlledField';
import {
  Control,
  ControllerRenderProps,
  FieldValues,
  Path
} from 'react-hook-form';

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    Controller: ({
      render
    }: {
      render: (props: { field: unknown; fieldState?: unknown }) => JSX.Element;
    }) => {
      const field = {
        name: 'testField',
        value: '',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn()
      };
      const fieldState = {
        invalid: false,
        isTouched: false,
        isDirty: false,
        error: undefined
      };
      return render({ field, fieldState });
    }
  };
});

function TestInput<T extends FieldValues>({
  field
}: Readonly<{
  field: ControllerRenderProps<T, Path<T>>;
}>) {
  return <input data-testid="test-input" {...field} />;
}

const mockControl = {} as unknown as Control<Record<string, string>>;

describe('BeneficiaryControlledField', () => {
  it('dovrebbe renderizzare correttamente il campo di input', () => {
    type TestFormValues = {
      testField: string;
    };

    const mockRules = {
      required: 'Campo obbligatorio'
    };

    render(
      <BeneficiaryControlledField<TestFormValues>
        name="testField"
        control={mockControl as unknown as Control<TestFormValues>}
        rules={mockRules}
        renderField={({ field }) => <TestInput field={field} />}
      />
    );

    expect(screen.getByTestId('test-input')).toBeInTheDocument();
  });

  it('dovrebbe passare le props corrette al campo renderizzato', () => {
    type TestFormValues = {
      testField: string;
    };

    const renderFieldMock = vi.fn(({ field }) => <TestInput field={field} />);

    render(
      <BeneficiaryControlledField<TestFormValues>
        name="testField"
        control={mockControl as unknown as Control<TestFormValues>}
        renderField={renderFieldMock}
      />
    );

    expect(renderFieldMock).toHaveBeenCalled();
    expect(screen.getByTestId('test-input')).toBeInTheDocument();
  });

  it('dovrebbe passare le regole di validazione al Controller', () => {
    type TestFormValues = {
      testField: string;
    };

    const mockRules = {
      required: 'Campo obbligatorio',
      minLength: {
        value: 3,
        message: 'Lunghezza minima 3 caratteri'
      }
    };

    const renderFieldSpy = vi.fn(({ field }) => <TestInput field={field} />);

    render(
      <BeneficiaryControlledField<TestFormValues>
        name="testField"
        control={mockControl as unknown as Control<TestFormValues>}
        rules={mockRules}
        renderField={renderFieldSpy}
      />
    );

    expect(screen.getByTestId('test-input')).toBeInTheDocument();

    expect(renderFieldSpy).toHaveBeenCalled();
  });
});
