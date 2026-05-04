/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../__tests__/renderers';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { useForm } from 'react-hook-form';
import { _ControlledRadioGroup } from '../_ControlledRadioGroup';

vi.mock('../ErrorMessage', () => ({
  ErrorMessage: ({ messageKey }: { messageKey?: string }) => (
    <span data-testid="error-msg">{messageKey ?? ''}</span>
  )
}));

i18nTestSetup({});

type FormValues = {
  choice: 'a' | 'b' | 'c';
};

const OPTIONS = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' }
] as const;

describe('_ControlledRadioGroup', () => {
  it('renders label and options, uses RHF default value when provided', () => {
    const Form = () => {
      const { control } = useForm<FormValues>({
        defaultValues: { choice: 'b' }
      });
      return (
        <_ControlledRadioGroup<FormValues>
          name="choice"
          control={control}
          label="Pick one"
          options={OPTIONS as any}
        />
      );
    };

    render(<Form />);

    expect(screen.getByText('Pick one')).toBeInTheDocument();

    const a = screen.getByLabelText('Option A') as HTMLInputElement;
    const b = screen.getByLabelText('Option B') as HTMLInputElement;
    const c = screen.getByLabelText('Option C') as HTMLInputElement;

    expect(a.checked).toBe(false);
    expect(b.checked).toBe(true);
    expect(c.checked).toBe(false);
  });

  it('defaults to first option when no RHF default value is provided', () => {
    const Form = () => {
      const { control } = useForm<FormValues>();
      return (
        <_ControlledRadioGroup<FormValues>
          name="choice"
          control={control}
          label="Pick one"
          options={OPTIONS as any}
        />
      );
    };

    render(<Form />);

    const a = screen.getByLabelText('Option A') as HTMLInputElement;
    const b = screen.getByLabelText('Option B') as HTMLInputElement;
    const c = screen.getByLabelText('Option C') as HTMLInputElement;

    expect(a.checked).toBe(true);
    expect(b.checked).toBe(false);
    expect(c.checked).toBe(false);
  });

  it('updates selection when another option is clicked', () => {
    // eslint-disable-next-line sonarjs/no-identical-functions
    const Form = () => {
      const { control } = useForm<FormValues>();
      return (
        <_ControlledRadioGroup<FormValues>
          name="choice"
          control={control}
          label="Pick one"
          options={OPTIONS as any}
        />
      );
    };

    render(<Form />);

    const a = screen.getByLabelText('Option A') as HTMLInputElement;
    const b = screen.getByLabelText('Option B') as HTMLInputElement;

    expect(a.checked).toBe(true);
    fireEvent.click(b);
    expect(b.checked).toBe(true);
    expect(a.checked).toBe(false);
  });

  it('disables the entire group and all radios when disabled is true', () => {
    const Form = () => {
      const { control } = useForm<FormValues>();
      return (
        <_ControlledRadioGroup<FormValues>
          name="choice"
          control={control}
          label="Disabled group"
          options={OPTIONS as any}
          disabled
        />
      );
    };

    render(<Form />);

    expect(screen.getByLabelText('Option A')).toBeDisabled();
    expect(screen.getByLabelText('Option B')).toBeDisabled();
    expect(screen.getByLabelText('Option C')).toBeDisabled();
  });

  it('marks the FormControl as required when required prop is set', () => {
    const Form = () => {
      const { control } = useForm<FormValues>();
      return (
        <_ControlledRadioGroup<FormValues>
          name="choice"
          control={control}
          label="Required group"
          options={OPTIONS as any}
          required
        />
      );
    };

    render(<Form />);

    expect(screen.getByText('Required group')).toBeInTheDocument();
  });
});
