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
  getIngestionFlowFileError: vi.fn(),
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
  const mockDataWithContent = {
    content: [
      {
        ingestionFlowFileId: 63,
        fileName: 'test-file.zip',
        creationDate: '2025-02-05T16:24:49.148144',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'UPLOADED'
      }
    ],
    totalPages: 1,
    totalElements: 1,
    number: 0,
    size: 10
  };

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
        ingestionFlowFileTypes: ['DP_INSTALLMENTS']
      })
    );
  });

  it('renders empty state when data is empty', () => {
    (getIngestionFlowFiles as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: 10
      }
    });

    render(<DebtPositionsImportOverview />);

    expect(screen.getByText('commons.noFlows')).toBeDefined();
    expect(screen.getByText('commons.importFlows')).toBeDefined();
  });

  it('renders grid and filters when data is available', () => {
    (getIngestionFlowFiles as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockDataWithContent
    });

    render(<DebtPositionsImportOverview />);

    expect(screen.getByLabelText('commons.searchName')).toBeDefined();
    expect(screen.getByLabelText('commons.state')).toBeDefined();
    expect(screen.getByLabelText('dates.from')).toBeDefined();
    expect(screen.getByLabelText('dates.to')).toBeDefined();
    expect(screen.getByText('commons.filters.filterResults')).toBeDefined();
  });
});
