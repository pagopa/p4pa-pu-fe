import { render, screen, fireEvent } from '../../__tests__/renderers';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import TreasurySearchResults from './TreasurySearchResults';

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  useNavigate: vi.fn(),
  generatePath: vi.fn((path: string) => path)
}));

vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn(() => ({
    state: { organizationId: 123 }
  })),
  StoreProvider: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('../../api/treasuries', () => ({
  getTreasuries: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    data: null,
    isLoading: false,
    isPending: false,
    error: null
  }))
}));

vi.mock('../../hooks/useMultiFilters', () => ({
  useMultiFilters: vi.fn(() => ({
    filterMap: {},
    selectedFilters: [],
    removeAllFilters: vi.fn(),
    noFilterIsSelected: { peek: vi.fn(() => true) },
    filterValues: {}
  })),
  FilterCategory: {
    TREASURY: 'TREASURY'
  }
}));

vi.mock('../Drawer/CustomDrawer', () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div
      data-testid="custom-drawer"
      style={{ display: open ? 'block' : 'none' }}
    >
      Drawer Content
      <button onClick={onClose} data-testid="close-drawer">
        Close
      </button>
    </div>
  )
}));

vi.mock('./SearchResultsDataGrid', () => ({
  default: () => <div data-testid="search-results-grid" />
}));

vi.mock('../Drawer/FilterDrawer', () => ({
  FilterDrawer: ({ open }: { open: boolean }) => (
    <div
      data-testid="drawer"
      style={{ visibility: open ? 'visible' : 'hidden' }}
    >
      Filter Drawer
    </div>
  )
}));

describe('TreasurySearchResults Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with title and description', () => {
    render(<TreasurySearchResults />);
    expect(screen.getByText('commons.routes.TREASURY')).toBeDefined();
    expect(screen.getByText('treasurySearchResults.description')).toBeDefined();
  });

  it('renders the search results table', () => {
    render(<TreasurySearchResults />);
    expect(screen.getByTestId('search-results-grid')).toBeDefined();
  });

  it('opens and closes the drawer when clicking the filter button', () => {
    render(<TreasurySearchResults />);

    const filterButton = screen.getByTestId('open-drawer');
    expect(filterButton).toBeDefined();

    expect(screen.getByTestId('drawer')).toHaveStyle('visibility: hidden');

    fireEvent.click(filterButton);
    expect(screen.getByTestId('drawer')).toHaveStyle('visibility: visible');
  });
});
