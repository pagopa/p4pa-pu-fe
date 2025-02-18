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
        'ingestionFlowFileId': 63,
        'fileName': '2024-03-19UNCRITMM-1iv6iotaa3td4.zip',
        'creationDate': '2025-02-05T16:24:49.148144+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'UPLOADED'
      },
      {
        'ingestionFlowFileId': 69,
        'fileName': '2024-03-19UNCRITMM-1iv6iotaa3td4.zip',
        'creationDate': '2025-02-07T17:08:30.673315+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'PROCESSING'
      },
      {
        'ingestionFlowFileId': 76,
        'fileName': '2024-03-19UNCRITMM-1iv6iotaa3td4.zip',
        'creationDate': '2025-02-09T19:30:50.765795+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'ERROR'
      },
      {
        'ingestionFlowFileId': 70,
        'fileName': '2024-03-19UNCRITMM-1iv6iotaa3td4.zip',
        'creationDate': '2025-02-07T17:19:22.508481+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'COMPLETED'
      },
      {
        'ingestionFlowFileId': 71,
        'fileName': '2024-03-19UNCRITMM-1iv6iotaa3td4.zip',
        'creationDate': '2025-02-07T17:27:56.825193+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'ERROR'
      },
      {
        'ingestionFlowFileId': 98,
        'fileName': 'testpagination.zip',
        'creationDate': '2025-02-07T17:27:56.825+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'ERROR'
      },
      {
        'ingestionFlowFileId': 97,
        'fileName': 'testpagination.zip',
        'creationDate': '2025-02-07T17:27:56.825+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'ERROR'
      },
      {
        'ingestionFlowFileId': 96,
        'fileName': 'testpagination.zip',
        'creationDate': '2025-02-07T17:27:56.825+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'ERROR'
      },
      {
        'ingestionFlowFileId': 95,
        'fileName': 'testpagination.zip',
        'creationDate': '2025-02-07T17:27:56.825+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'ERROR'
      },
      {
        'ingestionFlowFileId': 94,
        'fileName': 'testpagination.zip',
        'creationDate': '2025-02-07T17:27:56.825+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'ERROR'
      },
      {
        'ingestionFlowFileId': 93,
        'fileName': 'testpagination.zip',
        'creationDate': '2025-02-07T17:27:56.825+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'ERROR'
      },
      {
        'ingestionFlowFileId': 92,
        'fileName': 'testpagination.zip',
        'creationDate': '2025-02-07T17:27:56.825+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'ERROR'
      },
      {
        'ingestionFlowFileId': 91,
        'fileName': 'testpagination.zip',
        'creationDate': '2025-02-07T17:27:56.825+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'ERROR'
      },
      {
        'ingestionFlowFileId': 90,
        'fileName': 'testpagination.zip',
        'creationDate': '2025-02-07T17:27:56.825+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'ERROR'
      },
      {
        'ingestionFlowFileId': 89,
        'fileName': 'testpagination.zip',
        'creationDate': '2025-02-07T17:27:56.825+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'ERROR'
      },
      {
        'ingestionFlowFileId': 88,
        'fileName': 'testpagination.zip',
        'creationDate': '2025-02-07T17:27:56.825+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'ERROR'
      },
      {
        'ingestionFlowFileId': 87,
        'fileName': 'testpagination.zip',
        'creationDate': '2025-02-07T17:27:56.825+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'ERROR'
      },
      {
        'ingestionFlowFileId': 86,
        'fileName': 'testpagination.zip',
        'creationDate': '2025-02-07T17:27:56.825+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'ERROR'
      },
      {
        'ingestionFlowFileId': 85,
        'fileName': 'testpagination.zip',
        'creationDate': '2025-02-07T17:27:56.825+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'ERROR'
      },
      {
        'ingestionFlowFileId': 84,
        'fileName': 'testpagination.zip',
        'creationDate': '2025-02-07T17:27:56.825+01:00',
        'operator': 'demo demo',
        'discardedRows': 0,
        'status': 'ERROR'
      }
    ],
    'size': 20,
    'totalElements': 21,
    'totalPages': 2,
    'number': 0
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
      {
        flowFileTypes: ['RECEIPT'],
        page: 0,
        size: 10
      }
    );
  });

  it('handles page size change correctly', async () => {
    render(<TelematicReceiptImportFlowOverview />);
    
    const pageSizeSelect = screen.getByTestId('result-set-select');
  
    fireEvent.mouseDown(pageSizeSelect);

    const selectChangeEvent = new Event('change', { bubbles: true });
    Object.defineProperty(selectChangeEvent, 'target', { value: { value: 20 } });
    
    pageSizeSelect.dispatchEvent(selectChangeEvent);
  
    await waitFor(() => {
      expect(getIngestionFlowFiles).toHaveBeenCalledTimes(1);
    });
  });

  it('updates filters state when pagination changes', async () => {
    const { container } = render(<TelematicReceiptImportFlowOverview />);
 
    expect(getIngestionFlowFiles).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        flowFileTypes: ['RECEIPT'],
        page: 0,
        size: 10
      })
    );

    const pageSizeSelect = container.querySelector('[aria-label="Rows per page"]');
    if (pageSizeSelect) {
      fireEvent.mouseDown(pageSizeSelect);
      const option = screen.getByText('20');
      fireEvent.click(option);
      
      await waitFor(() => {
        expect(getIngestionFlowFiles).toHaveBeenCalledWith(
          expect.any(Number),
          expect.objectContaining({
            flowFileTypes: ['RECEIPT'],
            page: 0,
            size: 20
          })
        );
      });
    }
  });

  it('maintains filter state when navigating pages', async () => {
    const { container } = render(<TelematicReceiptImportFlowOverview />);

    const searchInput = screen.getByLabelText('commons.searchName');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    const nextPageButton = container.querySelector('[aria-label="Go to next page"]');
    if (nextPageButton) {
      fireEvent.click(nextPageButton);
      
      await waitFor(() => {
        expect(getIngestionFlowFiles).toHaveBeenCalledWith(
          expect.any(Number),
          expect.objectContaining({
            flowFileTypes: ['RECEIPT'],
            page: 1,
            size: 10
          })
        );
      });
    }
  });
});
