import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../__tests__/renderers';
import userEvent from '@testing-library/user-event';
import { _TextField } from '../_TextField';
import { createRef } from 'react';

describe('_TextField', () => {
  it('renders with id as data-testid and label', () => {
    render(<_TextField id="search" label="Search" />);
    const root = screen.getByTestId('search');
    expect(root).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('shows default endAdornment (SearchRoundedIcon) when not disabled', () => {
    render(<_TextField id="search" label="Search" />);
    expect(screen.getByTestId('SearchRoundedIcon')).toBeInTheDocument();
  });

  it('hides endAdornment when noAdornment=true', () => {
    render(<_TextField id="search" label="Search" noAdornment />);
    expect(screen.queryByTestId('SearchRoundedIcon')).not.toBeInTheDocument();
  });

  it('renders a custom adornment when provided', () => {
    render(
      <_TextField
        id="search"
        label="Search"
        adornment={<span data-testid="custom-adornment">%</span>}
      />
    );
    expect(screen.getByTestId('custom-adornment')).toBeInTheDocument();
    expect(screen.queryByTestId('SearchRoundedIcon')).not.toBeInTheDocument();
  });

  it('updates value and calls onChange when typing', async () => {
    const onChange = vi.fn();
    render(<_TextField id="search" label="Search" onChange={onChange} />);
    const input = screen.getByLabelText('Search') as HTMLInputElement;

    const user = userEvent.setup();
    await user.type(input, 'in');

    expect(input.value).toBe('in');
    expect(onChange).toHaveBeenCalled();
  });

  it('applies small size classes to the input', () => {
    render(<_TextField id="search" label="Search" />);
    const input = screen.getByLabelText('Search');
    expect(input).toHaveClass('MuiInputBase-inputSizeSmall');
  });

  it('forwardRef points to the root element which contains the input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<_TextField id="search" label="Search" forwardRef={ref} />);

    expect(ref.current).not.toBeNull();

    const root = ref.current as unknown as HTMLElement;
    expect(root.tagName).toBe('DIV');

    const input = root.querySelector('input');
    expect(input).toBeTruthy();
    expect(input!.id).toBe('search');

    const byTestId = screen.getByTestId('search');
    expect(root).toBe(byTestId);
  });
});
