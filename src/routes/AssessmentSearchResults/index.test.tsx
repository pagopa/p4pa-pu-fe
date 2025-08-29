/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '../../__tests__/renderers';
import AssessmentSearchResults from './index';

// Mock component props type
type MockDataGridProps = {
  data?: { content?: Array<unknown> };
  onSortChange?: (sort: Array<string>) => void;
  onPaginationChange?: (params: { page: number; size: number }) => void;
  isLoading?: boolean;
};

// Mock data for assessments
const mockAssessmentsSearchData = {
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
};

// Mocks for functions used in hooks and components
const mockRemoveAllFilters = vi.fn();
const mockNoFilterIsSelected = vi.fn(() => false);
const mockApplyFilters = vi.fn();

// Mock useMultiFilters hook
vi.mock('../../hooks/useMultiFilters', () => {
  return {
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
  };
});

// Mock useSearch hook
vi.mock('../../hooks/useSearch', () => {
  return {
    useSearch: vi.fn(() => ({
      query: {
        data: mockAssessmentsSearchData,
        isPending: false
      },
      applyFilters: mockApplyFilters
    }))
  };
});

// Mock AssessmentSearchResultsDataGrid component
vi.mock('./AssessmentSearchResultsDataGrid', () => {
  return {
    default: (props: MockDataGridProps) => {
      const length = props.data?.content?.length || 0;
      const loadingText = props.isLoading ? 'loading' : 'loaded';
      return (
        <div data-testid="assessment-search-results-datagrid">
          <span data-testid="mock-data-length">{length}</span>
          <span data-testid="mock-is-loading">{loadingText}</span>
        </div>
      );
    }
  };
});

// Mock FilterDrawer component with data-testid and visibility logic
vi.mock('../../components/Drawer/FilterDrawer', () => {
  return {
    FilterDrawer: (props: any) => {
      const {
        open,
        onClose,
        title,
        render,
        buttons,
        'data-testid': dataTestId
      } = props;
      return (
        <div
          data-testid={dataTestId ?? 'drawer'}
          style={{ visibility: open ? 'visible' : 'hidden' }}
        >
          <div>{title}</div>
          {render}
          {buttons?.map((btn: any, idx: number) => (
            <button key={idx} onClick={btn.onButtonClick}>
              {btn.buttonText}
            </button>
          ))}
          <button onClick={onClose}>Close</button>
        </div>
      );
    }
  };
});

describe('AssessmentSearchResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApplyFilters.mockClear();
    // Default: no filters selected = false, triggers error case
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

    expect(drawer).toHaveStyle({ visibility: 'hidden' });
    fireEvent.click(drawerButton);
    expect(drawer).toHaveStyle({ visibility: 'visible' });
    expect(
      screen.getByText('commons.filters.filterResults')
    ).toBeInTheDocument();
    expect(screen.getByText('commons.filters.remove')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close'));
    expect(drawer).toHaveStyle({ visibility: 'hidden' });
  });

  it('should apply filters when filter button in drawer is clicked', () => {
    mockNoFilterIsSelected.mockReturnValue(true); // filters are selected
    render(<AssessmentSearchResults />);
    fireEvent.click(screen.getByTestId('open-drawer'));
    const filterButton = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterButton);
    expect(mockApplyFilters).toHaveBeenCalledWith({
      ASSESSMENT_NAME: 'Test Assessment',
      DEBT_TYPE: '',
      ASSESSMENT_STATUS: '',
      IUV: '',
      LAST_UPDATE_DATE_FROM: null,
      LAST_UPDATE_DATE_TO: null
    });
  });

  it('should show error when applying filters without selected filters', () => {
    mockNoFilterIsSelected.mockReturnValue(false); // no filters selected, should show error
    render(<AssessmentSearchResults />);
    fireEvent.click(screen.getByTestId('open-drawer'));
    const filterButton = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterButton);
    expect(screen.getByTestId('multifilters-error-text')).toBeInTheDocument();
    expect(
      screen.getByText('commons.filters.atLeastOneFilter')
    ).toBeInTheDocument();
    expect(mockApplyFilters).not.toHaveBeenCalled();
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
    expect(mockApplyFilters).toHaveBeenCalledWith({
      ASSESSMENT_NAME: 'Test Assessment',
      DEBT_TYPE: '',
      ASSESSMENT_STATUS: '',
      IUV: '',
      LAST_UPDATE_DATE_FROM: null,
      LAST_UPDATE_DATE_TO: null
    });
    await waitFor(() => {
      expect(drawer).toHaveStyle({ visibility: 'hidden' });
    });
  });
});
