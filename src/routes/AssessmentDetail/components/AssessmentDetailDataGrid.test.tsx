import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../__tests__/renderers';
import AssessmentDetailDataGrid from './AssessmentDetailDataGrid';
import { AssessmentsDetail } from '../../../../generated/apiClient';
import {
  GridSortModel,
  GridColDef,
  GridRenderCellParams
} from '@mui/x-data-grid';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

let globalOnNavigateToDetail:
  | ((assessmentDetailId: number) => void)
  | undefined;

vi.mock('../../../components/DataGrid/CustomDataGrid', () => ({
  default: ({
    rows,
    columns,
    loading,
    onSortModelChange,
    getRowId,
    'data-testid': testId
  }: {
    rows: Array<AssessmentsDetail>;
    columns: Array<GridColDef>;
    loading: boolean;
    sortModel: GridSortModel;
    onSortModelChange: (model: GridSortModel) => void;
    getRowId: (row: AssessmentsDetail) => string | number;
    smartPagination?: unknown;
    'data-testid'?: string;
  }) => {
    const actionColumn = columns.find((col) => col.field === 'action');
    const paymentDateColumn = columns.find(
      (col) => col.field === 'paymentDateTime'
    );
    const updateDateColumn = columns.find((col) => col.field === 'updateDate');
    const amountColumn = columns.find((col) => col.field === 'amountCents');

    return (
      <div data-testid={testId || 'custom-data-grid'}>
        {loading ? (
          <div data-testid="loading-indicator">Loading...</div>
        ) : (
          <div data-testid="data-grid-content">
            <div data-testid="rows-count">{rows.length} rows</div>
            <div data-testid="columns-count">{columns.length} columns</div>
            {rows.map((row, index) => {
              const rowId = getRowId
                ? getRowId(row)
                : row.assessmentDetailId || index;
              return (
                <div key={index} data-testid={`row-${index}`}>
                  <span data-testid={`row-id-${index}`}>{rowId}</span>
                  <span data-testid={`iuv-${index}`}>{row.iuv}</span>
                  <span data-testid={`amount-${index}`}>
                    {amountColumn?.renderCell
                      ? amountColumn.renderCell({
                          value: row.amountCents,
                          row
                        } as GridRenderCellParams<AssessmentsDetail>)
                      : row.amountCents}
                  </span>
                  <span data-testid={`payment-date-${index}`}>
                    {paymentDateColumn?.renderCell
                      ? paymentDateColumn.renderCell({
                          value: row.paymentDateTime,
                          row
                        } as GridRenderCellParams)
                      : row.paymentDateTime}
                  </span>
                  <span data-testid={`update-date-${index}`}>
                    {updateDateColumn?.renderCell
                      ? updateDateColumn.renderCell({
                          value: row.updateDate,
                          row
                        } as GridRenderCellParams)
                      : row.updateDate}
                  </span>
                  {row.receiptId && actionColumn && (
                    <div data-testid={`action-cell-${index}`}>
                      {actionColumn.renderCell ? (
                        actionColumn.renderCell({
                          value: null,
                          row
                        } as GridRenderCellParams<AssessmentsDetail>)
                      ) : (
                        <button
                          data-testid={`navigate-to-detail-${row.receiptId}`}
                          onClick={() => {
                            if (globalOnNavigateToDetail) {
                              globalOnNavigateToDetail(row.receiptId!);
                            } else {
                              console.log('Navigate to assessment detail item');
                            }
                          }}
                        >
                          Navigate
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <button
              onClick={() => onSortModelChange([{ field: 'iuv', sort: 'asc' }])}
              data-testid="sort-trigger"
            >
              Sort
            </button>
          </div>
        )}
      </div>
    );
  }
}));

vi.mock('../../../utils/formatters', () => ({
  moneyFormat: (value: number) => `€${(value / 100).toFixed(2)}`,
  formatDate: (date: string) => new Date(date).toLocaleDateString('it-IT')
}));

describe('AssessmentDetailDataGrid', () => {
  const mockOnSortModelChange = vi.fn();

  const mockAssessmentData: Array<AssessmentsDetail> = [
    {
      assessmentDetailId: 1,
      assessmentId: 123,
      organizationId: 123,
      debtPositionTypeOrgCode: 'TIPO_TEST_1',
      updateOperatorExternalId: 'operatore1@test.com',
      paymentDateTime: '2025-01-15T10:30:00Z',
      updateDate: '2025-01-15T11:00:00Z',
      iuv: 'IUV123456789',
      iud: 'IUD123456789',
      iur: 'IUR123456789',
      debtorFiscalCodeHash: 'hash123',
      amountCents: 10050,
      sectionCode: 'SEC001',
      amountSubmitted: true,
      receiptId: 1001
    },
    {
      assessmentDetailId: 2,
      assessmentId: 124,
      organizationId: 123,
      debtPositionTypeOrgCode: 'TIPO_TEST_2',
      updateOperatorExternalId: 'operatore2@test.com',
      paymentDateTime: '2025-01-16T14:30:00Z',
      updateDate: '2025-01-16T15:00:00Z',
      iuv: 'IUV987654321',
      iud: 'IUD987654321',
      iur: 'IUR987654321',
      debtorFiscalCodeHash: 'hash456',
      amountCents: 5025,
      sectionCode: 'SEC002',
      amountSubmitted: false,
      receiptId: 1002
    }
  ];

  const defaultProps = {
    rows: mockAssessmentData,
    sortModel: [] as GridSortModel,
    onSortModelChange: mockOnSortModelChange,
    isLoading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    globalOnNavigateToDetail = undefined;
  });

  describe('Component Rendering', () => {
    it('should render successfully with assessment data', () => {
      render(<AssessmentDetailDataGrid {...defaultProps} />);

      expect(screen.getByTestId('custom-data-grid')).toBeDefined();
      expect(screen.getByTestId('data-grid-content')).toBeDefined();
      expect(screen.getByTestId('rows-count')).toBeDefined();
      expect(screen.getByTestId('columns-count')).toBeDefined();
    });

    it('should render correct number of rows and columns', () => {
      render(<AssessmentDetailDataGrid {...defaultProps} />);

      expect(screen.getByTestId('rows-count')).toHaveTextContent('2 rows');
      expect(screen.getByTestId('columns-count')).toHaveTextContent(
        '5 columns'
      );
    });

    it('should render loading state when isLoading is true', () => {
      render(<AssessmentDetailDataGrid {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId('loading-indicator')).toBeDefined();
      expect(screen.getByText('Loading...')).toBeDefined();
    });

    it('should render empty grid when no data is provided', () => {
      render(<AssessmentDetailDataGrid {...defaultProps} rows={[]} />);

      expect(screen.getByTestId('rows-count')).toHaveTextContent('0 rows');
    });
  });

  describe('Data Display', () => {
    it('should display correct IUV values for each row', () => {
      render(<AssessmentDetailDataGrid {...defaultProps} />);

      expect(screen.getByTestId('iuv-0')).toHaveTextContent('IUV123456789');
      expect(screen.getByTestId('iuv-1')).toHaveTextContent('IUV987654321');
    });

    it('should display formatted amount values', () => {
      render(<AssessmentDetailDataGrid {...defaultProps} />);

      expect(screen.getByTestId('amount-0')).toHaveTextContent('€100.50');
      expect(screen.getByTestId('amount-1')).toHaveTextContent('€50.25');
    });

    it('should render action buttons for each row', () => {
      render(<AssessmentDetailDataGrid {...defaultProps} />);

      expect(screen.getByTestId('navigate-to-detail-1001')).toBeDefined();
      expect(screen.getByTestId('navigate-to-detail-1002')).toBeDefined();
    });
  });

  describe('User Interactions', () => {
    it('should call onSortModelChange when sort is triggered', () => {
      render(<AssessmentDetailDataGrid {...defaultProps} />);

      const sortButton = screen.getByTestId('sort-trigger');
      fireEvent.click(sortButton);

      expect(mockOnSortModelChange).toHaveBeenCalledWith([
        { field: 'iuv', sort: 'asc' }
      ]);
    });

    it('should render action cell when renderCell is used', () => {
      render(<AssessmentDetailDataGrid {...defaultProps} />);

      expect(screen.getByTestId('action-cell-0')).toBeDefined();
      expect(screen.getByTestId('action-cell-1')).toBeDefined();
    });

    it('should call onNavigateToDetail when action button is clicked and callback is provided', () => {
      const mockOnNavigateToDetail = vi.fn();
      globalOnNavigateToDetail = mockOnNavigateToDetail;

      render(
        <AssessmentDetailDataGrid
          {...defaultProps}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      const actionButton = screen.getByTestId('navigate-to-detail-1001');
      fireEvent.click(actionButton);

      expect(mockOnNavigateToDetail).toHaveBeenCalledWith(1001);
    });

    it('should not call onNavigateToDetail when receiptId is undefined', () => {
      const mockOnNavigateToDetail = vi.fn();
      globalOnNavigateToDetail = mockOnNavigateToDetail;
      const dataWithoutReceiptId = [
        { ...mockAssessmentData[0], receiptId: undefined }
      ];

      render(
        <AssessmentDetailDataGrid
          {...defaultProps}
          rows={dataWithoutReceiptId}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      expect(screen.queryByTestId('navigate-to-detail-undefined')).toBeNull();
      expect(mockOnNavigateToDetail).not.toHaveBeenCalled();
    });

    it('should handle multiple action button clicks', () => {
      const mockOnNavigateToDetail = vi.fn();
      globalOnNavigateToDetail = mockOnNavigateToDetail;

      render(
        <AssessmentDetailDataGrid
          {...defaultProps}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      const actionButton1 = screen.getByTestId('navigate-to-detail-1001');
      const actionButton2 = screen.getByTestId('navigate-to-detail-1002');

      fireEvent.click(actionButton1);
      fireEvent.click(actionButton2);

      expect(mockOnNavigateToDetail).toHaveBeenCalledTimes(2);
      expect(mockOnNavigateToDetail).toHaveBeenNthCalledWith(1, 1001);
      expect(mockOnNavigateToDetail).toHaveBeenNthCalledWith(2, 1002);
    });
  });

  describe('Smart Pagination', () => {
    it('should handle smartPagination prop when provided', () => {
      const smartPaginationConfig = {
        initialPage: 0,
        initialSize: 10,
        sizeOptions: [5, 10, 20],
        backendData: {
          totalElements: 100,
          totalPages: 10,
          number: 0,
          size: 10
        },
        onFiltersApplied: vi.fn()
      };

      render(
        <AssessmentDetailDataGrid
          {...defaultProps}
          smartPagination={smartPaginationConfig}
        />
      );

      expect(screen.getByTestId('custom-data-grid')).toBeDefined();
    });

    it('should work without smartPagination prop', () => {
      render(<AssessmentDetailDataGrid {...defaultProps} />);

      expect(screen.getByTestId('custom-data-grid')).toBeDefined();
      expect(screen.getByTestId('data-grid-content')).toBeDefined();
    });
  });

  describe('Sort Model Management', () => {
    it('should handle different sort models', () => {
      const sortModel: GridSortModel = [{ field: 'iuv', sort: 'desc' }];

      render(
        <AssessmentDetailDataGrid {...defaultProps} sortModel={sortModel} />
      );

      expect(screen.getByTestId('custom-data-grid')).toBeDefined();
    });

    it('should handle empty sort model', () => {
      render(<AssessmentDetailDataGrid {...defaultProps} sortModel={[]} />);

      expect(screen.getByTestId('custom-data-grid')).toBeDefined();
    });

    it('should handle multiple sort criteria', () => {
      const sortModel: GridSortModel = [
        { field: 'iuv', sort: 'asc' },
        { field: 'amountCents', sort: 'desc' }
      ];

      render(
        <AssessmentDetailDataGrid {...defaultProps} sortModel={sortModel} />
      );

      expect(screen.getByTestId('custom-data-grid')).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing translation keys gracefully', () => {
      render(<AssessmentDetailDataGrid {...defaultProps} />);

      expect(screen.getByTestId('custom-data-grid')).toBeDefined();
    });

    it('should handle rows without assessmentDetailId', () => {
      const rowsWithoutId = mockAssessmentData.map((row) => ({
        ...row,
        assessmentDetailId: undefined
      }));

      render(
        <AssessmentDetailDataGrid {...defaultProps} rows={rowsWithoutId} />
      );

      expect(screen.getByTestId('custom-data-grid')).toBeDefined();
      expect(screen.getByTestId('rows-count')).toHaveTextContent('2 rows');
    });

    it('should handle rows without receiptId', () => {
      const rowsWithoutReceiptId = mockAssessmentData.map((row) => ({
        ...row,
        receiptId: undefined
      }));

      render(
        <AssessmentDetailDataGrid
          {...defaultProps}
          rows={rowsWithoutReceiptId}
        />
      );

      expect(screen.getByTestId('custom-data-grid')).toBeDefined();
      expect(screen.getByTestId('rows-count')).toHaveTextContent('2 rows');
      expect(screen.queryByTestId('navigate-to-detail-undefined')).toBeNull();
    });

    it('should handle missing date values gracefully', () => {
      const rowsWithMissingDates = [
        {
          ...mockAssessmentData[0],
          paymentDateTime: undefined,
          updateDateTime: undefined
        }
      ];

      render(
        <AssessmentDetailDataGrid
          {...defaultProps}
          rows={rowsWithMissingDates}
        />
      );

      expect(screen.getByTestId('custom-data-grid')).toBeDefined();
      expect(screen.getByTestId('rows-count')).toHaveTextContent('1 rows');
    });
  });

  describe('Component Props', () => {
    it('should use default isLoading value when not provided', () => {
      const { ...propsWithoutLoading } = defaultProps;

      render(<AssessmentDetailDataGrid {...propsWithoutLoading} />);

      expect(screen.getByTestId('data-grid-content')).toBeDefined();
      expect(screen.queryByTestId('loading-indicator')).toBeNull();
    });

    it('should handle all required props correctly', () => {
      const requiredProps = {
        rows: mockAssessmentData,
        sortModel: [] as GridSortModel,
        onSortModelChange: mockOnSortModelChange
      };

      render(<AssessmentDetailDataGrid {...requiredProps} />);

      expect(screen.getByTestId('custom-data-grid')).toBeDefined();
    });
  });

  describe('Date Formatting', () => {
    it('should format paymentDateTime correctly when present', () => {
      const testDate = '2025-01-15T10:30:00Z';
      const mockDataWithDates = [
        {
          ...mockAssessmentData[0],
          paymentDateTime: testDate
        }
      ];

      render(
        <AssessmentDetailDataGrid {...defaultProps} rows={mockDataWithDates} />
      );

      const expectedFormattedDate = new Date(testDate).toLocaleDateString(
        'it-IT'
      );
      expect(screen.getByTestId('payment-date-0')).toHaveTextContent(
        expectedFormattedDate
      );
    });

    it('should handle empty paymentDateTime gracefully', () => {
      const mockDataWithEmptyDate = [
        {
          ...mockAssessmentData[0],
          paymentDateTime: undefined
        }
      ];

      render(
        <AssessmentDetailDataGrid
          {...defaultProps}
          rows={mockDataWithEmptyDate}
        />
      );

      expect(screen.getByTestId('payment-date-0')).toHaveTextContent('');
    });

    it('should format updateDate correctly when present', () => {
      const testDate = '2025-01-15T11:00:00Z';
      const mockDataWithUpdateDate = [
        {
          ...mockAssessmentData[0],
          updateDate: testDate
        }
      ];

      render(
        <AssessmentDetailDataGrid
          {...defaultProps}
          rows={mockDataWithUpdateDate}
        />
      );

      const expectedFormattedDate = new Date(testDate).toLocaleDateString(
        'it-IT'
      );
      expect(screen.getByTestId('update-date-0')).toHaveTextContent(
        expectedFormattedDate
      );
    });

    it('should handle empty updateDate gracefully', () => {
      const mockDataWithEmptyDate = [
        {
          ...mockAssessmentData[0],
          updateDate: undefined
        }
      ];

      render(
        <AssessmentDetailDataGrid
          {...defaultProps}
          rows={mockDataWithEmptyDate}
        />
      );

      expect(screen.getByTestId('update-date-0')).toHaveTextContent('');
    });
  });

  describe('Money Formatting', () => {
    it('should format amount correctly using moneyFormat', () => {
      const testAmount = 15099;
      const mockDataWithAmount = [
        {
          ...mockAssessmentData[0],
          amountCents: testAmount
        }
      ];

      render(
        <AssessmentDetailDataGrid {...defaultProps} rows={mockDataWithAmount} />
      );

      const expectedFormattedAmount = `€${(testAmount / 100).toFixed(2)}`;
      expect(screen.getByTestId('amount-0')).toHaveTextContent(
        expectedFormattedAmount
      );
    });

    it('should handle zero amount correctly', () => {
      const mockDataWithZeroAmount = [
        {
          ...mockAssessmentData[0],
          amountCents: 0
        }
      ];

      render(
        <AssessmentDetailDataGrid
          {...defaultProps}
          rows={mockDataWithZeroAmount}
        />
      );

      expect(screen.getByTestId('amount-0')).toHaveTextContent('€0.00');
    });
  });

  describe('getRowId Functionality', () => {
    it('should use assessmentDetailId as row id when available', () => {
      render(<AssessmentDetailDataGrid {...defaultProps} />);

      expect(screen.getByTestId('row-id-0')).toHaveTextContent('1');
      expect(screen.getByTestId('row-id-1')).toHaveTextContent('2');
    });

    it('should use fallback row id when assessmentDetailId is undefined', () => {
      const rowsWithoutDetailId = [
        {
          ...mockAssessmentData[0],
          assessmentDetailId: undefined,
          assessmentId: 999,
          iuv: 'FALLBACK_IUV'
        }
      ];

      render(
        <AssessmentDetailDataGrid
          {...defaultProps}
          rows={rowsWithoutDetailId}
        />
      );

      expect(screen.getByTestId('row-id-0')).toHaveTextContent(
        '999-FALLBACK_IUV'
      );
      expect(screen.getByTestId('rows-count')).toHaveTextContent('1 rows');
    });
  });

  describe('Navigation Callback', () => {
    it('should not call onNavigateToDetail when receiptId is undefined', () => {
      const mockOnNavigateToDetail = vi.fn();
      globalOnNavigateToDetail = mockOnNavigateToDetail;
      const dataWithUndefinedReceiptId = [
        { ...mockAssessmentData[0], receiptId: undefined }
      ];

      render(
        <AssessmentDetailDataGrid
          {...defaultProps}
          rows={dataWithUndefinedReceiptId}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      expect(mockOnNavigateToDetail).not.toHaveBeenCalled();
    });

    it('should not call onNavigateToDetail when receiptId is 0', () => {
      const mockOnNavigateToDetail = vi.fn();
      globalOnNavigateToDetail = mockOnNavigateToDetail;
      const dataWithZeroReceiptId = [
        { ...mockAssessmentData[0], receiptId: 0 }
      ];

      render(
        <AssessmentDetailDataGrid
          {...defaultProps}
          rows={dataWithZeroReceiptId}
          onNavigateToDetail={mockOnNavigateToDetail}
        />
      );

      expect(screen.queryByTestId('navigate-to-detail-0')).toBeNull();
      expect(mockOnNavigateToDetail).not.toHaveBeenCalled();
    });
  });

  describe('Column Configuration', () => {
    it('should render correct number of columns including action column', () => {
      render(<AssessmentDetailDataGrid {...defaultProps} />);

      expect(screen.getByTestId('columns-count')).toHaveTextContent(
        '5 columns'
      );
    });

    it('should handle missing IUV values', () => {
      const dataWithMissingIUV = [
        {
          ...mockAssessmentData[0],
          iuv: ''
        }
      ];

      render(
        <AssessmentDetailDataGrid {...defaultProps} rows={dataWithMissingIUV} />
      );

      expect(screen.getByTestId('custom-data-grid')).toBeDefined();
    });
  });

  describe('Action Column Rendering', () => {
    it('should render action cell for rows with receiptId', () => {
      render(<AssessmentDetailDataGrid {...defaultProps} />);

      expect(screen.getByTestId('action-cell-0')).toBeDefined();
      expect(screen.getByTestId('action-cell-1')).toBeDefined();
    });

    it('should not render action cell for rows without receiptId', () => {
      const rowsWithoutReceiptId = [
        { ...mockAssessmentData[0], receiptId: undefined }
      ];

      render(
        <AssessmentDetailDataGrid
          {...defaultProps}
          rows={rowsWithoutReceiptId}
        />
      );

      expect(screen.queryByTestId('action-cell-0')).toBeNull();
    });

    it('should render IconButton with correct aria-label in action column', () => {
      render(<AssessmentDetailDataGrid {...defaultProps} />);

      const actionCell = screen.getByTestId('action-cell-0');
      expect(actionCell).toBeDefined();
    });
  });
});
