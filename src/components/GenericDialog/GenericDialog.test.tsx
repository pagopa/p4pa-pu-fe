import { render } from '../../__tests__/renderers';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import GenericDialog from './GenericDialog';

const defaultProps = {
  open: true,
  title: 'Test Title',
  message: 'Test message',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  onConfirm: vi.fn(),
  onClose: vi.fn()
};

describe('GenericDialog', () => {
  it('renders title and message', () => {
    render(<GenericDialog {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders confirm and cancel buttons', () => {
    render(<GenericDialog {...defaultProps} />);

    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(<GenericDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onConfirm when Confirm button is clicked', () => {
    render(<GenericDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Confirm'));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });
});
