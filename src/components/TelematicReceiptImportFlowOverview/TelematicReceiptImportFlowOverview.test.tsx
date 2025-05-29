import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import TelematicReceiptImportFlowOverview from './TelematicReceiptImportFlowOverview';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { getIngestionFlowFiles } from '../../api/ingestionFlowFiles';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  generatePath: vi.fn()
}));

vi.mock('../../api/ingestionFlowFiles', () => ({
  getIngestionFlowFiles: vi.fn().mockReturnValue({ data: { content: [] } }),
  getIngestionFlowFileError: vi.fn(),
  getIngestionFlowFile: vi.fn(),
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

describe('TelematicReceiptImportFlowOverview', () => {
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

    i18nTestSetup({
      'commons.routes.TELEMATIC_RECEIPT_IMPORT_OVERVIEW':
        'Telematic Receipt Import',
      'telematicReceiptImportFlowOverview.description':
        'Import your telematic receipts',
      'commons.importFlow': 'Import Flow',
      'commons.importFlows': 'Import Flows',
      'commons.noFlows': 'No flows available'
    });
  });

  it('renders with correct translations', () => {
    render(<TelematicReceiptImportFlowOverview />);

    expect(screen.getByText('Telematic Receipt Import')).toBeDefined();
    expect(screen.getByText('Import your telematic receipts')).toBeDefined();
  });

  it('handles missing translations by using keys as fallback', () => {
    i18nTestSetup({});

    render(<TelematicReceiptImportFlowOverview />);

    expect(
      screen.getByText('commons.routes.TELEMATIC_RECEIPT_IMPORT_OVERVIEW')
    ).toBeDefined();
    expect(
      screen.getByText('telematicReceiptImportFlowOverview.description')
    ).toBeDefined();
  });

  it('calls API with correct flow file types', () => {
    render(<TelematicReceiptImportFlowOverview />);

    expect(getIngestionFlowFiles).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        ingestionFlowFileTypes: ['RECEIPT', 'RECEIPT_PAGOPA']
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

    render(<TelematicReceiptImportFlowOverview />);

    expect(screen.getByText('No flows available')).toBeDefined();
    expect(screen.getByText('Import Flows')).toBeDefined();
  });

  it('renders grid and filters when data is available', () => {
    (getIngestionFlowFiles as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockDataWithContent
    });

    render(<TelematicReceiptImportFlowOverview />);

    const importButton = screen.getByText('Import Flow');
    expect(importButton).toBeDefined();
    expect(importButton.closest('button')).not.toBeDisabled();

    expect(screen.getByLabelText('commons.searchName')).toBeDefined();
    expect(screen.getByLabelText('commons.state')).toBeDefined();
    expect(screen.getByTestId('filter-container')).toBeDefined();
    expect(screen.getByText('commons.filters.filterResults')).toBeDefined();
  });
});
