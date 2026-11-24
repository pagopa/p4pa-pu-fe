import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@core/__tests__/renderers';

import { BaseDialog } from '.';

const onClose = vi.fn();

const renderDialog = () =>
  render(
    <BaseDialog open onClose={onClose} title="Dialog title">
      Dialog content
    </BaseDialog>
  );

describe('BaseDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and content', () => {
    renderDialog();

    expect(screen.getByText('Dialog title')).toBeInTheDocument();
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    render(
      <BaseDialog
        open
        onClose={onClose}
        title="Dialog title"
        description="Dialog description"
      >
        Dialog content
      </BaseDialog>
    );

    expect(screen.getByText('Dialog description')).toBeInTheDocument();
  });

  it('renders the actions when provided', () => {
    render(
      <BaseDialog
        open
        onClose={onClose}
        title="Dialog title"
        actions={<button type="button">Action</button>}
      >
        Dialog content
      </BaseDialog>
    );

    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('calls onClose when the close icon is clicked', () => {
    renderDialog();

    fireEvent.click(
      screen.getByRole('button', { name: 'commons.closeDialog' })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
