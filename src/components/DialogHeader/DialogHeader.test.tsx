import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@core/__tests__/renderers';

import { DialogHeader } from '.';

describe('DialogHeader', () => {
  it('renders the title as a level 2 heading', () => {
    render(<DialogHeader id="dialog-title" title="Dialog title" />);

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Dialog title'
    });
    expect(heading).toHaveAttribute('id', 'dialog-title');
  });

  it('renders the close button outside the heading', () => {
    render(
      <DialogHeader id="dialog-title" title="Dialog title" onClose={vi.fn()} />
    );

    const heading = screen.getByRole('heading', { level: 2 });
    const closeButton = screen.getByRole('button', {
      name: 'commons.closeDialog'
    });

    expect(heading).not.toContainElement(closeButton);
    expect(heading).toHaveAccessibleName('Dialog title');
  });

  it('does not render the close button when onClose is not provided', () => {
    render(<DialogHeader id="dialog-title" title="Dialog title" />);

    expect(
      screen.queryByRole('button', { name: 'commons.closeDialog' })
    ).not.toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <DialogHeader id="dialog-title" title="Dialog title" onClose={onClose} />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'commons.closeDialog' })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
