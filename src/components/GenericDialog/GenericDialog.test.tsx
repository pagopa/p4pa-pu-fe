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

  it('renders with data-testid when provided', () => {
    const testId = 'test-dialog';
    render(<GenericDialog {...defaultProps} data-testid={testId} />);

    expect(screen.getByTestId(testId)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-confirm-button`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-cancel-button`)).toBeInTheDocument();
  });

  it('does not render data-testid on buttons when no testId is provided', () => {
    render(<GenericDialog {...defaultProps} />);

    const confirmButton = screen.getByText('Confirm');
    const cancelButton = screen.getByText('Cancel');

    expect(confirmButton).not.toHaveAttribute('data-testid');
    expect(cancelButton).not.toHaveAttribute('data-testid');
  });

  it('allows clicking confirm and cancel buttons via testId', () => {
    const testId = 'clickable-dialog';
    render(<GenericDialog {...defaultProps} data-testid={testId} />);

    fireEvent.click(screen.getByTestId(`${testId}-confirm-button`));
    expect(defaultProps.onConfirm).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId(`${testId}-cancel-button`));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('renders only confirm button when no cancelLabel is provided', () => {
    const testId = 'confirm-only-dialog';
    const propsWithoutCancel = { ...defaultProps, cancelLabel: undefined };
    render(<GenericDialog {...propsWithoutCancel} data-testid={testId} />);

    expect(screen.getByTestId(`${testId}-confirm-button`)).toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cancel-button`)
    ).not.toBeInTheDocument();
  });
});
