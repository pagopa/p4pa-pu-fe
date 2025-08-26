import { describe, expect, it, Mock, vi } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { useLocation } from 'react-router';
import TelematicReceiptSearchResults from '../../routes/TelematicReceiptSearchResults';
import FilterContainer from '../../components/FilterContainer/FilterContainer';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
}));

vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn(() => ({
    state: { organizationId: 123 }
  })),
  StoreProvider: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('../../api/receipts', () => ({
  getReceipts: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    data: null,
    isLoading: false,
    isPending: false,
    error: null
  }))
}));

vi.mock('../../hooks/useSearch', () => ({
  useSearch: vi.fn(() => ({
    filters: {},
    query: {
      data: null,
      isLoading: false,
      isPending: false,
      error: null
    },
    applyFilters: vi.fn(),
    setSort: vi.fn(),
    handlePaginationChange: vi.fn()
  }))
}));

vi.mock('../../hooks/useTelematicReceiptsFilters', () => ({
  default: vi.fn(() => ({
    filters: []
  }))
}));

vi.mock('../../components/TitleComponent/TitleComponent', () => ({
  default: vi.fn(({ title }) => <div>{title}</div>)
}));

vi.mock(
  '../../components/FilterContainer/FilterContainer',
  async (importOriginal) => ({
    ...(await importOriginal()),
    default: vi.fn(() => <div>FilterContainer</div>)
  })
);

vi.mock('./SearchResultsDataGrid', () => ({
  default: () => <div data-testid="search-results-grid" />
}));

describe('TelematicReceiptSearchResults', () => {
  it('should render correctly', () => {
    (useLocation as Mock).mockReturnValue({ state: { filters: {} } });

    render(<TelematicReceiptSearchResults />);

    expect(
      screen.getByText('commons.routes.TELEMATIC_RECEIPT_SEARCH_RESULTS')
    ).toBeInTheDocument();

    expect(screen.getByTestId('search-results-grid')).toBeInTheDocument();
  });

  it('should pass correct props to FilterContainer', () => {
    (useLocation as Mock).mockReturnValue({ state: { filters: {} } });

    render(<TelematicReceiptSearchResults />);

    expect(FilterContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.any(Array),
        values: expect.any(Object),
        onChange: expect.any(Function)
      }),
      expect.anything()
    );
  });
});
