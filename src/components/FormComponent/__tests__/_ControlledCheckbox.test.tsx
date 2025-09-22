import { describe, it, expect, vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../__tests__/renderers';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { useForm } from 'react-hook-form';
import { _ControlledCheckbox } from '../_ControlledCheckbox';

i18nTestSetup({});

type FormValues = { accepted: boolean };

describe('_ControlledCheckbox', () => {
  it('renders with label and description', () => {
    const Form = () => {
      const { control } = useForm<FormValues>({
        defaultValues: { accepted: false }
      });
      return (
        <_ControlledCheckbox<FormValues>
          name="accepted"
          control={control}
          label="Accept Terms"
          description="Required to continue"
        />
      );
    };

    render(<Form />);

    expect(screen.getByText('Accept Terms')).toBeInTheDocument();
    expect(screen.getByText('Required to continue')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('respects defaultValues from react-hook-form', () => {
    const Form = () => {
      const { control } = useForm<FormValues>({
        defaultValues: { accepted: true }
      });
      return (
        <_ControlledCheckbox<FormValues>
          name="accepted"
          control={control}
          label="Subscribed"
        />
      );
    };

    render(<Form />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('toggles value on click', () => {
    const Form = () => {
      const { control } = useForm<FormValues>({
        defaultValues: { accepted: false }
      });
      return (
        <_ControlledCheckbox<FormValues>
          name="accepted"
          control={control}
          label="Check me"
        />
      );
    };

    render(<Form />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('submits correct value via react-hook-form', async () => {
    const handleSubmit = vi.fn();

    const Form = () => {
      const { control, handleSubmit: rhfSubmit } = useForm<FormValues>({
        defaultValues: { accepted: false }
      });
      return (
        <form onSubmit={rhfSubmit(handleSubmit)}>
          <_ControlledCheckbox<FormValues>
            name="accepted"
            control={control}
            label="Submit me"
          />
          <button type="submit">submit</button>
        </form>
      );
    };

    render(<Form />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole('button', { name: 'submit' });
    const form = submitBtn.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));
    expect(handleSubmit).toHaveBeenCalledWith(
      { accepted: true },
      expect.anything()
    );
  });

  it('respects disabled prop', () => {
    const Form = () => {
      const { control } = useForm<FormValues>({
        defaultValues: { accepted: false }
      });
      return (
        <_ControlledCheckbox<FormValues>
          name="accepted"
          control={control}
          label="Disabled box"
          description="extra"
          disabled
        />
      );
    };

    render(<Form />);

    const checkbox = screen.getByRole('checkbox', { name: /disabled box/i });
    expect(checkbox).toBeDisabled();
    expect(screen.getByText('extra')).toBeInTheDocument();
  });

  it('is accessible via role=checkbox and focusable', () => {
    const Form = () => {
      const { control } = useForm<FormValues>({
        defaultValues: { accepted: false }
      });
      return (
        <_ControlledCheckbox<FormValues>
          name="accepted"
          control={control}
          label="Accessible"
        />
      );
    };

    render(<Form />);

    const checkbox = screen.getByRole('checkbox', { name: /accessible/i });
    checkbox.focus();
    expect(checkbox).toHaveFocus();
  });
});
