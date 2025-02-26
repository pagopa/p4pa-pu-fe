import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { getIngestionFlowFiles } from '../../api/ingestionFlowFiles';
import ReportingImportFlowOverview from './ReportingImportFlowOverview';

vi.mock('../../api/ingestionFlowFiles', () => ({
  getIngestionFlowFiles: vi.fn().mockReturnValue({ data: { content: [] } })
}));

describe('ReportingImportFlowOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    i18nTestSetup({
      'commons.routes.REPORTING_IMPORT_FLOW_OVERVIEW': 'Reporting Import',
      'reportingImportFlowOverview.description': 'Import your Reporting',
      'commons.importFlowButton': 'Import Flow'
    });
  });

  it('renders with correct translations', () => {
    render(<ReportingImportFlowOverview />);
    
    expect(screen.getByText('Reporting Import')).toBeDefined();
    expect(screen.getByText('Import your Reporting')).toBeDefined();
  });

  it('handles missing translations by using keys as fallback', () => {
    i18nTestSetup({});
    
    render(<ReportingImportFlowOverview />);
    
    expect(screen.getByText('commons.routes.REPORTING_IMPORT_FLOW_OVERVIEW')).toBeDefined();
    expect(screen.getByText('reportingImportFlowOverview.description')).toBeDefined();
  });

  it('calls API with correct flow file types', () => {
    render(<ReportingImportFlowOverview />);
    
    expect(getIngestionFlowFiles).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        flowFileTypes: ['PAYMENTS_REPORTING', 'PAYMENTS_REPORTING_PAGOPA']
      })
    );
  });

  it('renders import button that matches routing category', () => {
    render(<ReportingImportFlowOverview />);
    
    const importButton = screen.getByText('Import Flow');
    expect(importButton).toBeDefined();
    
    expect(importButton.closest('button')).not.toBeDisabled();
  });

  it('integrates with the date picker for filtering', () => {
    render(<ReportingImportFlowOverview />);
    
    expect(screen.getByLabelText('dates.from')).toBeDefined();
    expect(screen.getByLabelText('dates.to')).toBeDefined();
  });

  it('integrates with search functionality', () => {
    render(<ReportingImportFlowOverview />);
   
    expect(screen.getByLabelText('commons.searchName')).toBeDefined();
  });

  it('shows filter button for applying filters', () => {
    render(<ReportingImportFlowOverview />);

    expect(screen.getByText('commons.filters.filterResults')).toBeDefined();
  });
});
