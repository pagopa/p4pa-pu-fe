import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { getExportFiles } from '../../api/exportFiles';
import TelematicReceiptFlowExportOverview from './TelematicReceiptFlowExportOverview';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
    generatePath: vi.fn()
  };
});

vi.mock('../../api/exportFiles', () => ({
  getExportFiles: vi.fn().mockReturnValue({ data: { content: [] } }),
  ExportFileStatus: {
    COMPLETED: 'COMPLETED'
  },
  ExportFileTypeEnum: {
    PAID: 'PAID'
  }
}));

describe('TelematicReceiptExportFlowOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    i18nTestSetup({
      'commons.exportedFlows': 'Exported flows',
      'telematicReceiptFlowExportOverview.description': 'Export your receipts',
      'exportFlow.buttonReservationExport': 'New Export'
    });
  });

  it('renders with correct translations', () => {
    render(<TelematicReceiptFlowExportOverview />);

    expect(screen.getByText('Exported flows')).toBeDefined();
    expect(screen.getByText('Export your receipts')).toBeDefined();
  });

  it('renders export button with routing', () => {
    render(<TelematicReceiptFlowExportOverview />);

    const button = screen.getByText('New Export');
    expect(button).toBeDefined();
    expect(button.closest('button')).not.toBeDisabled();
  });

  it('calls API with correct export file type', () => {
    render(<TelematicReceiptFlowExportOverview />);

    expect(getExportFiles).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        exportFileType: 'PAID'
      })
    );
  });
});
