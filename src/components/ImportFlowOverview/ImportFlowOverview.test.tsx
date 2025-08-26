import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { fireEvent, render, waitFor, screen } from '../../__tests__/renderers';
import { useNavigate, generatePath, useSearchParams } from 'react-router';
import {
  getIngestionFlowFiles,
  getIngestionFlowFile,
  getIngestionFlowFileError
} from '../../api/ingestionFlowFiles';
import { setOrganizationId } from '../../store/OrganizationIdStore';
import { PageRoutes } from '../../routes';
import FlowOverview from './ImportFlowOverview';
import { IngestionFlowFileTypeEnum } from '../../../generated/apiClient';

// Mock React Router hooks and utils
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(),
    generatePath: vi.fn(),
    useSearchParams: vi.fn()
  };
});

// Mock ingestion API and constants
vi.mock('../../api/ingestionFlowFiles', () => ({
  getIngestionFlowFiles: vi.fn().mockReturnValue({ data: { content: [] } }),
  getIngestionFlowFileError: vi.fn(),
  getIngestionFlowFile: vi.fn(),
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
  }
}));

// Mock download utility
vi.mock('../../utils/download', () => ({
  downloadBlob: vi.fn()
}));

// Mock useSearch hook with proper data and mutateAsync
const mockMutateAsync = vi.fn();
const mockApplyFilters = vi.fn();

vi.mock('../../hooks/useSearch', () => ({
  useSearch: vi.fn(() => ({
    query: {
      data: {
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
            ingestionFlowFileId: 70,
            fileName: '2024-03-19UNCRITMM-1iv6iotaa3td4.zip',
            creationDate: '2025-02-07T17:19:22.508481',
            operator: 'demo demo',
            discardedRows: 0,
            status: 'COMPLETED'
          }
        ],
        size: 20,
        totalElements: 3,
        totalPages: 1,
        number: 0
      },
      isPending: false,
      isLoading: false,
      error: null,
      isError: false,
      mutateAsync: mockMutateAsync
    },
    applyFilters: mockApplyFilters
  }))
}));

// Mock mutations for downloading files with mutateAsync
const mockDownloadMutateAsync = vi.fn();

const getIngestionFlowFileMock = {
  mutateAsync: mockDownloadMutateAsync.mockResolvedValue({
    data: new Blob(['file content']),
    fileName: 'test-file.csv'
  })
};

const getIngestionFlowFileErrorMock = {
  mutateAsync: mockDownloadMutateAsync.mockResolvedValue({
    data: new Blob(['error file content']),
    fileName: 'error-file.csv'
  })
};

(getIngestionFlowFile as Mock).mockImplementation(
  () => getIngestionFlowFileMock
);
(getIngestionFlowFileError as Mock).mockImplementation(
  () => getIngestionFlowFileErrorMock
);

describe('ImportFlowOverview Component', () => {
  const mockNavigate = vi.fn();
  const mockSetSearchParams = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useNavigate as Mock).mockReturnValue(mockNavigate);

    (generatePath as Mock).mockImplementation(() => '/mock-path');

    (useSearchParams as Mock).mockReturnValue([
      new URLSearchParams(),
      mockSetSearchParams
    ]);

    (getIngestionFlowFiles as Mock).mockReturnValue({
      data: {
        content: [],
        size: 10,
        totalElements: 0,
        totalPages: 0,
        number: 0
      }
    });

    setOrganizationId(123);
  });

  it('renders component with provided props', () => {
    render(
      <FlowOverview
        routingCategory="test-category"
        title="Test Title"
        description="Test Description"
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    expect(screen.getByText('Test Title')).toBeDefined();
    expect(screen.getByText('Test Description')).toBeDefined();
  });

  it('navigates on import flow button click', () => {
    render(
      <FlowOverview
        routingCategory="test-category"
        title="Test Title"
        description="Test Description"
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    const importButton = screen.getByText('commons.importFlow');
    fireEvent.click(importButton);

    expect(mockNavigate).toHaveBeenCalledWith('/mock-path');
    expect(generatePath).toHaveBeenCalledWith(PageRoutes.IMPORT_FLOWS, {
      category: 'test-category'
    });
  });

  it('calls applyFilters when filter button clicked', async () => {
    render(
      <FlowOverview
        routingCategory="test-category"
        title="Test Title"
        description="Test Description"
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    const searchInput = screen.getByLabelText('commons.searchName');
    fireEvent.change(searchInput, { target: { value: 'test filename' } });

    const filterButton = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(mockApplyFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: 'test filename'
        })
      );
    });
  });

  it('renders download button for UPLOADED status and fires download', async () => {
    const { container } = render(
      <FlowOverview
        routingCategory="test-category"
        title="Test Title"
        description="Test Description"
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    expect(
      container.querySelector('[data-testid="download-button"]')
    ).toBeDefined();
  });

  it('renders action menu for COMPLETED status and triggers download from menu', async () => {
    const { container } = render(
      <FlowOverview
        routingCategory="test-category"
        title="Test Title"
        description="Test Description"
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    await waitFor(() => {
      expect(
        container.querySelector(`[data-testid="action-menu-70"]`)
      ).toBeDefined();
    });
  });

  it('displays empty data grid when no contents and triggers import action correctly', async () => {
    (getIngestionFlowFiles as Mock).mockReturnValueOnce({
      data: {
        content: [],
        size: 10,
        totalElements: 0,
        totalPages: 0,
        number: 0
      }
    });

    render(
      <FlowOverview
        routingCategory="test-category"
        title="Test Title"
        description="Test Description"
        ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('commons.noFlows')).toBeDefined();
      expect(screen.getByText('commons.importFlows')).toBeDefined();
    });

    fireEvent.click(screen.getByText('commons.importFlows'));

    expect(mockNavigate).toHaveBeenCalledWith('/mock-path');
    expect(generatePath).toHaveBeenCalledWith(PageRoutes.IMPORT_FLOWS, {
      category: 'test-category'
    });
  });
});
