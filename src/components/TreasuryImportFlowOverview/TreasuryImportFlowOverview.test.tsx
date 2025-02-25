import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { getIngestionFlowFiles } from '../../api/ingestionFlowFiles';
import TreasuryImportFlowOverview from './TreasuryImportFlowOverview';

vi.mock('../../api/ingestionFlowFiles', () => ({
  getIngestionFlowFiles: vi.fn().mockReturnValue({ data: { content: [] } })
}));

describe('TreasuryImportFlowOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    i18nTestSetup({
      'commons.routes.TREASURY_IMPORT_FLOW_OVERVIEW': 'Treasury Import',
      'treasuryImportFlowOverview.description': 'Import your Treasury',
      'commons.importFlowButton': 'Import Flow'
    });
  });

  it('renders with correct translations', () => {
    render(<TreasuryImportFlowOverview />);
    
    expect(screen.getByText('Treasury Import')).toBeDefined();
    expect(screen.getByText('Import your Treasury')).toBeDefined();
  });

  it('handles missing translations by using keys as fallback', () => {
    i18nTestSetup({});
    
    render(<TreasuryImportFlowOverview />);
    
    expect(screen.getByText('commons.routes.TREASURY_IMPORT_FLOW_OVERVIEW')).toBeDefined();
    expect(screen.getByText('treasuryImportFlowOverview.description')).toBeDefined();
  });

  it('calls API with correct flow file types', () => {
    render(<TreasuryImportFlowOverview />);
    
    expect(getIngestionFlowFiles).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        flowFileTypes: ['TREASURY_CSV', 'TREASURY_OPI', 'TREASURY_POSTE', 'TREASURY_XLS']
      })
    );
  });

  it('renders import button that matches routing category', () => {
    render(<TreasuryImportFlowOverview />);
    
    const importButton = screen.getByText('Import Flow');
    expect(importButton).toBeDefined();
    
    expect(importButton.closest('button')).not.toBeDisabled();
  });

  it('integrates with the date picker for filtering', () => {
    render(<TreasuryImportFlowOverview />);
    
    expect(screen.getByLabelText('dates.from')).toBeDefined();
    expect(screen.getByLabelText('dates.to')).toBeDefined();
  });

  it('integrates with search functionality', () => {
    render(<TreasuryImportFlowOverview />);
   
    expect(screen.getByLabelText('commons.searchName')).toBeDefined();
  });

  it('shows filter button for applying filters', () => {
    render(<TreasuryImportFlowOverview />);

    expect(screen.getByText('commons.filters.filterResults')).toBeDefined();
  });
});
