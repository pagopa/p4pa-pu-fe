/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../../__tests__/renderers';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { _ControlledSelect } from '../_ControlledSelect';
import type { SelectOptions } from '../_Select';
import type { UseQueryResult } from '@tanstack/react-query';
import utils from '../../../utils';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k })
}));
vi.mock('../../../utils', () => ({ default: { notify: { emit: vi.fn() } } }));

type FormValues = { status: null | 'OPEN' | 'CLOSED' };

const OPTIONS: SelectOptions = [
  { label: 'All', value: null },
  { label: 'Open', value: 'OPEN' },
  { label: 'Closed', value: 'CLOSED' }
];

function FormShell({
  children,
  defaultValues = { status: null } as FormValues
}: Readonly<{
  children: (
    ctx: ReturnType<typeof useForm<FormValues, any, FormValues>>
  ) => React.ReactNode;
  defaultValues?: FormValues;
}>) {
  const methods = useForm<FormValues, any, FormValues>({ defaultValues });
  return <>{children(methods)}</>;
}

describe('_ControlledSelect', () => {
  it('renders with provided options and label', () => {
    render(
      <FormShell>
        {({ control }) => (
          <_ControlledSelect<FormValues>
            name="status"
            control={control}
            label="Status"
            options={OPTIONS}
          />
        )}
      </FormShell>
    );
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('selects an option and reflects the value in the input', async () => {
    render(
      <FormShell>
        {({ control }) => (
          <_ControlledSelect<FormValues>
            name="status"
            control={control}
            label="Status"
            options={OPTIONS}
          />
        )}
      </FormShell>
    );

    const input = screen.getByLabelText('Status') as HTMLInputElement;
    const user = userEvent.setup();

    await user.click(input);
    const option = await screen.findByRole('option', { name: 'Open' });
    await user.click(option);

    await waitFor(() => expect(input.value).toBe('Open'));
  });

  it('is disabled when props.disabled is true', () => {
    render(
      <FormShell>
        {({ control }) => (
          <_ControlledSelect<FormValues>
            name="status"
            control={control}
            label="Status"
            options={OPTIONS}
            disabled
          />
        )}
      </FormShell>
    );
    expect(screen.getByLabelText('Status')).toBeDisabled();
  });

  it('is disabled while fetchFn is loading', () => {
    const fetchFn = (): UseQueryResult<SelectOptions> =>
      ({ data: undefined, isLoading: true, isError: false }) as any;

    render(
      <FormShell>
        {({ control }) => (
          <_ControlledSelect<FormValues>
            name="status"
            control={control}
            label="Status"
            fetchFn={fetchFn}
          />
        )}
      </FormShell>
    );
    expect(screen.getByLabelText('Status')).toBeDisabled();
  });

  it('is disabled when fetchFn returns no options', () => {
    const fetchFn = (): UseQueryResult<SelectOptions> =>
      ({ data: [], isLoading: false, isError: false }) as any;

    render(
      <FormShell>
        {({ control }) => (
          <_ControlledSelect<FormValues>
            name="status"
            control={control}
            label="Status"
            fetchFn={fetchFn}
          />
        )}
      </FormShell>
    );
    expect(screen.getByLabelText('Status')).toBeDisabled();
  });

  it('emits a notification when fetchFn errors', () => {
    const fetchFn = (): UseQueryResult<SelectOptions> =>
      ({ data: undefined, isLoading: false, isError: true }) as any;

    render(
      <FormShell>
        {({ control }) => (
          <_ControlledSelect<FormValues>
            name="status"
            control={control}
            label="Status"
            fetchFn={fetchFn}
          />
        )}
      </FormShell>
    );
    expect(utils.notify.emit).toHaveBeenCalledWith(
      'commons.genericError',
      'error'
    );
  });

  it('renders ErrorMessage when field has an error in fieldState', async () => {
    render(
      <FormShell>
        {({ control, setError }) => {
          setTimeout(() => {
            setError('status', { type: 'manual', message: 'requiredField' });
          }, 0);

          return (
            <_ControlledSelect<FormValues>
              name="status"
              control={control}
              label="Status"
              options={OPTIONS}
              required
            />
          );
        }}
      </FormShell>
    );

    expect(await screen.findByText(/requiredField/)).toBeInTheDocument();
  });
});
