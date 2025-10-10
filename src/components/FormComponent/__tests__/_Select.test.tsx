import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '../../../__tests__/renderers';
import userEvent from '@testing-library/user-event';
import { _Select, SelectOptions } from '../_Select';

const OPTIONS: SelectOptions = [
  { label: 'All', value: null },
  { label: 'Open', value: 'OPEN' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'Locked', value: 'LOCKED', disabled: true }
];

const setup = (props?: Partial<React.ComponentProps<typeof _Select>>) => {
  const onChange = vi.fn();
  render(
    <_Select
      id="status-select"
      label="Status"
      options={OPTIONS}
      onChange={onChange}
      {...props}
    />
  );
  const input = screen.getByLabelText('Status');
  return { input: input as HTMLInputElement, onChange };
};

describe('_Select', () => {
  it('renders input with label and no initial selection', () => {
    const { input } = setup();
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('');
  });

  it('opens the menu and selects an option, calling onChange with the value', async () => {
    const { input, onChange } = setup();
    const user = userEvent.setup();

    await user.click(input);
    const option = await screen.findByRole('option', { name: 'Open' });
    await user.click(option);

    expect(onChange).toHaveBeenCalledWith('OPEN');
    expect(input.value).toBe('Open');
  });

  it('respects the value prop by setting initial selection', () => {
    const { input } = setup({ value: 'CLOSED' });
    expect(input.value).toBe('Closed');
  });

  it('updates selection when value prop changes', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <_Select
        id="status-select"
        label="Status"
        options={OPTIONS}
        value={'OPEN'}
        onChange={onChange}
      />
    );
    const input = screen.getByLabelText('Status') as HTMLInputElement;
    expect(input.value).toBe('Open');

    rerender(
      <_Select
        id="status-select"
        label="Status"
        options={OPTIONS}
        value={'CLOSED'}
        onChange={onChange}
      />
    );
    expect(input.value).toBe('Closed');
  });

  it('marks disabled options as not selectable', async () => {
    const { input, onChange } = setup();
    const user = userEvent.setup();

    await user.click(input);

    const disabledOption = await screen.findByRole('option', {
      name: 'Locked'
    });
    expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{Enter}');

    expect(onChange).not.toHaveBeenCalledWith('LOCKED');
    expect(input.value).toBe('All');
  });

  it('applies disabled prop to input', () => {
    const { input } = setup({ disabled: true });
    expect(input).toBeDisabled();
  });

  it('allows clearing the selection and calls onChange(undefined)', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <_Select
        id="status-select"
        label="Status"
        options={OPTIONS}
        value={'OPEN'}
        onChange={onChange}
      />
    );
    const input = screen.getByLabelText('Status') as HTMLInputElement;
    expect(input.value).toBe('Open');

    const root = screen.getByTestId('status-select');
    const clearBtn = within(root).getByTitle('Clear');
    const user = userEvent.setup();
    await user.click(clearBtn);

    expect(onChange).toHaveBeenCalledWith(undefined);

    rerender(
      <_Select
        id="status-select"
        label="Status"
        options={OPTIONS}
        value={undefined}
        onChange={onChange}
      />
    );

    // After parent updates value prop, input should be cleared
    expect(input.value).toBe('');
  });

  it('updates inputValue when typing in the field', async () => {
    const { input } = setup();
    const user = userEvent.setup();
    await user.type(input, 'Op');
    expect(input.value).toBe('Op');
  });

  it('uses id as data-testid on the Autocomplete', () => {
    setup();
    expect(screen.getByTestId('status-select')).toBeInTheDocument();
  });
});
