/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '../../__tests__/renderers';
import {
  filterValues,
  initialFilterValues,
  selectedFilters
} from '../../store/FilterStore';
import AssessmentSearchResults from '../AssessmentSearchResults';

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

// Mock AssessmentSearchResultsDataGrid component
vi.mock('./AssessmentSearchResultsDataGrid', () => ({
  default: (props: any) => {
    const length = props.data?.content?.length || 0;
    const loadingText = props.isLoading ? 'loading' : 'loaded';
    return (
      <div data-testid="assessment-search-results-datagrid">
        <span data-testid="mock-data-length">{length}</span>
        <span data-testid="mock-is-loading">{loadingText}</span>
      </div>
    );
  }
}));

// Mock FilterDrawer component with data-testid and visibility logic
vi.mock('../../components/Drawer/FilterDrawer', () => ({
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
}));

// Mock useSearch hook to return controlled data and spy on applyFilters
const mockApplyFilters = vi.fn();
vi.mock('../../hooks/useSearch', () => ({
  useSearch: vi.fn(() => ({
    query: {
      data: mockAssessmentsSearchData,
      isPending: false
    },
    applyFilters: mockApplyFilters
  }))
}));

describe('AssessmentSearchResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state before each test
    filterValues.value = { ...initialFilterValues };
    selectedFilters.value = [];

    mockApplyFilters.mockClear();
  });

  it('should render all main elements', () => {
    render(<AssessmentSearchResults />);
    expect(
      screen.getByText('commons.routes.ASSESSMENT_SEARCH_RESULTS')
    ).toBeInTheDocument();
    expect(screen.getByTestId('open-drawer')).toBeInTheDocument();
    expect(
      screen.getByText('commons.filters.filtersField (0)')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('assessment-search-results-datagrid')
    ).toBeInTheDocument();
  });

  it('should display correct filter count in drawer button', () => {
    selectedFilters.value = ['ASSESSMENT_NAME'];
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
    selectedFilters.value = ['ASSESSMENT_NAME'];
    filterValues.value = {
      ...initialFilterValues,
      ASSESSMENT_NAME: 'Test Assessment'
    };
    render(<AssessmentSearchResults />);
    fireEvent.click(screen.getByTestId('open-drawer'));
    const filterButton = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterButton);
    expect(mockApplyFilters).toHaveBeenCalledWith(filterValues.value);
  });

  it('should show error when applying filters without selected filters', () => {
    selectedFilters.value = [];
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
    selectedFilters.value = ['ASSESSMENT_NAME'];
    render(<AssessmentSearchResults />);
    fireEvent.click(screen.getByTestId('open-drawer'));
    const removeButton = screen.getByText('commons.filters.remove');
    fireEvent.click(removeButton);
    // check if selectedFilters were cleared
    expect(selectedFilters.value.length).toBe(0);
  });

  it('should pass correct props to AssessmentSearchResultsDataGrid', () => {
    render(<AssessmentSearchResults />);
    expect(screen.getByTestId('mock-data-length')).toHaveTextContent('1');
    expect(screen.getByTestId('mock-is-loading')).toHaveTextContent('loaded');
  });

  it('should close drawer after applying filters successfully', async () => {
    selectedFilters.value = ['ASSESSMENT_NAME'];
    filterValues.value = {
      ...initialFilterValues,
      ASSESSMENT_NAME: 'Test Assessment'
    };
    render(<AssessmentSearchResults />);
    const drawer = screen.getByTestId('drawer');
    fireEvent.click(screen.getByTestId('open-drawer'));
    expect(
      screen.getByText('commons.filters.filterResults')
    ).toBeInTheDocument();
    const filterButton = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterButton);
    expect(mockApplyFilters).toHaveBeenCalledWith(filterValues.value);
    await waitFor(() => {
      expect(drawer).toHaveStyle({ visibility: 'hidden' });
    });
  });
});
