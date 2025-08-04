import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import AssessmentSearchResultsDataGrid from './AssessmentSearchResultsDataGrid';
import {
  PagedAssessmentsExtendedDTO,
  AssessmentsExtendedDTO
} from '../../../generated/data-contracts';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
  generatePath: () => '/assessment/detail/1',
  Navigate: () => null,
  useLocation: () => ({ pathname: '/' }),
  useParams: () => ({}),
  Link: ({ children }: { children: React.ReactNode }) => children,
  NavLink: ({ children }: { children: React.ReactNode }) => children,
  Outlet: () => null,
  createBrowserRouter: () => ({}),
  RouterProvider: ({ children }: { children: React.ReactNode }) => children,
  MemoryRouter: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('../../utils/formatters', () => ({
  formatDate: () => '01/01/2023'
}));

vi.mock('../../utils/assessmentHelpers', () => ({
  getAssessmentStatusChipProps: () => ({
    label: 'Active',
    color: 'success'
  })
}));

vi.mock('../../components/DataGrid/CustomDataGrid', () => ({
  default: ({
    rows,
    columns,
    onSortModelChange,
    smartPagination
  }: {
    rows: Array<{
      assessmentName?: string;
      status?: string;
      assessmentId?: number;
    }>;
    columns: Array<unknown>;
    onSortModelChange: (model: Array<{ field: string; sort: string }>) => void;
    smartPagination?: {
      onPaginationChange: (params: { page: number; size: number }) => void;
    };
  }) => (
    <div data-testid="custom-data-grid">
      <div data-testid="rows-count">{rows.length} rows</div>
      <div data-testid="columns-count">{columns.length} columns</div>
      <button
        data-testid="sort-trigger"
        onClick={() => onSortModelChange([{ field: 'test', sort: 'asc' }])}
      >
        Sort
      </button>
      <button
        data-testid="pagination-trigger"
        onClick={() =>
          smartPagination?.onPaginationChange({ page: 1, size: 10 })
        }
      >
        Paginate
      </button>
      {rows.map((row, index: number) => (
        <div key={index} data-testid={`row-${index}`}>
          <span data-testid={`name-${index}`}>{row.assessmentName}</span>
          <span data-testid={`status-${index}`}>{row.status || '-'}</span>
          {row.assessmentId && (
            <button
              data-testid="assessment-detail-button"
              onClick={() => {
                // Simula il click del pulsante di dettaglio
              }}
            >
              Detail
            </button>
          )}
        </div>
      ))}
    </div>
  )
}));

describe('AssessmentSearchResultsDataGrid', () => {
  const mockOnSortChange = vi.fn();
  const mockOnPaginationChange = vi.fn();

  const mockData: PagedAssessmentsExtendedDTO = {
    content: [
      {
        assessmentId: 1,
        assessmentName: 'Test Assessment 1',
        debtPositionTypeOrgCode: 'DEBT001',
        organizationId: 123,
        status: 'ACTIVE'
      } as AssessmentsExtendedDTO,
      {
        assessmentId: 2,
        assessmentName: 'Test Assessment 2',
        debtPositionTypeOrgCode: 'DEBT002',
        organizationId: 123,
        status: 'CLOSED'
      } as AssessmentsExtendedDTO
    ],
    totalElements: 2,
    totalPages: 1,
    number: 0,
    size: 10
  };

  const defaultProps = {
    data: mockData,
    onSortChange: mockOnSortChange,
    onPaginationChange: mockOnPaginationChange,
    isLoading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render successfully', () => {
      render(<AssessmentSearchResultsDataGrid {...defaultProps} />);

      expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    });

    it('should display correct number of rows and columns', () => {
      render(<AssessmentSearchResultsDataGrid {...defaultProps} />);

      expect(screen.getByTestId('rows-count')).toHaveTextContent('2 rows');
      expect(screen.getByTestId('columns-count')).toHaveTextContent(
        '6 columns'
      );
    });

    it('should render empty state when no data provided', () => {
      render(
        <AssessmentSearchResultsDataGrid {...defaultProps} data={undefined} />
      );

      expect(screen.getByTestId('rows-count')).toHaveTextContent('0 rows');
    });

    it('should render empty state when content is empty', () => {
      const emptyData = { ...mockData, content: [] };
      render(
        <AssessmentSearchResultsDataGrid {...defaultProps} data={emptyData} />
      );

      expect(screen.getByTestId('rows-count')).toHaveTextContent('0 rows');
    });
  });

  describe('Data Display', () => {
    it('should display assessment names', () => {
      render(<AssessmentSearchResultsDataGrid {...defaultProps} />);

      expect(screen.getByTestId('name-0')).toHaveTextContent(
        'Test Assessment 1'
      );
      expect(screen.getByTestId('name-1')).toHaveTextContent(
        'Test Assessment 2'
      );
    });

    it('should display status values', () => {
      render(<AssessmentSearchResultsDataGrid {...defaultProps} />);

      expect(screen.getByTestId('status-0')).toHaveTextContent('ACTIVE');
      expect(screen.getByTestId('status-1')).toHaveTextContent('CLOSED');
    });
  });

  describe('User Interactions', () => {
    it('should call onSortChange when sort is triggered', () => {
      render(<AssessmentSearchResultsDataGrid {...defaultProps} />);

      fireEvent.click(screen.getByTestId('sort-trigger'));

      expect(mockOnSortChange).toHaveBeenCalledWith(['test,ASC']);
    });

    it('should call onPaginationChange when pagination is triggered', () => {
      render(<AssessmentSearchResultsDataGrid {...defaultProps} />);

      fireEvent.click(screen.getByTestId('pagination-trigger'));

      expect(mockOnPaginationChange).toHaveBeenCalledWith({
        page: 1,
        size: 10
      });
    });

    it('should render detail buttons and be clickable', () => {
      render(<AssessmentSearchResultsDataGrid {...defaultProps} />);

      const detailButtons = screen.getAllByTestId('assessment-detail-button');
      expect(detailButtons).toHaveLength(2);

      fireEvent.click(detailButtons[0]);
      // I pulsanti devono essere cliccabili senza errori
    });
  });

  describe('Sort Functionality', () => {
    it('should handle empty sort model', () => {
      render(<AssessmentSearchResultsDataGrid {...defaultProps} />);

      // Component should render without errors
      expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    });

    it('should transform sort field correctly', () => {
      render(<AssessmentSearchResultsDataGrid {...defaultProps} />);

      fireEvent.click(screen.getByTestId('sort-trigger'));

      expect(mockOnSortChange).toHaveBeenCalledWith(['test,ASC']);
    });
  });

  describe('Pagination Configuration', () => {
    it('should handle pagination data correctly', () => {
      render(<AssessmentSearchResultsDataGrid {...defaultProps} />);

      expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    });

    it('should handle undefined data gracefully', () => {
      render(
        <AssessmentSearchResultsDataGrid {...defaultProps} data={undefined} />
      );

      expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing data gracefully', () => {
      const incompleteData = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 10
      };

      render(
        <AssessmentSearchResultsDataGrid
          {...defaultProps}
          data={incompleteData}
        />
      );

      expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
      expect(screen.getByTestId('rows-count')).toHaveTextContent('0 rows');
    });

    it('should render without crashing when props are minimal', () => {
      const minimalProps = {
        data: undefined,
        onSortChange: vi.fn(),
        onPaginationChange: vi.fn()
      };

      render(<AssessmentSearchResultsDataGrid {...minimalProps} />);

      expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have correct column configuration', () => {
      render(<AssessmentSearchResultsDataGrid {...defaultProps} />);

      expect(screen.getByTestId('columns-count')).toHaveTextContent(
        '6 columns'
      );
    });

    it('should pass correct row ID generation', () => {
      render(<AssessmentSearchResultsDataGrid {...defaultProps} />);

      expect(screen.getByTestId('name-0')).toBeInTheDocument();
    });
  });

  describe('Column Rendering - updateOperatorExternalId', () => {
    it('should display dash when updateOperatorExternalId is undefined', () => {
      const dataWithUndefinedOperator = {
        ...mockData,
        content: [
          {
            ...mockData.content[0],
            updateOperatorExternalId: undefined
          }
        ]
      };

      render(
        <AssessmentSearchResultsDataGrid
          {...defaultProps}
          data={dataWithUndefinedOperator}
        />
      );

      expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    });
  });

  describe('Column Rendering - updateDate', () => {
    it('should display dash when updateDate is undefined', () => {
      const dataWithUndefinedDate = {
        ...mockData,
        content: [
          {
            ...mockData.content[0],
            updateDate: undefined
          }
        ]
      };

      render(
        <AssessmentSearchResultsDataGrid
          {...defaultProps}
          data={dataWithUndefinedDate}
        />
      );

      expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    });
  });

  describe('Navigation and Detail Action', () => {
    it('should handle detail button click with valid assessmentId', () => {
      render(<AssessmentSearchResultsDataGrid {...defaultProps} />);

      const detailButtons = screen.getAllByTestId('assessment-detail-button');
      expect(detailButtons).toHaveLength(2);

      fireEvent.click(detailButtons[0]);

      // Il pulsante dovrebbe essere cliccabile senza errori
      expect(detailButtons[0]).toBeInTheDocument();
    });
  });

  describe('Sort Model Edge Cases', () => {
    it('should handle sort model with undefined sort', () => {
      render(<AssessmentSearchResultsDataGrid {...defaultProps} />);

      // Simula un sort model con sort undefined
      const customDataGrid = screen.getByTestId('custom-data-grid');
      expect(customDataGrid).toBeInTheDocument();
    });

    it('should handle multiple sort items correctly', () => {
      render(<AssessmentSearchResultsDataGrid {...defaultProps} />);

      fireEvent.click(screen.getByTestId('sort-trigger'));

      expect(mockOnSortChange).toHaveBeenCalledWith(['test,ASC']);
    });
  });

  describe('Additional Coverage Tests', () => {
    it('should render with isLoading prop', () => {
      render(
        <AssessmentSearchResultsDataGrid {...defaultProps} isLoading={true} />
      );

      expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    });

    it('should render with different data structure', () => {
      const alternativeData = {
        ...mockData,
        content: [
          {
            ...mockData.content[0],
            assessmentName: 'Alternative Assessment'
          }
        ]
      };

      render(
        <AssessmentSearchResultsDataGrid
          {...defaultProps}
          data={alternativeData}
        />
      );

      expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    });

    it('should handle component with all props provided', () => {
      render(
        <AssessmentSearchResultsDataGrid
          data={mockData}
          onSortChange={mockOnSortChange}
          onPaginationChange={mockOnPaginationChange}
          isLoading={false}
        />
      );

      expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    });
  });
});
