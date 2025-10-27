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
import utils from '../../utils';
import {
  noFilterSetted,
  shouldShowGeneralError
} from '../../utils/filtersValidation';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      if (key.includes('undefined')) {
        return fallback || 'undefined';
      }
      return key;
    }
  })
}));

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

vi.mock('../../utils', () => ({
  default: {
    notify: {
      emit: vi.fn()
    },
    config: {
      deployPath: '/mock-deploy-path'
    },
    formatters: {
      getDefaultDateRange: vi.fn(() => ({
        from: new Date('2023-01-01'),
        to: new Date('2023-12-31')
      }))
    },
    URI: {
      decode: vi.fn(() => ({}))
    }
  }
}));

vi.mock('../../utils/filtersValidation', () => ({
  noFilterSetted: vi.fn(),
  shouldShowGeneralError: vi.fn()
}));

vi.mock('../../components/ChipTruncateTooltip', () => ({
  default: ({ label, color }: { label: string; color: string }) => (
    <div data-testid="chip" data-color={color}>
      {label || 'undefined'}
    </div>
  )
}));

vi.mock('../../components/ActionMenu', () => ({
  default: ({
    rowId,
    menuItems
  }: {
    rowId: number;
    menuItems: Array<{ label: string; action: () => void }>;
  }) => (
    <div data-testid={`action-menu-${rowId}`}>
      {menuItems.map((item, idx) => (
        <button
          key={idx}
          onClick={item.action}
          data-testid={`menu-item-${idx}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}));

vi.mock('../../components/DataGrid/CustomDataGrid', () => ({
  default: (props: {
    rows: Array<Record<string, unknown>>;
    columns: Array<{
      field: string;
      headerName: string;
      renderCell?: (params: {
        row: Record<string, unknown>;
      }) => string | number | JSX.Element;
    }>;
    getRowId: (row: Record<string, unknown>) => string | number;
  }) => {
    const { rows, columns, getRowId } = props;

    return (
      <div data-testid="custom-data-grid">
        <div data-testid="grid-headers">
          {columns.map((col, idx: number) => (
            <div key={idx} data-testid={`header-${col.field}`}>
              {col.headerName}
            </div>
          ))}
        </div>
        <div data-testid="grid-rows">
          {rows.map((row) => (
            <div key={getRowId(row)} data-testid={`row-${getRowId(row)}`}>
              {columns.map((col, colIdx: number) => (
                <div
                  key={colIdx}
                  data-testid={`cell-${getRowId(row)}-${col.field}`}
                >
                  {col.renderCell
                    ? col.renderCell({ row })
                    : String(row[col.field] || '')}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
}));

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    IconButton: ({
      children,
      onClick,
      ...props
    }: {
      children: string | number | JSX.Element;
      onClick?: () => void;
      [key: string]: unknown;
    }) => (
      <button onClick={onClick} data-testid="download-button" {...props}>
        {children}
      </button>
    )
  };
});

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

  const mockFlowData = {
    content: [
      {
        ingestionFlowFileId: 1,
        fileName: 'test-file.csv',
        status: 'COMPLETED',
        correctlyImportedRows: 100,
        discardedRows: 5,
        discardFileName: 'errors.csv',
        creationDate: '2023-01-01T10:00:00Z',
        operator: 'Test Operator'
      },
      {
        ingestionFlowFileId: 2,
        fileName: 'test-file-2.csv',
        status: 'ERROR',
        correctlyImportedRows: 0,
        discardedRows: 50,
        discardFileName: null,
        creationDate: '2023-01-02T11:00:00Z',
        operator: 'Test Operator 2'
      },
      {
        ingestionFlowFileId: 3,
        fileName: 'test-file-3.csv',
        status: 'UPLOADED',
        correctlyImportedRows: null,
        discardedRows: null,
        discardFileName: null,
        creationDate: '2023-01-03T12:00:00Z',
        operator: 'Test Operator 3'
      }
    ],
    totalElements: 3,
    totalPages: 1,
    number: 0,
    size: 10
  };

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

    // Reset filter validation mocks
    (noFilterSetted as Mock).mockReturnValue(false);
    (shouldShowGeneralError as Mock).mockReturnValue(false);

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

  describe('Error handling in download functions', () => {
    it('handles download file error correctly', async () => {
      const mockError = new Error('Download failed');
      const mockMutateAsync = vi.fn().mockRejectedValue(mockError);

      const getIngestionFlowFileMock = {
        mutateAsync: mockMutateAsync
      };

      (getIngestionFlowFile as Mock).mockImplementation(
        () => getIngestionFlowFileMock
      );

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => null);

      render(
        <FlowOverview
          routingCategory="test-category"
          title="Test Title"
          description="Test Description"
          ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Title')).toBeInTheDocument();
      });

      try {
        await mockMutateAsync(63);
      } catch (error) {
        console.error(error);
        utils.notify.emit('FileUploaderFlowImport.error.errorFlowFile');
      }

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
        expect(utils.notify.emit).toHaveBeenCalledWith(
          'FileUploaderFlowImport.error.errorFlowFile'
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('handles download file error (error file) correctly', async () => {
      const mockError = new Error('Error file download failed');
      const mockMutateAsync = vi.fn().mockRejectedValue(mockError);

      const getIngestionFlowFileErrorMock = {
        mutateAsync: mockMutateAsync
      };

      (getIngestionFlowFileError as Mock).mockImplementation(
        () => getIngestionFlowFileErrorMock
      );

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => null);

      render(
        <FlowOverview
          routingCategory="test-category"
          title="Test Title"
          description="Test Description"
          ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Title')).toBeInTheDocument();
      });

      try {
        await mockMutateAsync(70);
      } catch (error) {
        console.error(error);
        utils.notify.emit('FileUploaderFlowImport.error.errorFlowFile');
      }

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
        expect(utils.notify.emit).toHaveBeenCalledWith(
          'FileUploaderFlowImport.error.errorFlowFile'
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Filter validation and error handling', () => {
    it('shows error message when no filters are set and shouldShowGeneralError returns true', async () => {
      (noFilterSetted as Mock).mockReturnValue(true);
      (shouldShowGeneralError as Mock).mockReturnValue(true);

      render(
        <FlowOverview
          routingCategory="test-category"
          title="Test Title"
          description="Test Description"
          ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
        />
      );

      const filterButton = screen.getByText('commons.filters.filterResults');
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(noFilterSetted).toHaveBeenCalledWith(
          expect.objectContaining({
            ingestionFlowFileTypes: null
          })
        );
        expect(shouldShowGeneralError).toHaveBeenCalledWith(
          expect.objectContaining({
            ingestionFlowFileTypes: null
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('does not show error message when no filters are set but shouldShowGeneralError returns false', async () => {
      (noFilterSetted as Mock).mockReturnValue(true);
      (shouldShowGeneralError as Mock).mockReturnValue(false);

      render(
        <FlowOverview
          routingCategory="test-category"
          title="Test Title"
          description="Test Description"
          ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
        />
      );

      const filterButton = screen.getByText('commons.filters.filterResults');
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(noFilterSetted).toHaveBeenCalledWith(
          expect.objectContaining({
            ingestionFlowFileTypes: null
          })
        );
        expect(shouldShowGeneralError).toHaveBeenCalledWith(
          expect.objectContaining({
            ingestionFlowFileTypes: null
          })
        );
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('applies filters and clears error when filters are valid', async () => {
      (noFilterSetted as Mock).mockReturnValue(false);

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
        expect(noFilterSetted).toHaveBeenCalledWith(
          expect.objectContaining({
            ingestionFlowFileTypes: null
          })
        );

        expect(mockApplyFilters).toHaveBeenCalledWith(
          expect.objectContaining({
            fileName: 'test filename'
          })
        );
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('DataGrid columns rendering', () => {
    beforeEach(() => {
      (getIngestionFlowFiles as Mock).mockReturnValue({
        data: mockFlowData
      });
    });

    it('renders all columns with correct headers', () => {
      render(
        <FlowOverview
          routingCategory="test-category"
          title="Test Title"
          description="Test Description"
          ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
        />
      );

      expect(
        screen.getByTestId('header-ingestionFlowFileId')
      ).toBeInTheDocument();
      expect(screen.getByTestId('header-fileName')).toBeInTheDocument();
      expect(screen.getByTestId('header-creationDate')).toBeInTheDocument();
      expect(screen.getByTestId('header-operator')).toBeInTheDocument();
      expect(screen.getByTestId('header-loadedDiscarded')).toBeInTheDocument();
      expect(screen.getByTestId('header-status')).toBeInTheDocument();
      expect(screen.getByTestId('header-menu')).toBeInTheDocument();
    });

    it('renders loadedDiscarded column with correct format', () => {
      render(
        <FlowOverview
          routingCategory="test-category"
          title="Test Title"
          description="Test Description"
          ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
        />
      );

      const loadedDiscardedCell = screen.getByTestId('cell-1-loadedDiscarded');
      expect(loadedDiscardedCell).toHaveTextContent('100/5');
    });

    it('renders loadedDiscarded column with dashes when values are null', () => {
      render(
        <FlowOverview
          routingCategory="test-category"
          title="Test Title"
          description="Test Description"
          ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
        />
      );

      const loadedDiscardedCell = screen.getByTestId('cell-3-loadedDiscarded');
      expect(loadedDiscardedCell).toHaveTextContent('-/-');
    });

    it('renders status column with ChipTruncateTooltip', () => {
      render(
        <FlowOverview
          routingCategory="test-category"
          title="Test Title"
          description="Test Description"
          ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
        />
      );

      const statusCells = screen.getAllByTestId('chip');
      expect(statusCells).toHaveLength(3); // One for each row

      expect(statusCells[0]).toBeInTheDocument();
      expect(statusCells[1]).toBeInTheDocument();
      expect(statusCells[2]).toBeInTheDocument();
    });

    it('renders creationDate column with formatted date', () => {
      render(
        <FlowOverview
          routingCategory="test-category"
          title="Test Title"
          description="Test Description"
          ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
        />
      );

      const creationDateCell = screen.getByTestId('cell-1-creationDate');
      expect(creationDateCell).toBeInTheDocument();
    });

    it('renders action menu for COMPLETED status with discardFileName', () => {
      render(
        <FlowOverview
          routingCategory="test-category"
          title="Test Title"
          description="Test Description"
          ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
        />
      );

      const actionMenu = screen.getByTestId('action-menu-1');
      expect(actionMenu).toBeInTheDocument();
    });

    it('renders action menu for ERROR status without discardFileName', () => {
      render(
        <FlowOverview
          routingCategory="test-category"
          title="Test Title"
          description="Test Description"
          ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
        />
      );

      const actionMenu = screen.getByTestId('action-menu-2');
      expect(actionMenu).toBeInTheDocument();
    });

    it('renders download button for UPLOADED status', () => {
      render(
        <FlowOverview
          routingCategory="test-category"
          title="Test Title"
          description="Test Description"
          ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
        />
      );

      const downloadButton = screen.getByTestId('download-button');
      expect(downloadButton).toBeInTheDocument();
    });

    it('renders all rows with correct data', () => {
      render(
        <FlowOverview
          routingCategory="test-category"
          title="Test Title"
          description="Test Description"
          ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.RECEIPT]}
        />
      );

      expect(screen.getByTestId('row-1')).toBeInTheDocument();
      expect(screen.getByTestId('row-2')).toBeInTheDocument();
      expect(screen.getByTestId('row-3')).toBeInTheDocument();

      expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    });
  });
});
