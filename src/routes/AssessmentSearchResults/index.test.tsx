import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '../../__tests__/renderers';
import AssessmentSearchResults from './index';

type MockDataGridProps = {
  data?: { content?: Array<unknown> };
  onSortChange: (sort: Array<string>) => void;
  onPaginationChange: (params: { page: number; size: number }) => void;
  isLoading?: boolean;
};

vi.mock('./AssessmentSearchResultsDataGrid', () => ({
  default: ({
    data,
    onSortChange,
    onPaginationChange,
    isLoading
  }: MockDataGridProps) => (
    <div data-testid="assessment-search-results-datagrid">
      <span data-testid="mock-data-length">{data?.content?.length || 0}</span>
      <span data-testid="mock-is-loading">
        {isLoading ? 'loading' : 'loaded'}
      </span>
      <button
        data-testid="mock-sort-change"
        onClick={() => onSortChange(['test,ASC'])}
      >
        Sort
      </button>
      <button
        data-testid="mock-pagination-change"
        onClick={() => onPaginationChange({ page: 1, size: 10 })}
      >
        Paginate
      </button>
    </div>
  )
}));

const mockRemoveAllFilters = vi.fn();
const mockNoFilterIsSelected = vi.fn(() => false);
const mockExecuteSearch = vi.fn();
const mockSetSort = vi.fn();
const mockHandlePaginationChange = vi.fn();

vi.mock('../../hooks/useMultiFilters', () => ({
  useMultiFilters: vi.fn(() => ({
    filterMap: {
      ASSESSMENT_NAME: {
        label: 'assessment.name',
        fields: [
          {
            type: 'textField',
            label: 'assessment.name'
          }
        ]
      },
      DEBT_TYPE: {
        label: 'debtType.title',
        fields: [
          {
            type: 'select',
            label: 'debtType.title',
            options: []
          }
        ]
      }
    },
    selectedFilters: ['ASSESSMENT_NAME'],
    removeAllFilters: mockRemoveAllFilters,
    noFilterIsSelected: {
      peek: mockNoFilterIsSelected
    },
    filterValues: {
      ASSESSMENT_NAME: 'Test Assessment',
      DEBT_TYPE: '',
      ASSESSMENT_STATUS: '',
      IUV: '',
      LAST_UPDATE_DATE_FROM: null,
      LAST_UPDATE_DATE_TO: null
    }
  })),
  FilterCategory: {
    ASSESSMENT: 'ASSESSMENT'
  }
}));

const mockAssessmentsSearch = {
  executeSearch: mockExecuteSearch,
  setSort: mockSetSort,
  handlePaginationChange: mockHandlePaginationChange,
  isLoading: false,
  isError: false,
  error: null,
  data: {
    content: [
      {
        assessmentId: 1,
        assessmentName: 'Test Assessment 1',
        status: 'ACTIVE'
      }
    ],
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 20
  }
};

vi.mock('../../hooks/useAssessmentsSearch', () => ({
  useAssessmentsSearch: () => mockAssessmentsSearch
}));

describe('AssessmentSearchResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAssessmentsSearch.isLoading = false;
    mockNoFilterIsSelected.mockReturnValue(false);
  });

  it('should render all main elements', () => {
    render(<AssessmentSearchResults />);

    expect(
      screen.getByText('commons.routes.ASSESSMENT_SEARCH_RESULTS')
    ).toBeInTheDocument();
    expect(screen.getByTestId('open-drawer')).toBeInTheDocument();
    expect(
      screen.getByText('commons.filters.filtersField (1)')
    ).toBeInTheDocument();

    expect(
      screen.getByTestId('assessment-search-results-datagrid')
    ).toBeInTheDocument();
  });

  it('should display correct filter count in drawer button', () => {
    render(<AssessmentSearchResults />);

    const drawerButton = screen.getByTestId('open-drawer');
    expect(drawerButton).toHaveTextContent('commons.filters.filtersField (1)');
  });

  it('should open and close drawer when button is clicked', () => {
    render(<AssessmentSearchResults />);

    const drawerButton = screen.getByTestId('open-drawer');
    const drawer = screen.getByTestId('drawer');

    expect(drawer.closest('.MuiDrawer-root')).toHaveStyle('visibility: hidden');

    fireEvent.click(drawerButton);

    expect(drawer.closest('.MuiDrawer-root')).not.toHaveStyle(
      'visibility: hidden'
    );
    expect(
      screen.getByText('commons.filters.filterResults')
    ).toBeInTheDocument();
    expect(screen.getByText('commons.filters.remove')).toBeInTheDocument();
  });

  it('should apply filters when filter button in drawer is clicked', () => {
    mockNoFilterIsSelected.mockReturnValue(true);

    render(<AssessmentSearchResults />);

    fireEvent.click(screen.getByTestId('open-drawer'));

    const filterButton = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterButton);

    expect(mockExecuteSearch).toHaveBeenCalledWith({
      ASSESSMENT_NAME: 'Test Assessment',
      DEBT_TYPE: '',
      ASSESSMENT_STATUS: '',
      IUV: '',
      LAST_UPDATE_DATE_FROM: null,
      LAST_UPDATE_DATE_TO: null
    });
  });

  it('should show error when applying filters without selected filters', () => {
    render(<AssessmentSearchResults />);

    fireEvent.click(screen.getByTestId('open-drawer'));

    const filterButton = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterButton);

    expect(screen.getByTestId('multifilters-error-text')).toBeInTheDocument();
    expect(
      screen.getByText('commons.filters.atLeastOneFilter')
    ).toBeInTheDocument();

    expect(mockExecuteSearch).not.toHaveBeenCalled();
  });

  it('should remove all filters when remove button in drawer is clicked', () => {
    render(<AssessmentSearchResults />);
    fireEvent.click(screen.getByTestId('open-drawer'));

    const removeButton = screen.getByText('commons.filters.remove');
    fireEvent.click(removeButton);

    expect(mockRemoveAllFilters).toHaveBeenCalled();
  });

  it('should pass correct props to AssessmentSearchResultsDataGrid', () => {
    render(<AssessmentSearchResults />);

    expect(screen.getByTestId('mock-data-length')).toHaveTextContent('1');
    expect(screen.getByTestId('mock-is-loading')).toHaveTextContent('loaded');
  });

  it('should handle sort change from DataGrid', () => {
    render(<AssessmentSearchResults />);

    const sortButton = screen.getByTestId('mock-sort-change');
    fireEvent.click(sortButton);

    expect(mockSetSort).toHaveBeenCalledWith(['test,ASC']);
  });

  it('should handle pagination change from DataGrid', () => {
    render(<AssessmentSearchResults />);

    const paginationButton = screen.getByTestId('mock-pagination-change');
    fireEvent.click(paginationButton);

    expect(mockHandlePaginationChange).toHaveBeenCalledWith({
      page: 1,
      size: 10
    });
  });

  it('should show loading state in DataGrid when isLoading is true', () => {
    mockAssessmentsSearch.isLoading = true;

    render(<AssessmentSearchResults />);

    expect(screen.getByTestId('mock-is-loading')).toHaveTextContent('loading');
  });

  it('should close drawer after applying filters successfully', async () => {
    mockNoFilterIsSelected.mockReturnValue(true);

    render(<AssessmentSearchResults />);

    const drawer = screen.getByTestId('drawer');

    fireEvent.click(screen.getByTestId('open-drawer'));
    expect(
      screen.getByText('commons.filters.filterResults')
    ).toBeInTheDocument();

    const filterButton = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterButton);

    expect(mockExecuteSearch).toHaveBeenCalledWith({
      ASSESSMENT_NAME: 'Test Assessment',
      DEBT_TYPE: '',
      ASSESSMENT_STATUS: '',
      IUV: '',
      LAST_UPDATE_DATE_FROM: null,
      LAST_UPDATE_DATE_TO: null
    });

    await waitFor(() => {
      expect(drawer.closest('.MuiDrawer-root')).toHaveStyle(
        'visibility: hidden'
      );
    });
  });
});
