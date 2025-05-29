import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useNavigate, generatePath, useSearchParams } from 'react-router-dom';
import { downloadExportFile, getExportFiles } from '../../api/exportFiles';
import { fireEvent, render, waitFor, screen } from '../../__tests__/renderers';
import { setOrganizationId } from '../../store/OrganizationIdStore';
import { PageRoutes } from '../../App';
import ExportFlowOverview from './ExportFlowOverview';
import { ExportFileTypeEnum } from '../../../generated/apiClient';
import { downloadBlob } from '../../utils/download';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    generatePath: vi.fn(),
    useSearchParams: vi.fn()
  };
});

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

describe('ExportFlowOverview', () => {
  const mockNavigate = vi.fn();
  const mockSetSearchParams = vi.fn();

  const mockData = {
    content: [
      {
        exportFileId: 1,
        fileName: 'file_1.zip',
        creationDate: '2025-04-01T10:00:00Z',
        operator: 'Mario',
        size: 1024,
        status: 'COMPLETED'
      },
      {
        exportFileId: 2,
        fileName: 'file_2.zip',
        creationDate: '2025-04-02T10:00:00Z',
        operator: 'Luigi',
        size: 2048,
        status: 'PROCESSING'
      }
    ],
    totalPages: 1,
    totalElements: 2,
    size: 10,
    number: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useNavigate
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);

    // Mock generatePath
    (generatePath as ReturnType<typeof vi.fn>).mockImplementation(
      () => '/mock-path'
    );

    // Mock useSearchParams
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      new URLSearchParams(),
      mockSetSearchParams
    ]);

    // Mock API calls
    (getExportFiles as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isLoading: false
    });

    setOrganizationId(123);
  });

  it('renders successfully', () => {
    render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        description="Export description"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    expect(screen.getByText('Export title')).toBeDefined();
    expect(screen.getByText('Export description')).toBeDefined();
  });

  it('shows data in the grid', async () => {
    const { container } = render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    await waitFor(() => {
      expect(container.querySelector('[data-field="fileName"]')).toBeDefined();
    });
  });

  it('renders download button only for COMPLETED status', async () => {
    const { container } = render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    await waitFor(() => {
      const buttons = container.querySelectorAll(
        '[data-testid="download-button"]'
      );
      expect(buttons.length).toBe(1);
    });
  });

  it('does not show download for PROCESSING row', async () => {
    const { container } = render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    await waitFor(() => {
      const row = Array.from(container.querySelectorAll('[role="row"]')).find(
        (r) => r.textContent?.includes('file_2.zip')
      );
      expect(row?.querySelector('[data-testid="download-button"]')).toBeNull();
    });
  });

  it('calls getExportFiles with default params', () => {
    render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    expect(getExportFiles).toHaveBeenCalledWith(expect.any(Number), {
      exportFileType: ExportFileTypeEnum.PAID,
      page: 0,
      size: 10,
      creationDateFrom: expect.any(String),
      creationDateTo: expect.any(String)
    });
  });

  it('calls downloadExportFile and downloadBlob when download button is clicked', async () => {
    render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

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
    render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

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

  it('shows EmptyDataGrid when content is empty array', () => {
    (getExportFiles as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0
      },
      isLoading: false
    });

    render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    expect(screen.getByText('commons.noFlows')).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'commons.exportFlows' })
    ).toBeDefined();

    expect(screen.queryByText('commons.searchName')).toBeNull();
    expect(screen.queryByRole('grid')).toBeNull();
  });

  it('shows EmptyDataGrid when data.content is undefined', () => {
    (getExportFiles as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        content: undefined,
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0
      },
      isLoading: false
    });

    render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    expect(screen.getByText('commons.noFlows')).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'commons.exportFlows' })
    ).toBeDefined();
  });

  it('shows EmptyDataGrid when entire data object is undefined', () => {
    (getExportFiles as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false
    });

    render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    expect(screen.getByText('commons.noFlows')).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'commons.exportFlows' })
    ).toBeDefined();
  });

  it('calls navigate when EmptyDataGrid action button is clicked', () => {
    (getExportFiles as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { content: [] },
      isLoading: false
    });

    render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );
    const actionButton = screen.getByRole('button', {
      name: 'commons.exportFlows'
    });
    fireEvent.click(actionButton);

    expect(mockNavigate).toHaveBeenCalledWith('/mock-path');
    expect(generatePath).toHaveBeenCalledWith(PageRoutes.EXPORT_FLOWS, {
      category: 'test'
    });
  });

  it('shows data grid with filters when content exists', () => {
    (getExportFiles as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isLoading: false
    });

    render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    expect(screen.getByRole('grid')).toBeDefined();

    expect(screen.queryByText('commons.noFlows')).toBeNull();
  });

  it('handles null/undefined download result', async () => {
    (
      downloadExportFile as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(null);

    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    const downloadButtons = await screen.findAllByTestId('download-button');
    fireEvent.click(downloadButtons[0]);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to download file');
    });

    consoleSpy.mockRestore();
  });

  it('shows sectionTitle when provided', () => {
    render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        sectionTitle="My Section Title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    expect(screen.getByText('My Section Title')).toBeDefined();
  });

  it('does not show sectionTitle when not provided', () => {
    render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    expect(screen.queryByRole('heading', { level: 4 })).toBeNull();
  });

  it('renders date column with empty string for null date', async () => {
    const mockDataWithNullDate = {
      ...mockData,
      content: [
        {
          ...mockData.content[0],
          creationDate: null
        }
      ]
    };

    (getExportFiles as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockDataWithNullDate,
      isLoading: false
    });

    render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
    });
  });

  it('handles pagination change correctly', async () => {
    const { container } = render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    await waitFor(() => {
      const pageSizeSelect = container.querySelector(
        '[aria-label="Rows per page:"]'
      );
      expect(pageSizeSelect).toBeDefined();
    });

    const nextPageButton = container.querySelector(
      '[aria-label="Go to next page"]'
    );
    if (nextPageButton) {
      fireEvent.click(nextPageButton);
    }
  });

  it('handles button click in TitleComponent action', () => {
    render(
      <ExportFlowOverview
        routingCategory="test"
        title="Export title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    const titleButton = screen.getByRole('button', {
      name: 'exportFlow.buttonReservationExport'
    });

    fireEvent.click(titleButton);

    expect(mockNavigate).toHaveBeenCalledWith('/mock-path');
    expect(generatePath).toHaveBeenCalledWith(PageRoutes.EXPORT_FLOWS, {
      category: 'test'
    });
  });
});
