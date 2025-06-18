import { render, screen, fireEvent } from '../../__tests__/renderers';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import ClassificationsSearchResults from './ClassificationsSearchResults';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn()
}));

vi.mock('./SearchResultsDataGrid', () => ({
  default: () => <div data-testid="search-results-grid" />
}));

vi.mock('../../hooks/useMultiFilters', () => ({
  useMultiFilters: () => ({
    filterMap: {},
    selectedFilters: [],
    removeAllFilters: vi.fn(),
    noFilterSelectedExcludingClassificationType: {
      peek: () => false
    },
    filterValues: {
      CLASSIFICATION_TYPE: 'UNKNOWN'
    }
  }),
  FilterCategory: {
    CLASSIFICATIONS: 'CLASSIFICATIONS'
  }
}));

vi.mock('../../hooks/useClassificationsSearch', () => ({
  default: () => ({
    query: { data: {} },
    setSort: vi.fn(),
    handlePaginationChange: vi.fn(),
    applyFilters: vi.fn()
  })
}));

vi.mock('../Drawer/FilterDrawer', () => ({
  FilterDrawer: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div
      data-testid="drawer"
      style={{ visibility: open ? 'visible' : 'hidden' }}
    >
      Drawer content
      <button onClick={onClose} data-testid="close-drawer">
        Close
      </button>
    </div>
  )
}));

describe('ClassificationsSearchResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and export button', () => {
    render(<ClassificationsSearchResults />);
    expect(
      screen.getByText('commons.routes.CLASSIFICATIONS_SEARCH_RESULTS')
    ).toBeDefined();
    expect(
      screen.getByText('exportFlow.buttonReservationExport')
    ).toBeDefined();
  });

  it('renders the search results grid', () => {
    render(<ClassificationsSearchResults />);
    expect(screen.getByTestId('search-results-grid')).toBeDefined();
  });

  it('opens and closes the filter drawer', () => {
    render(<ClassificationsSearchResults />);
    const openBtn = screen.getByTestId('open-drawer');

    expect(screen.getByTestId('drawer')).toHaveStyle('visibility: hidden');
    fireEvent.click(openBtn);
    expect(screen.getByTestId('drawer')).toHaveStyle('visibility: visible');
  });
});
