import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RemovePaymentsConfirmModal } from './RemovePaymentsConfirmModal';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('RemovePaymentsConfirmModal', () => {
  const defaultProps = {
    open: true,
    selectedAssessmentDetailIds: [123, 456],
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    'data-testid': 'test-modal'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when open is true', () => {
    render(<RemovePaymentsConfirmModal {...defaultProps} />);

    expect(screen.getByTestId('test-modal')).toBeInTheDocument();
    expect(
      screen.getByText('Sei sicuro di voler rimuovere i pagamenti?')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Dopo la rimozione, i pagamenti non compariranno più nell'elenco dell'accertamento."
      )
    ).toBeInTheDocument();
  });

  it('should not render when open is false', () => {
    render(<RemovePaymentsConfirmModal {...defaultProps} open={false} />);

    expect(screen.queryByTestId('test-modal')).not.toBeInTheDocument();
  });

  it('should display correct count for single payment', () => {
    const props = { ...defaultProps, selectedAssessmentDetailIds: [123] };
    render(<RemovePaymentsConfirmModal {...props} />);

    expect(screen.getByText('1 pagamento selezionato')).toBeInTheDocument();
  });

  it('should display correct count for multiple payments', () => {
    render(<RemovePaymentsConfirmModal {...defaultProps} />);

    expect(screen.getByText('2 pagamenti selezionati')).toBeInTheDocument();
  });

  it('should call onCancel when Annulla button is clicked', () => {
    render(<RemovePaymentsConfirmModal {...defaultProps} />);

    const cancelButton = screen.getByTestId('test-modal-cancel-button');
    fireEvent.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm with assessmentDetailIds when Rimuovi button is clicked', () => {
    render(<RemovePaymentsConfirmModal {...defaultProps} />);

    const confirmButton = screen.getByTestId('test-modal-confirm-button');
    fireEvent.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).toHaveBeenCalledWith([123, 456]);
  });

  it('should call onCancel when dialog backdrop is clicked', () => {
    render(<RemovePaymentsConfirmModal {...defaultProps} />);

    // Click outside the dialog (backdrop)
    const backdrop = screen
      .getByTestId('test-modal')
      .querySelector('.MuiBackdrop-root');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should disable Rimuovi button when no payments are selected', () => {
    const props = { ...defaultProps, selectedAssessmentDetailIds: [] };
    render(<RemovePaymentsConfirmModal {...props} />);

    const confirmButton = screen.getByTestId('test-modal-confirm-button');
    expect(confirmButton).toBeDisabled();
  });

  it('should not show count text when no payments are selected', () => {
    const props = { ...defaultProps, selectedAssessmentDetailIds: [] };
    render(<RemovePaymentsConfirmModal {...props} />);

    expect(screen.queryByText(/pagamento selezionato/)).not.toBeInTheDocument();
  });

  it('should have correct button styles and variants', () => {
    render(<RemovePaymentsConfirmModal {...defaultProps} />);

    const cancelButton = screen.getByTestId('test-modal-cancel-button');
    const confirmButton = screen.getByTestId('test-modal-confirm-button');

    expect(cancelButton).toHaveClass('MuiButton-outlined');
    expect(confirmButton).toHaveClass('MuiButton-contained');
  });
});
