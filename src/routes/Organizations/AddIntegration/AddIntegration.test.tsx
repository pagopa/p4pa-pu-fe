import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type Control, useController } from 'react-hook-form';

import { AddIntegration } from '.';

vi.mock('@core/components/TitleComponent/TitleComponent', () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>
}));

vi.mock('@core/components/Wizard/WizardStepWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('@core/components/Wizard/WizardStepButtons', () => ({
  default: ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => (
    <div>
      <button data-testid="back-button" onClick={onBack}>
        back
      </button>
      <button data-testid="next-button" onClick={onNext}>
        next
      </button>
    </div>
  )
}));

vi.mock('@core/components/FormComponent', () => ({
  FormComponent: {
    ControlledRadioGroup: ({
      name,
      control,
      options
    }: {
      name: string;
      control: Control<Record<string, unknown>>;
      options: Array<{ value: string; label: React.ReactNode }>;
    }) => {
      const { field, fieldState } = useController({ name, control });
      return (
        <div>
          {options.map((option) => (
            <label key={option.value}>
              <input
                type="radio"
                name={name}
                data-testid={`option-${option.value}`}
                value={option.value}
                checked={field.value === option.value}
                onChange={() => field.onChange(option.value)}
              />
              {option.label}
            </label>
          ))}
          {fieldState.error && (
            <span data-testid={`${name}-error`}>
              {fieldState.error.message}
            </span>
          )}
        </div>
      );
    },
    RadioLabel: ({
      label,
      description
    }: {
      label: React.ReactNode;
      description?: React.ReactNode;
    }) => (
      <span>
        {label}
        {description}
      </span>
    )
  }
}));

describe('AddIntegration', () => {
  it('shows a validation error when submitting without selecting an option', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    render(<AddIntegration />);
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('flagIntegrationType-error')).toHaveTextContent(
        'commons.validation.selectAtLeastOneOption'
      );
    });
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('submits the selected integration type', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    render(<AddIntegration />);
    fireEvent.click(screen.getByTestId('option-pagoPa-product'));
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith({
        flagIntegrationType: 'pagoPa-product'
      });
    });
    expect(
      screen.queryByTestId('flagIntegrationType-error')
    ).not.toBeInTheDocument();
  });
});
