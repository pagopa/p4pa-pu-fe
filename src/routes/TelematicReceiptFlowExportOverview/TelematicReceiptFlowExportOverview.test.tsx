import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useNavigate, generatePath } from 'react-router-dom';
import { downloadExportFile, getExportFiles } from '../../api/exportFiles';
import { fireEvent, render, waitFor, screen } from '../../__tests__/renderers';
import { setOrganizationId } from '../../store/OrganizationIdStore';
import { PageRoutes } from '../../App';
import TelematicReceiptFlowExportOverview from './TelematicReceiptFlowExportOverview';
import { ExportFileTypeEnum } from '../../../generated/apiClient';
import { downloadBlob } from '../../utils/download';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  generatePath: vi.fn()
}));

vi.mock('../../api/exportFiles', () => ({
  getExportFiles: vi
    .fn()
    .mockReturnValue({ data: { content: [] }, isLoading: false })
}));

vi.mock('../../api/exportFiles', () => ({
  getExportFiles: vi
    .fn()
    .mockReturnValue({ data: { content: [] }, isLoading: false }),
  downloadExportFile: vi.fn().mockResolvedValue({
    data: new Blob(['test data']),
    fileName: 'test_file.zip'
  })
}));

vi.mock('../../utils/download', () => ({
  downloadBlob: vi.fn()
}));

describe('TelematicReceiptFlowExportOverview', () => {
  const mockNavigate = vi.fn();

  const mockData = {
    content: [
      {
        exportFileId: 1,
        fileName: 'export_file_1.zip',
        creationDate: '2025-02-05T16:24:49.148144',
        operator: 'John Doe',
        size: 1024,
        status: 'COMPLETED'
      },
      {
        exportFileId: 2,
        fileName: 'export_file_2.zip',
        creationDate: '2025-02-07T17:08:30.673315',
        operator: 'Jane Smith',
        size: 2048,
        status: 'PROCESSING'
      },
      {
        exportFileId: 3,
        fileName: 'export_file_3.zip',
        creationDate: '2025-02-09T19:30:50.765795',
        operator: 'Bob Johnson',
        size: 3072,
        status: 'READY_FOR_DOWNLOAD'
      },
      {
        exportFileId: 4,
        fileName: 'export_file_4.zip',
        creationDate: '2025-02-07T17:19:22.508481',
        operator: 'Alice Brown',
        size: 4096,
        status: 'READY_FOR_DOWNLOAD'
      }
    ],
    size: 10,
    totalElements: 4,
    totalPages: 1,
    number: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockNavigate
    );
    (getExportFiles as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isLoading: false
    });
    (generatePath as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => '/mock-path'
    );
    setOrganizationId(123);
  });

  it('renders successfully', () => {
    render(<TelematicReceiptFlowExportOverview />);

    expect(
      screen.getByText('commons.routes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW')
    ).toBeDefined();
    expect(
      screen.getByText('telematicReceiptFlowExportOverview.description')
    ).toBeDefined();
  });

  it('calls navigate when export button is clicked', () => {
    render(<TelematicReceiptFlowExportOverview />);

    const exportButton = screen.getByText(
      'telematicReceiptFlowExportOverview.buttonReservationExport'
    );
    fireEvent.click(exportButton);

    expect(mockNavigate).toHaveBeenCalledWith('/mock-path');
    expect(generatePath).toHaveBeenCalledWith(PageRoutes.EXPORT_FLOWS, {
      category: 'receipt'
    });
  });

  it('displays data in the grid', async () => {
    const { container } = render(<TelematicReceiptFlowExportOverview />);

    await waitFor(() => {
      expect(container.querySelector('[data-field="fileName"]')).toBeDefined();
    });
  });

  it('renders download button for READY_FOR_DOWNLOAD status', async () => {
    const { container } = render(<TelematicReceiptFlowExportOverview />);

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="download-button"]')
      ).toBeDefined();
    });
  });

  it('does not render download button for PROCESSING status', async () => {
    const processingRow = mockData.content.find(
      (row) => row.status === 'PROCESSING'
    );
    expect(processingRow).toBeDefined();

    const { container } = render(<TelematicReceiptFlowExportOverview />);

    await waitFor(() => {
      const rows = container.querySelectorAll('[role="row"]');
      const processingRowElement = Array.from(rows).find((row) =>
        row.textContent?.includes(processingRow!.fileName)
      );

      expect(
        processingRowElement?.querySelector('[data-testid="download-button"]')
      ).toBeNull();
    });
  });

  it('applies filters when filter button is clicked', async () => {
    render(<TelematicReceiptFlowExportOverview />);

    const searchInput = screen.getByLabelText('commons.searchName');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const filterButton = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(getExportFiles).toHaveBeenCalledWith(
        expect.any(Number),
        expect.objectContaining({
          fileName: 'test',
          page: 0
        })
      );
    });
  });

  it('calls getExportFiles with correct parameters', () => {
    render(<TelematicReceiptFlowExportOverview />);

    expect(getExportFiles).toHaveBeenCalledWith(expect.any(Number), {
      exportFileType: ExportFileTypeEnum.PAID,
      page: 0,
      size: 10
    });
  });

  it('handles page size change correctly', async () => {
    render(<TelematicReceiptFlowExportOverview />);

    const pageSizeSelect = screen.getByTestId('result-set-select');

    fireEvent.mouseDown(pageSizeSelect);

    const selectChangeEvent = new Event('change', { bubbles: true });
    Object.defineProperty(selectChangeEvent, 'target', {
      value: { value: 20 }
    });

    pageSizeSelect.dispatchEvent(selectChangeEvent);

    await waitFor(() => {
      expect(getExportFiles).toHaveBeenCalledTimes(1);
    });
  });

  it('updates filters state when pagination changes', async () => {
    const multiPageMockData = {
      ...mockData,
      totalPages: 2
    };

    (getExportFiles as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: multiPageMockData,
      isLoading: false
    });

    const { container } = render(<TelematicReceiptFlowExportOverview />);

    expect(getExportFiles).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        exportFileType: ExportFileTypeEnum.PAID,
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
        expect(getExportFiles).toHaveBeenCalledWith(
          expect.any(Number),
          expect.objectContaining({
            exportFileType: ExportFileTypeEnum.PAID,
            page: 0,
            size: 20
          })
        );
      });
    }
  });

  it('maintains filter state when navigating pages', async () => {
    const multiPageMockData = {
      ...mockData,
      totalPages: 2
    };

    (getExportFiles as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: multiPageMockData,
      isLoading: false
    });

    const { container } = render(<TelematicReceiptFlowExportOverview />);

    const searchInput = screen.getByLabelText('commons.searchName');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const filterButton = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterButton);

    const nextPageButton = container.querySelector(
      '[aria-label="Go to next page"]'
    );
    if (nextPageButton) {
      fireEvent.click(nextPageButton);

      await waitFor(() => {
        expect(getExportFiles).toHaveBeenCalledWith(
          expect.any(Number),
          expect.objectContaining({
            fileName: 'test',
            page: 1,
            size: 10
          })
        );
      });
    }
  });

  it('handles date filter changes correctly', async () => {
    const mockedGetExportFiles = vi.fn().mockReturnValue({
      data: mockData,
      isLoading: false
    });
    (getExportFiles as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      mockedGetExportFiles
    );

    render(<TelematicReceiptFlowExportOverview />);

    mockedGetExportFiles.mockClear();

    const fromDate = new Date('2025-01-01');
    const toDate = new Date('2025-01-31');

    const filterElements = screen.getAllByTestId('filter-container');
    expect(filterElements.length).toBeGreaterThan(0);

    mockedGetExportFiles(123, {
      exportFileType: ExportFileTypeEnum.PAID,
      page: 0,
      size: 10,
      creationDateFrom: fromDate.toISOString(),
      creationDateTo: toDate.toISOString()
    });

    expect(mockedGetExportFiles).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        creationDateFrom: expect.any(String),
        creationDateTo: expect.any(String)
      })
    );
  });

  it('handles sort model changes correctly', async () => {
    const mockedGetExportFiles = vi.fn().mockReturnValue({
      data: mockData,
      isLoading: false
    });
    (getExportFiles as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      mockedGetExportFiles
    );

    render(<TelematicReceiptFlowExportOverview />);

    mockedGetExportFiles.mockClear();

    mockedGetExportFiles(123, {
      exportFileType: ExportFileTypeEnum.PAID,
      page: 0,
      size: 10,
      sort: ['fileName,asc']
    });

    expect(mockedGetExportFiles).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        sort: ['fileName,asc']
      })
    );
  });

  it('displays loading state correctly', async () => {
    (getExportFiles as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isLoading: true
    });

    const { container } = render(<TelematicReceiptFlowExportOverview />);

    await waitFor(() => {
      expect(
        container.querySelector('.MuiCircularProgress-root')
      ).toBeDefined();
    });
  });

  it('handles empty data correctly', async () => {
    (getExportFiles as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { content: [], totalPages: 0 },
      isLoading: false
    });

    const { container } = render(<TelematicReceiptFlowExportOverview />);

    await waitFor(() => {
      expect(container.querySelector('.MuiDataGrid-overlay')).toHaveTextContent(
        'No rows'
      );
    });
  });

  it('calls downloadExportFile and downloadBlob when download button is clicked', async () => {
    render(<TelematicReceiptFlowExportOverview />);

    const downloadButtons = await screen.findAllByTestId('download-button');
    expect(downloadButtons.length).toBeGreaterThan(0);

    fireEvent.click(downloadButtons[0]);

    await waitFor(() => {
      expect(downloadExportFile).toHaveBeenCalledWith(123, expect.any(Number));
    });

    await waitFor(() => {
      expect(downloadBlob).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.any(String)
      );
    });
  });

  it('only shows download button for COMPLETED status', async () => {
    render(<TelematicReceiptFlowExportOverview />);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');

      const completedRow = mockData.content.find(
        (row) => row.status === 'COMPLETED'
      );
      expect(completedRow).toBeDefined();

      const completedRowElement = Array.from(rows).find((row) =>
        row.textContent?.includes(completedRow!.fileName)
      );

      expect(
        completedRowElement?.querySelector('[data-testid="download-button"]')
      ).toBeDefined();

      const nonCompletedRow = mockData.content.find(
        (row) => row.status !== 'COMPLETED'
      );
      expect(nonCompletedRow).toBeDefined();

      const nonCompletedRowElement = Array.from(rows).find((row) =>
        row.textContent?.includes(nonCompletedRow!.fileName)
      );

      expect(
        nonCompletedRowElement?.querySelector('[data-testid="download-button"]')
      ).toBeNull();
    });
  });
});
