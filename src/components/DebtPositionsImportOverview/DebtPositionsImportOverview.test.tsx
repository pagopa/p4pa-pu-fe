import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import DebtPositionsImportOverview from './DebtPositionsImportOverview';
import { getIngestionFlowFiles } from '../../api/ingestionFlowFiles';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  generatePath: vi.fn()
}));

vi.mock('../../api/ingestionFlowFiles', () => ({
  getIngestionFlowFiles: vi.fn().mockReturnValue({ data: { content: [] } }),
  IngestionFlowFileType: {
    RECEIPT: 'RECEIPT',
    RECEIPT_PAGOPA: 'RECEIPT_PAGOPA',
    PAYMENTS_REPORTING: 'PAYMENTS_REPORTING',
    PAYMENTS_REPORTING_PAGOPA: 'PAYMENTS_REPORTING_PAGOPA',
    TREASURY_OPI: 'TREASURY_OPI',
    TREASURY_CSV: 'TREASURY_CSV',
    TREASURY_XLS: 'TREASURY_XLS',
    TREASURY_POSTE: 'TREASURY_POSTE',
    DP_INSTALLMENTS: 'DP_INSTALLMENTS'
  }
}));

describe('DebtPositionsImportOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with title', () => {
    render(<DebtPositionsImportOverview />);

    expect(screen.getByText('commons.debtFlow')).toBeDefined();
  });

  it('calls API with correct flow file types', () => {
    render(<DebtPositionsImportOverview />);

    expect(getIngestionFlowFiles).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        flowFileTypes: ['DP_INSTALLMENTS']
      })
    );
  });

  it('renders import button that matches routing category', () => {
    render(<DebtPositionsImportOverview />);

    const importButton = screen.getByLabelText('commons.importFlowButton');
    expect(importButton).toBeDefined();

    expect(importButton.closest('button')).not.toBeDisabled();
  });

  it('integrates with the date picker for filtering', () => {
    render(<DebtPositionsImportOverview />);

    expect(screen.getByLabelText('dates.from')).toBeDefined();
    expect(screen.getByLabelText('dates.to')).toBeDefined();
  });

  it('integrates with search functionality', () => {
    render(<DebtPositionsImportOverview />);

    expect(screen.getByLabelText('commons.searchName')).toBeDefined();
  });

  it('shows filter button for applying filters', () => {
    render(<DebtPositionsImportOverview />);

    expect(screen.getByText('commons.filters.filterResults')).toBeDefined();
  });
});
