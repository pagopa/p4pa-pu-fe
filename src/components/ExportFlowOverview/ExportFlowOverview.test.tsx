import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../__tests__/renderers';
import ExportFlowOverview from './ExportFlowOverview';
import { useNavigate, generatePath } from 'react-router';
import { downloadBlob } from '../../utils/download';
import { setOrganizationId } from '../../store/OrganizationIdStore';
import { PageRoutes } from '../../routes';
import { ExportFileTypeEnum } from '../../../generated/apiClient';

// Mock react-router hooks
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  generatePath: vi.fn()
}));

// Mock API and utils
const mutateAsyncMock = vi.fn().mockResolvedValue({
  data: new Blob(['test data']),
  fileName: 'file_1.zip'
});
const mockApplyFilters = vi.fn();

vi.mock('../../hooks/useSearch', () => ({
  useSearch: vi.fn(() => ({
    query: {
      data: {
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
      },
      isLoading: false,
      isError: false,
      error: null,
      mutateAsync: mutateAsyncMock
    },
    applyFilters: mockApplyFilters
  }))
}));

vi.mock('../../api/exportFiles', () => ({
  getExportFiles: vi.fn(),
  getExportFile: vi.fn(() => ({ mutateAsync: mutateAsyncMock }))
}));

vi.mock('../../utils/download', () => ({
  downloadBlob: vi.fn()
}));

describe('ExportFlowOverview component logic', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);
    (generatePath as unknown as Mock).mockReturnValue('/mock-path');
    setOrganizationId(123);
  });

  it('renders title and description', () => {
    render(
      <ExportFlowOverview
        routingCategory="category1"
        title="Export Title"
        description="Description text"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    expect(screen.getByText('Export Title')).toBeInTheDocument();
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('renders rows with download button only for COMPLETED status', async () => {
    render(
      <ExportFlowOverview
        routingCategory="category1"
        title="Export Title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    await waitFor(() => {
      // One download button for row with status 'COMPLETED'
      const buttons = screen.getAllByTestId('download-button');
      expect(buttons.length).toBe(1);

      // Check processing row has no download button
      const processingRow = screen
        .getAllByRole('row')
        .find((row) => row.textContent?.includes('file_2.zip'));
      expect(
        processingRow?.querySelector('[data-testid="download-button"]')
      ).toBeNull();
    });
  });

  it('clicking download button calls mutateAsync and downloadBlob', async () => {
    render(
      <ExportFlowOverview
        routingCategory="category1"
        title="Export Title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    const downloadButton = await screen.findByTestId('download-button');
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(1);
      expect(downloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'file_1.zip');
    });
  });

  it('calls applyFilters when filter button is clicked', async () => {
    render(
      <ExportFlowOverview
        routingCategory="category1"
        title="Export Title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    const input = screen.getByLabelText('commons.searchName');
    fireEvent.change(input, { target: { value: 'filter-test' } });

    const filterBtn = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterBtn);

    await waitFor(() => {
      expect(mockApplyFilters).toHaveBeenCalledWith(
        expect.objectContaining({ fileName: 'filter-test' })
      );
    });
  });

  it('fires navigation when reservation export button clicked', () => {
    render(
      <ExportFlowOverview
        routingCategory="category1"
        title="Export Title"
        exportFileTypes={ExportFileTypeEnum.PAID}
      />
    );

    const button = screen.getByRole('button', {
      name: 'exportFlow.buttonReservationExport'
    });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/mock-path');
    expect(generatePath).toHaveBeenCalledWith(PageRoutes.EXPORT_FLOWS, {
      category: 'category1'
    });
  });
});
