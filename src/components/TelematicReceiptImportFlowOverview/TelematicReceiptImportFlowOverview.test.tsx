import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import TelematicReceiptImportFlowOverview from './TelematicReceiptImportFlowOverview';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { getIngestionFlowFiles } from '../../api/ingestionFlowFiles';

vi.mock('../../api/ingestionFlowFiles', () => ({
  getIngestionFlowFiles: vi.fn().mockReturnValue({ data: { content: [] } })
}));

describe('TelematicReceiptImportFlowOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    i18nTestSetup({
      'commons.routes.TELEMATIC_RECEIPT_IMPORT_OVERVIEW': 'Telematic Receipt Import',
      'telematicReceiptImportFlowOverview.description': 'Import your telematic receipts',
      'telematicReceiptImportFlowOverview.importFlowButton': 'Import Flow'
    });
  });

  it('renders with correct translations', () => {
    render(<TelematicReceiptImportFlowOverview />);
    
    expect(screen.getByText('Telematic Receipt Import')).toBeDefined();
    expect(screen.getByText('Import your telematic receipts')).toBeDefined();
    expect(screen.getByText('Import Flow')).toBeDefined();
  });

  it('handles missing translations by using keys as fallback', () => {
    i18nTestSetup({});
    
    render(<TelematicReceiptImportFlowOverview />);
    
    expect(screen.getByText('commons.routes.TELEMATIC_RECEIPT_IMPORT_OVERVIEW')).toBeDefined();
    expect(screen.getByText('telematicReceiptImportFlowOverview.description')).toBeDefined();
  });

  it('calls API with correct flow file types', () => {
    render(<TelematicReceiptImportFlowOverview />);
    
    expect(getIngestionFlowFiles).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        flowFileTypes: ['RECEIPT', 'RECEIPT_PAGOPA']
      })
    );
  });

  it('renders import button that matches routing category', () => {
    render(<TelematicReceiptImportFlowOverview />);
    
    const importButton = screen.getByText('Import Flow');
    expect(importButton).toBeDefined();
    
    expect(importButton.closest('button')).not.toBeDisabled();
  });

  it('integrates with the date picker for filtering', () => {
    render(<TelematicReceiptImportFlowOverview />);
    
    expect(screen.getByLabelText('dates.from')).toBeDefined();
    expect(screen.getByLabelText('dates.to')).toBeDefined();
  });

  it('integrates with search functionality', () => {
    render(<TelematicReceiptImportFlowOverview />);
   
    expect(screen.getByLabelText('commons.searchName')).toBeDefined();
  });

  it('shows filter button for applying filters', () => {
    render(<TelematicReceiptImportFlowOverview />);

    expect(screen.getByText('commons.filters.filterResults')).toBeDefined();
  });
});
