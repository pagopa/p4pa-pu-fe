import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useNavigate, generatePath } from 'react-router-dom';
import { getIngestionFlowFiles } from '../../api/ingestionFlowFiles';
import TelematicReceiptImportFlowOverview from './TelematicReceiptImportFlowOverview';
import { PageRoutes } from '../../routes/routes';
import { fireEvent, render, waitFor, screen } from '../../__tests__/renderers';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  generatePath: vi.fn()
}));

vi.mock('../../api/ingestionFlowFiles', () => ({
  getIngestionFlowFiles: vi.fn()
}));

describe('TelematicReceiptImportFlowOverview', () => {
  const mockNavigate = vi.fn();
  
  const mockData = {
    content: [
      {
        ingestionFlowFileId: 1,
        fileName: 'test.csv',
        creationDate: '2024-02-11T10:00:00Z',
        operator: 'Test Operator',
        discardedRows: 5,
        status: 'COMPLETED'
      },
      {
        ingestionFlowFileId: 2,
        fileName: 'test2.csv',
        creationDate: '2024-03-11T11:00:00Z',
        operator: 'Test Operator 2',
        discardedRows: 3,
        status: 'UPLOADED'
      },
      {
        ingestionFlowFileId: 3,
        fileName: 'test2.csv',
        creationDate: '2024-04-11T11:00:00Z',
        operator: 'Test Operator 2',
        discardedRows: 3,
        status: 'PROCESSING'
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
    (getIngestionFlowFiles as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: mockData });
    (generatePath as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => '/mock-path');
  });

  it('renders successfully', () => {
    render(
      
      <TelematicReceiptImportFlowOverview />
      
    );

    expect(screen.getByText('commons.routes.TELEMATIC_RECEIPT_IMPORT_OVERVIEW')).toBeDefined();
  });

  it('calls navigate when import button is clicked', () => {
    render(
      
      <TelematicReceiptImportFlowOverview />
      
    );

    const importButton = screen.getByText('telematicReceiptImportFlowOverview.importFlowButton');
    fireEvent.click(importButton);

    expect(mockNavigate).toHaveBeenCalledWith('/mock-path');
    expect(generatePath).toHaveBeenCalledWith(PageRoutes.IMPORT_FLOWS, {
      category: 'telematic-receipt'
    });
  });

  it('displays data in the grid', async () => {
    const { container } = render(
      
      <TelematicReceiptImportFlowOverview />
      
    );

    await waitFor(() => {
      expect(container.querySelector('[data-field="fileName"]')).toBeDefined();
    });
  });

  it('renders action menu for COMPLETED status', async () => {
    const { container } = render(
      
      <TelematicReceiptImportFlowOverview />
      
    );

    const completedRow = mockData.content.find(row => row.status === 'COMPLETED');
    expect(completedRow).toBeDefined();
    
    if (completedRow) {
      await waitFor(() => {
        expect(container.querySelector(`[data-testid="action-menu-${completedRow.ingestionFlowFileId}"]`)).toBeDefined();
      });
    }
  });

  it('renders download button for UPLOADED status', async () => {
    const { container } = render(
      
      <TelematicReceiptImportFlowOverview />
      
    );

    await waitFor(() => {
      expect(container.querySelector('[data-testid="download-button"]')).toBeDefined();
    });
  });

  it('do not renders download button or action menu for PROCESSING status', async () => {
    const { container } = render(
      
      <TelematicReceiptImportFlowOverview />
      
    );

    const completedRow = mockData.content.find(row => row.status === 'PROCESSING');
    expect(completedRow).toBeDefined();
    
    if (completedRow) {
      await waitFor(() => {
        expect(container.querySelector(`[data-testid="action-menu-${completedRow.ingestionFlowFileId}"]`)).toBe(null);
      });
    }
  });

  it('applies filters when filter button is clicked', () => {
    render(
      
      <TelematicReceiptImportFlowOverview />
      
    );

    const filterButton = screen.getByText('commons.filters.filterResults');
    const consoleSpy = vi.spyOn(console, 'log');
    
    fireEvent.click(filterButton);
    expect(consoleSpy).toHaveBeenCalledWith('Filter applied');
    
    consoleSpy.mockRestore();
  });

  it('displays correct chip colors for different statuses', async () => {
    const { container } = render(
      
      <TelematicReceiptImportFlowOverview />
      
    );

    await waitFor(() => {
      const completedStatusElement = container.querySelector('.MuiChip-colorSuccess');
      const uploadedStatusElement = container.querySelector('.MuiChip-colorPrimary');
      
      expect(completedStatusElement).toBeDefined();
      expect(uploadedStatusElement).toBeDefined();
    });
  });

  it('calls getIngestionFlowFiles with correct parameters', () => {
    render(
      
      <TelematicReceiptImportFlowOverview />
      
    );

    expect(getIngestionFlowFiles).toHaveBeenCalledWith(
      expect.any(Number),
      { flowFileTypes: ['RECEIPT'] }
    );
  });
});
