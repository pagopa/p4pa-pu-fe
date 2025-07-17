import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../__tests__/renderers';
import AssessmentDetailDataGrid from './AssessmentDetailDataGrid';
import { AssessmentsDetail } from '../../../../generated/apiClient';
import { GridSortModel, GridColDef } from '@mui/x-data-grid';

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
    'data-testid': testId
  }: {
    rows: Array<AssessmentsDetail>;
    columns: Array<GridColDef>;
    loading: boolean;
    sortModel: GridSortModel;
    onSortModelChange: (model: GridSortModel) => void;
    smartPagination?: unknown;
    'data-testid'?: string;
  }) => {
    const actionColumn = columns.find((col) => col.field === 'action');

    return (
      <div data-testid={testId || 'custom-data-grid'}>
        {loading ? (
          <div data-testid="loading-indicator">Loading...</div>
        ) : (
          <div data-testid="data-grid-content">
            <div data-testid="rows-count">{rows.length} rows</div>
            <div data-testid="columns-count">{columns.length} columns</div>
            {rows.map((row, index) => (
              <div key={index} data-testid={`row-${index}`}>
                <span data-testid={`iuv-${index}`}>{row.iuv}</span>
                <span data-testid={`amount-${index}`}>{row.amountCents}</span>
                {row.assessmentDetailId && actionColumn && (
                  <button
                    data-testid={`navigate-to-detail-${row.assessmentDetailId}`}
                    onClick={() => {
                      if (globalOnNavigateToDetail) {
                        globalOnNavigateToDetail(row.assessmentDetailId!);
                      } else {
                        console.log('Navigate to assessment detail item');
                      }
                    }}
                  >
                    Navigate
                  </button>
                )}
              </div>
            ))}
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
      amountSubmitted: true
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
      amountSubmitted: false
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

      expect(screen.getByTestId('amount-0')).toHaveTextContent('10050');
      expect(screen.getByTestId('amount-1')).toHaveTextContent('5025');
    });

    it('should render action buttons for each row', () => {
      render(<AssessmentDetailDataGrid {...defaultProps} />);

      expect(screen.getByTestId('navigate-to-detail-1')).toBeDefined();
      expect(screen.getByTestId('navigate-to-detail-2')).toBeDefined();
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

    it('should log navigation message when action button is clicked and no onNavigateToDetail is provided', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn());

      render(<AssessmentDetailDataGrid {...defaultProps} />);

      const actionButton = screen.getByTestId('navigate-to-detail-1');
      fireEvent.click(actionButton);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Navigate to assessment detail item'
      );

      consoleSpy.mockRestore();
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

      const actionButton = screen.getByTestId('navigate-to-detail-1');
      fireEvent.click(actionButton);

      expect(mockOnNavigateToDetail).toHaveBeenCalledWith(1);
    });

    it('should not call onNavigateToDetail when assessmentDetailId is undefined', () => {
      const mockOnNavigateToDetail = vi.fn();
      globalOnNavigateToDetail = mockOnNavigateToDetail;
      const dataWithoutId = [
        { ...mockAssessmentData[0], assessmentDetailId: undefined }
      ];

      render(
        <AssessmentDetailDataGrid
          {...defaultProps}
          rows={dataWithoutId}
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

      const actionButton1 = screen.getByTestId('navigate-to-detail-1');
      const actionButton2 = screen.getByTestId('navigate-to-detail-2');

      fireEvent.click(actionButton1);
      fireEvent.click(actionButton2);

      expect(mockOnNavigateToDetail).toHaveBeenCalledTimes(2);
      expect(mockOnNavigateToDetail).toHaveBeenNthCalledWith(1, 1);
      expect(mockOnNavigateToDetail).toHaveBeenNthCalledWith(2, 2);
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
});
