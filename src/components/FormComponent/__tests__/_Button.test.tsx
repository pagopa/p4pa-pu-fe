import { describe, it, expect, vi } from 'vitest';
import { screen, render, fireEvent } from '../../../__tests__/renderers';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { _Button } from '../_Button';

i18nTestSetup({});

describe('_Button', () => {
  it('renders label when children are absent', () => {
    render(<_Button label="Submit" />);

    const btn = screen.getByRole('button', { name: 'Submit' });
    expect(btn).toBeInTheDocument();
  });

  it('children take precedence over label', () => {
    render(
      <_Button label="Label fallback">
        <span>Real Child</span>
      </_Button>
    );

    expect(screen.queryByText('Label fallback')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Real Child' })
    ).toBeInTheDocument();
  });

  it('calls onClick handler', () => {
    const onClick = vi.fn();
    render(<_Button label="Click me" onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('respects disabled prop', () => {
    render(<_Button label="Disabled" disabled />);

    const btn = screen.getByRole('button', { name: 'Disabled' });
    expect(btn).toBeDisabled();
  });

  it('has sane defaults: fullWidth, size="medium", variant="contained"', () => {
    render(<_Button label="Defaults" />);

    const btn = screen.getByRole('button', { name: 'Defaults' });

    expect(btn).toHaveClass('MuiButton-root');
    expect(btn).toHaveClass('MuiButton-sizeMedium');
    expect(btn).toHaveClass('MuiButton-contained');
    expect(btn).toHaveClass('MuiButton-fullWidth');
  });

  it('allows overriding size/variant/fullWidth via props', () => {
    render(
      <_Button
        label="Overrides"
        size="medium"
        variant="outlined"
        fullWidth={false}
      />
    );

    const btn = screen.getByRole('button', { name: 'Overrides' });
    expect(btn).toHaveClass('MuiButton-sizeMedium');
    expect(btn).toHaveClass('MuiButton-outlined');
    expect(btn).not.toHaveClass('MuiButton-fullWidth');
  });

  it('passes arbitrary props through to MUI Button', () => {
    render(
      <_Button
        label="Aria"
        id="custom-id"
        className="custom-class"
        aria-label="explicit-aria"
        data-testid="btn-testid"
      />
    );

    const btn = screen.getByTestId('btn-testid');
    expect(btn).toHaveAttribute('id', 'custom-id');
    expect(btn).toHaveClass('custom-class');
    expect(btn).toHaveAttribute('aria-label', 'explicit-aria');
  });

  it('is focusable and accessible via role=button', () => {
    render(<_Button label="Focusable" />);

    const btn = screen.getByRole('button', { name: 'Focusable' });
    btn.focus();
    expect(btn).toHaveFocus();
  });
});
