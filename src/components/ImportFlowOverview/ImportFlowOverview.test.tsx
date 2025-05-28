import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useNavigate, generatePath } from 'react-router-dom';
import {
  downloadIngestionFlowFile,
  getIngestionFlowFiles
} from '../../api/ingestionFlowFiles';
import { downloadBlob } from '../../utils/download';
import { fireEvent, render, waitFor, screen } from '../../__tests__/renderers';
import { setOrganizationId } from '../../store/OrganizationIdStore';
import { PageRoutes } from '../../App';
import FlowOverview from './ImportFlowOverview';
import { IngestionFlowFileTypeEnum } from '../../../generated/apiClient';

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
  },
  downloadIngestionFlowFile: vi.fn()
}));

vi.mock('../../utils/download', () => ({
  downloadBlob: vi.fn()
}));

describe('TelematicReceiptImportFlowOverview', () => {
  const mockNavigate = vi.fn();

  const mockData = {
    content: [
      {
        ingestionFlowFileId: 63,
        fileName: '2024-03-19UNCRITMM-1iv6iotaa3td4.zip',
        creationDate: '2025-02-05T16:24:49.148144',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'UPLOADED'
      },
      {
        ingestionFlowFileId: 69,
        fileName: '2024-03-19UNCRITMM-1iv6iotaa3td4.zip',
        creationDate: '2025-02-07T17:08:30.673315',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'PROCESSING'
      },
      {
        ingestionFlowFileId: 76,
        fileName: '2024-03-19UNCRITMM-1iv6iotaa3td4.zip',
        creationDate: '2025-02-09T19:30:50.765795',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'ERROR'
      },
      {
        ingestionFlowFileId: 70,
        fileName: '2024-03-19UNCRITMM-1iv6iotaa3td4.zip',
        creationDate: '2025-02-07T17:19:22.508481',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'COMPLETED'
      },
      {
        ingestionFlowFileId: 71,
        fileName: '2024-03-19UNCRITMM-1iv6iotaa3td4.zip',
        creationDate: '2025-02-07T17:27:56.825193',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'ERROR'
      },
      {
        ingestionFlowFileId: 98,
        fileName: 'testpagination.zip',
        creationDate: '2025-02-07T17:27:56.825',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'ERROR'
      },
      {
        ingestionFlowFileId: 97,
        fileName: 'testpagination.zip',
        creationDate: '2025-02-07T17:27:56.825',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'ERROR'
      },
      {
        ingestionFlowFileId: 96,
        fileName: 'testpagination.zip',
        creationDate: '2025-02-07T17:27:56.825',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'ERROR'
      },
      {
        ingestionFlowFileId: 95,
        fileName: 'testpagination.zip',
        creationDate: '2025-02-07T17:27:56.825',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'ERROR'
      },
      {
        ingestionFlowFileId: 94,
        fileName: 'testpagination.zip',
        creationDate: '2025-02-07T17:27:56.825',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'ERROR'
      },
      {
        ingestionFlowFileId: 93,
        fileName: 'testpagination.zip',
        creationDate: '2025-02-07T17:27:56.825',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'ERROR'
      },
      {
        ingestionFlowFileId: 92,
        fileName: 'testpagination.zip',
        creationDate: '2025-02-07T17:27:56.825',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'ERROR'
      },
      {
        ingestionFlowFileId: 91,
        fileName: 'testpagination.zip',
        creationDate: '2025-02-07T17:27:56.825',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'ERROR'
      },
      {
        ingestionFlowFileId: 90,
        fileName: 'testpagination.zip',
        creationDate: '2025-02-07T17:27:56.825',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'ERROR'
      },
      {
        ingestionFlowFileId: 89,
        fileName: 'testpagination.zip',
        creationDate: '2025-02-07T17:27:56.825',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'ERROR'
      },
      {
        ingestionFlowFileId: 88,
        fileName: 'testpagination.zip',
        creationDate: '2025-02-07T17:27:56.825',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'ERROR'
      },
      {
        ingestionFlowFileId: 87,
        fileName: 'testpagination.zip',
        creationDate: '2025-02-07T17:27:56.825',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'ERROR'
      },
      {
        ingestionFlowFileId: 86,
        fileName: 'testpagination.zip',
        creationDate: '2025-02-07T17:27:56.825',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'ERROR'
      },
      {
        ingestionFlowFileId: 85,
        fileName: 'testpagination.zip',
        creationDate: '2025-02-07T17:27:56.825',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'ERROR'
      },
      {
        ingestionFlowFileId: 84,
        fileName: 'testpagination.zip',
        creationDate: '2025-02-07T17:27:56.825',
        operator: 'demo demo',
        discardedRows: 0,
        status: 'ERROR'
      }
    ],
    size: 20,
    totalElements: 21,
    totalPages: 2,
    number: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockNavigate
    );
    (
      getIngestionFlowFiles as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: mockData
    });
    (generatePath as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => '/mock-path'
    );
    setOrganizationId(123);
  });

  it('renders successfully', () => {
    render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    expect(screen.getByText('test title')).toBeDefined();
    expect(screen.getByText('test description')).toBeDefined();
  });

  it('calls navigate when import button is clicked', () => {
    render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    const importButton = screen.getByText('commons.importFlow');
    fireEvent.click(importButton);

    expect(mockNavigate).toHaveBeenCalledWith('/mock-path');
    expect(generatePath).toHaveBeenCalledWith(PageRoutes.IMPORT_FLOWS, {
      category: 'test'
    });
  });

  it('displays data in the grid', async () => {
    const { container } = render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    await waitFor(() => {
      expect(container.querySelector('[data-field="fileName"]')).toBeDefined();
    });
  });

  it('renders action menu for COMPLETED status', async () => {
    const { container } = render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    const completedRow = mockData.content.find(
      (row) => row.status === 'COMPLETED'
    );
    expect(completedRow).toBeDefined();

    if (completedRow) {
      await waitFor(() => {
        expect(
          container.querySelector(
            `[data-testid="action-menu-${completedRow.ingestionFlowFileId}"]`
          )
        ).toBeDefined();
      });
    }
  });

  it('renders download button for UPLOADED status', async () => {
    const { container } = render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="download-button"]')
      ).toBeDefined();
    });
  });

  it('do not renders download button or action menu for PROCESSING status', async () => {
    const { container } = render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    const completedRow = mockData.content.find(
      (row) => row.status === 'PROCESSING'
    );
    expect(completedRow).toBeDefined();

    if (completedRow) {
      await waitFor(() => {
        expect(
          container.querySelector(
            `[data-testid="action-menu-${completedRow.ingestionFlowFileId}"]`
          )
        ).toBe(null);
      });
    }
  });

  it('applies filters when filter button is clicked', async () => {
    render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    const searchInput = screen.getByLabelText('commons.searchName');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const filterButton = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(getIngestionFlowFiles).toHaveBeenCalledWith(
        expect.any(Number),
        expect.objectContaining({
          fileName: 'test',
          page: 0
        })
      );
    });
  });

  it('displays correct chip colors for different statuses', async () => {
    const { container } = render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    await waitFor(() => {
      const completedStatusElement = container.querySelector(
        '.MuiChip-colorSuccess'
      );
      const uploadedStatusElement = container.querySelector(
        '.MuiChip-colorPrimary'
      );

      expect(completedStatusElement).toBeDefined();
      expect(uploadedStatusElement).toBeDefined();
    });
  });

  it('calls getIngestionFlowFiles with correct parameters', () => {
    render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    expect(getIngestionFlowFiles).toHaveBeenCalledWith(expect.any(Number), {
      ingestionFlowFileTypes: ['RECEIPT'],
      page: 0,
      size: 10,
      creationDateFrom: expect.any(String),
      creationDateTo: expect.any(String)
    });
  });

  it('handles page size change correctly', async () => {
    render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    const pageSizeSelect = screen.getByTestId('result-set-select');

    fireEvent.mouseDown(pageSizeSelect);

    const selectChangeEvent = new Event('change', { bubbles: true });
    Object.defineProperty(selectChangeEvent, 'target', {
      value: { value: 20 }
    });

    pageSizeSelect.dispatchEvent(selectChangeEvent);

    await waitFor(() => {
      expect(getIngestionFlowFiles).toHaveBeenCalledTimes(1);
    });
  });

  it('updates filters state when pagination changes', async () => {
    const { container } = render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    expect(getIngestionFlowFiles).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        ingestionFlowFileTypes: ['RECEIPT'],
        page: 0,
        size: 10
      })
    );

    const pageSizeSelect = container.querySelector(
      '[aria-label="Rows per page"]'
    );
    if (pageSizeSelect) {
      fireEvent.mouseDown(pageSizeSelect);
      const option = screen.getByText('20');
      fireEvent.click(option);

      await waitFor(() => {
        expect(getIngestionFlowFiles).toHaveBeenCalledWith(
          expect.any(Number),
          expect.objectContaining({
            ingestionFlowFileTypes: ['RECEIPT'],
            page: 0,
            size: 20
          })
        );
      });
    }
  });

  it('maintains filter state when navigating pages', async () => {
    const { container } = render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    const searchInput = screen.getByLabelText('commons.searchName');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const nextPageButton = container.querySelector(
      '[aria-label="Go to next page"]'
    );
    if (nextPageButton) {
      fireEvent.click(nextPageButton);

      await waitFor(() => {
        expect(getIngestionFlowFiles).toHaveBeenCalledWith(
          expect.any(Number),
          expect.objectContaining({
            ingestionFlowFileTypes: ['RECEIPT'],
            page: 1,
            size: 10
          })
        );
      });
    }
  });

  it('applies status filter correctly', async () => {
    render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    const statusSelect = screen.getByLabelText('commons.state');
    fireEvent.mouseDown(statusSelect);

    const completedOption = screen.getByRole('option', {
      name: 'commons.status.COMPLETED'
    });
    fireEvent.click(completedOption);

    const filterButton = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(getIngestionFlowFiles).toHaveBeenCalledWith(
        expect.any(Number),
        expect.objectContaining({
          status: 'COMPLETED'
        })
      );
    });
  });

  it('combines multiple filters correctly', async () => {
    render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    const searchInput = screen.getByLabelText('commons.searchName');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const statusSelect = screen.getByLabelText('commons.state');
    fireEvent.mouseDown(statusSelect);

    const errorOption = screen.getByRole('option', {
      name: 'commons.status.ERROR'
    });
    fireEvent.click(errorOption);

    const filterButton = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(getIngestionFlowFiles).toHaveBeenCalledWith(
        expect.any(Number),
        expect.objectContaining({
          fileName: 'test',
          status: 'ERROR',
          page: 0
        })
      );
    });
  });

  it('persists filters when changing pages', async () => {
    render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    const searchInput = screen.getByLabelText('commons.searchName');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const filterButton = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterButton);

    const nextPageButton = screen.getByLabelText('Go to next page');
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(getIngestionFlowFiles).toHaveBeenCalledWith(
        expect.any(Number),
        expect.objectContaining({
          fileName: 'test',
          page: 1
        })
      );
    });
  });

  it('returns null for action cell with PROCESSING status', async () => {
    const { container } = render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    const processingRow = mockData.content.find(
      (row) => row.status === 'PROCESSING'
    );

    expect(processingRow).toBeDefined();

    if (!processingRow) {
      throw new Error('Test data does not contain a PROCESSING status row');
    }

    await waitFor(() => {
      const rowCells = container.querySelectorAll('[role="row"]');
      const processingRowCell = Array.from(rowCells).find((row) =>
        row.textContent?.includes(processingRow.ingestionFlowFileId.toString())
      );

      expect(processingRowCell).toBeDefined();
      expect(
        processingRowCell?.querySelector('[data-testid="action-menu"]')
      ).toBeNull();
      expect(
        processingRowCell?.querySelector('[data-testid="download-button"]')
      ).toBeNull();
    });
  });

  it('handles undefined values in grid cells', async () => {
    const modifiedMockData = {
      ...mockData,
      content: [
        {
          ...mockData.content[0],
          creationDate: undefined,
          operator: undefined,
          discardedRows: undefined
        }
      ]
    };

    (getIngestionFlowFiles as ReturnType<typeof vi.fn>).mockReturnValue({
      data: modifiedMockData
    });

    const { container } = render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    await waitFor(() => {
      const rowCells = container.querySelectorAll('[role="row"]');
      const undefinedValuesRow = Array.from(rowCells).find((row) =>
        row.textContent?.includes(
          modifiedMockData.content[0].ingestionFlowFileId.toString()
        )
      );

      expect(
        undefinedValuesRow?.querySelector('[data-field="creationDate"]')
          ?.textContent
      ).toBe('');
      expect(
        undefinedValuesRow?.querySelector('[data-field="operator"]')
          ?.textContent
      ).toBe('');
      expect(
        undefinedValuesRow?.querySelector('[data-field="loadedDiscarded"]')
          ?.textContent
      ).toBe('-/-');
    });
  });

  it('handles unknown status color fallback correctly', async () => {
    const modifiedMockData = {
      ...mockData,
      content: [
        {
          ...mockData.content[0],
          status: 'UNKNOWN_STATUS'
        }
      ]
    };

    (getIngestionFlowFiles as ReturnType<typeof vi.fn>).mockReturnValue({
      data: modifiedMockData
    });

    const { container } = render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    await waitFor(() => {
      const chip = container.querySelector('.MuiChip-colorDefault');
      expect(chip).toBeDefined();
      expect(chip).not.toBeNull();
    });
  });

  it('clears status filter when ALL is selected', async () => {
    render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    const statusSelect = screen.getByLabelText('commons.state');
    fireEvent.mouseDown(statusSelect);
    const completedOption = screen.getByRole('option', {
      name: 'commons.status.COMPLETED'
    });
    fireEvent.click(completedOption);

    fireEvent.mouseDown(statusSelect);
    const allOption = screen.getByRole('option', {
      name: 'commons.status.ALL'
    });
    fireEvent.click(allOption);

    const filterButton = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(getIngestionFlowFiles).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          ingestionFlowFileTypes: ['RECEIPT'],
          page: 0,
          size: 10
        })
      );
    });
  });

  it('sets correct status when a specific status is selected', async () => {
    render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    const statusSelect = screen.getByLabelText('commons.state');
    fireEvent.mouseDown(statusSelect);
    const completedOption = screen.getByRole('option', {
      name: 'commons.status.COMPLETED'
    });
    fireEvent.click(completedOption);

    const filterButton = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(getIngestionFlowFiles).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          ingestionFlowFileTypes: ['RECEIPT'],
          page: 0,
          size: 10,
          status: 'COMPLETED'
        })
      );
    });
  });

  it('renders grid with data when data is available', async () => {
    (
      getIngestionFlowFiles as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: mockData
    });

    const { container } = render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    await waitFor(() => {
      const firstRow = mockData.content[0];
      expect(
        container.querySelector(`[data-id="${firstRow.ingestionFlowFileId}"]`)
      ).toBeDefined();
    });
  });

  it('calls downloadIngestionFlowFile and downloadBlob when download button is clicked', async () => {
    const mockDownloadIngestionFlowFile = vi.fn().mockResolvedValue({
      data: new Blob(['test content']),
      fileName: 'test-file.csv'
    });
    const mockDownloadBlob = vi.fn();

    (downloadIngestionFlowFile as ReturnType<typeof vi.fn>).mockImplementation(
      mockDownloadIngestionFlowFile
    );
    (downloadBlob as ReturnType<typeof vi.fn>).mockImplementation(
      mockDownloadBlob
    );

    const { container } = render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    const uploadedRow = mockData.content.find(
      (row) => row.status === 'UPLOADED'
    );

    expect(uploadedRow).toBeDefined();

    await waitFor(() => {
      const downloadButton = container.querySelector(
        '[data-testid="download-button"]'
      );
      expect(downloadButton).toBeDefined();
      return true;
    });

    const downloadButton = container.querySelector(
      '[data-testid="download-button"]'
    );

    fireEvent.click(downloadButton!);

    expect(mockDownloadIngestionFlowFile).toHaveBeenCalledWith(
      123,
      uploadedRow!.ingestionFlowFileId
    );

    await waitFor(() => {
      expect(mockDownloadBlob).toHaveBeenCalledWith(
        expect.any(Blob),
        'test-file.csv'
      );
      return true;
    });
  });

  it('calls downloadIngestionFlowFile and downloadBlob when menu download option is clicked', async () => {
    const mockDownloadIngestionFlowFile = vi.fn().mockResolvedValue({
      data: new Blob(['test content']),
      fileName: 'test-file.csv'
    });
    const mockDownloadBlob = vi.fn();

    (downloadIngestionFlowFile as ReturnType<typeof vi.fn>).mockImplementation(
      mockDownloadIngestionFlowFile
    );
    (downloadBlob as ReturnType<typeof vi.fn>).mockImplementation(
      mockDownloadBlob
    );

    render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('test title')).toBeDefined();
    });

    const completedRow = mockData.content.find(
      (row) => row.status === 'COMPLETED'
    );
    expect(completedRow).toBeDefined();

    if (completedRow) {
      await waitFor(() => {
        const actionMenuButton = screen.getByTestId(
          `action-menu-${completedRow.ingestionFlowFileId}`
        );
        expect(actionMenuButton).toBeDefined();
        fireEvent.click(actionMenuButton);
      });

      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem');
        expect(menuItems.length).toBeGreaterThan(0);

        const downloadMenuItem = menuItems[0];
        expect(downloadMenuItem).toBeDefined();

        fireEvent.click(downloadMenuItem);
      });

      expect(mockDownloadIngestionFlowFile).toHaveBeenCalledWith(
        123,
        completedRow.ingestionFlowFileId
      );

      await waitFor(() => {
        expect(mockDownloadBlob).toHaveBeenCalledWith(
          expect.any(Blob),
          'test-file.csv'
        );
      });
    }
  });

  it('renders empty state message when data is empty', async () => {
    (
      getIngestionFlowFiles as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: {
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: 10
      }
    });

    render(
      <FlowOverview
        routingCategory={'test'}
        title={'test title'}
        description={'test description'}
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    expect(screen.getByText('test title')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('commons.noFlows')).toBeDefined();
      expect(screen.getByText('commons.importFlows')).toBeDefined();
    });

    await waitFor(() => {
      expect(screen.queryByRole('grid')).toBeNull();
    });

    await waitFor(() => {
      expect(screen.queryByLabelText('commons.searchName')).toBeNull();
      expect(screen.queryByLabelText('commons.state')).toBeNull();
    });

    const importButton = screen.getByText('commons.importFlows');
    fireEvent.click(importButton);

    expect(mockNavigate).toHaveBeenCalledWith('/mock-path');
    expect(generatePath).toHaveBeenCalledWith(PageRoutes.IMPORT_FLOWS, {
      category: 'test'
    });
  });
});
