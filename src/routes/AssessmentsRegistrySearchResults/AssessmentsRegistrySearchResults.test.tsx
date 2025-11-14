import { render, screen, fireEvent } from '../../__tests__/renderers';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { AssessmentsRegistrySearchResults } from '.';

// --- Mocks ---

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn()
}));

vi.mock('./SearchResultDataGrid', () => ({
  SearchResultsDataGrid: () => <div data-testid="search-results-grid" />
}));

const removeAllFiltersMock = vi.fn();
const applyFiltersMock = vi.fn();

vi.mock('../../hooks/useMultiFilters', () => ({
  useMultiFilters: () => ({
    filterMap: {},
    selectedFilters: ['filterA'],
    removeAllFilters: removeAllFiltersMock,
    noFilterIsSelected: { peek: () => true },
    filterValues: {}
  }),
  FilterCategory: {
    ASSESSMENTS_REGISTRY: 'ASSESSMENTS_REGISTRY'
  }
}));

vi.mock('../../hooks/useSearch', () => ({
  useSearch: () => ({
    query: { data: { items: [{ id: 1 }] } },
    setSort: vi.fn(),
    handlePaginationChange: vi.fn(),
    applyFilters: applyFiltersMock
  })
}));

vi.mock('../../components/Drawer/FilterDrawer', () => ({
  FilterDrawer: ({
    open,
    onClose,
    title,
    render,
    buttons,
    onSubmit
  }: {
    open: boolean;
    onClose: () => void;
    title: string;
    render?: React.ReactNode;
    onSubmit?: () => void;
    buttons: Array<{
      buttonText: string;
      onButtonClick?: () => void;
      variant: string;
      id: string;
    }>;
  }) => (
    <div
      data-testid="drawer"
      style={{ visibility: open ? 'visible' : 'hidden' }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.();
        }}
      >
        <span>{title}</span>
        {render}
        {buttons.map((btn, index) => {
          const isSubmitButton =
            onSubmit &&
            btn.variant === 'contained' &&
            buttons.findIndex((b) => b.variant === 'contained') === index;

          return (
            <button
              key={btn.id}
              type={isSubmitButton ? 'submit' : 'button'}
              onClick={isSubmitButton ? undefined : btn.onButtonClick}
              data-testid={btn.id}
            >
              {btn.buttonText}
            </button>
          );
        })}
      </form>
      <button onClick={onClose} data-testid="close-drawer">
        Close
      </button>
    </div>
  )
}));

// --- Tests ---
describe('AssessmentsRegistrySearchResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the title and upload button', () => {
    render(<AssessmentsRegistrySearchResults />);
    expect(
      screen.getByText('commons.routes.ASSESSMENT_REGISTRY_SEARCH_RESULTS')
    ).toBeDefined();
    expect(
      screen.getByText('assessmentsRegistrySearchResults.uploadFlow')
    ).toBeDefined();
  });

  it('renders the search results grid', () => {
    render(<AssessmentsRegistrySearchResults />);
    expect(screen.getByTestId('search-results-grid')).toBeDefined();
  });

  it('shows filter button with selected filters count', () => {
    render(<AssessmentsRegistrySearchResults />);
    expect(screen.getByTestId('open-drawer')).toHaveTextContent(
      'commons.filters.filtersField (1)'
    );
  });

  it('opens and closes the filter drawer', () => {
    render(<AssessmentsRegistrySearchResults />);
    const openBtn = screen.getByTestId('open-drawer');
    expect(screen.getByTestId('drawer')).toHaveStyle('visibility: hidden');
    fireEvent.click(openBtn);
    expect(screen.getByTestId('drawer')).toHaveStyle('visibility: visible');
    fireEvent.click(screen.getByTestId('close-drawer'));
    expect(screen.getByTestId('drawer')).toHaveStyle('visibility: hidden');
  });

  it('calls applyFilters when filter button is clicked', () => {
    render(<AssessmentsRegistrySearchResults />);
    fireEvent.click(screen.getByTestId('open-drawer'));
    fireEvent.click(screen.getByTestId('multifilter-drawer-search-btn'));
    expect(applyFiltersMock).toHaveBeenCalled();
  });

  it('calls removeAllFilters when remove button is clicked', () => {
    render(<AssessmentsRegistrySearchResults />);
    fireEvent.click(screen.getByTestId('open-drawer'));
    fireEvent.click(screen.getByTestId('multifilter-drawer-remove-btn'));
    expect(removeAllFiltersMock).toHaveBeenCalled();
  });
});
