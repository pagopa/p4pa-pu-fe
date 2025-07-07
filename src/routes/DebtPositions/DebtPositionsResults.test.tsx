import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import * as ReactRouter from 'react-router';
import FilterContainer from '../../components/FilterContainer/FilterContainer';
import { SearchType } from '../../models/DebtPositions';
import DebtPositionResults from './DebtPositionsResults';
import { DebtPositionsDataGrid } from './components/DebtPositionsDataGrid';
import { PageRoutes } from '../../routes';
import * as useSearchModule from '../../hooks/useSearch';
import useDebtPositionFilters from '../../hooks/useDebtPositionsFilters';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

// Mock react-router hooks
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useLocation: vi.fn(),
  useNavigate: vi.fn()
}));

// Mock useSearch hook (named export)
vi.mock('../../hooks/useSearch');

// Mock useDebtPositionFilters (default export)
vi.mock('../../hooks/useDebtPositionsFilters');

// Mock FilterContainer with partial mock preserving named exports
vi.mock(
  '../../components/FilterContainer/FilterContainer',
  async (importOriginal) => {
    const originalModule =
      await importOriginal<
        typeof import('../../components/FilterContainer/FilterContainer')
      >();
    return {
      ...originalModule,
      default: vi.fn(() => <div>FilterContainer</div>)
    };
  }
);

// Mock DataGrid components
vi.mock('./components/DebtPositionIUVDataGrid', () => ({
  IUVDataGrid: vi.fn(() => <div>IUVDataGrid</div>)
}));

vi.mock('./components/DebtPositionsDataGrid', () => ({
  DebtPositionsDataGrid: vi.fn(() => <div>DebtPositionsDataGrid</div>)
}));

// Mock TitleComponent
vi.mock('../../components/TitleComponent/TitleComponent', () => ({
  default: vi.fn(({ title, callToAction }) => (
    <div>
      <div>{title}</div>
      {callToAction?.map(
        (
          action: { buttonText?: string; onActionClick: () => void },
          index: number
        ) => (
          <button
            key={index}
            onClick={action.onActionClick}
            data-testid="action-button"
          >
            {action.buttonText}
          </button>
        )
      )}
    </div>
  ))
}));

describe('DebtPositionResults', () => {
  const mockUseLocation = vi.mocked(ReactRouter.useLocation);
  const mockUseNavigate = vi.mocked(ReactRouter.useNavigate);
  const mockUseSearch = vi.mocked(useSearchModule.useSearch);
  const mockUseDebtPositionFilters = vi.mocked(useDebtPositionFilters);

  beforeEach(() => {
    vi.clearAllMocks();

    // Default useNavigate mock returns a jest.fn()
    mockUseNavigate.mockReturnValue(vi.fn());

    // Default useDebtPositionFilters mock returns empty filters and noop onFilter
    mockUseDebtPositionFilters.mockReturnValue({
      filters: []
    });

    // Default useSearch mock returns expected shape
    mockUseSearch.mockReturnValue({
      // @ts-expect-error mocking useQuery result
      query: { data: { content: [], totalElements: 0 } },
      applyFilters: vi.fn(),
      handleFilterChange: vi.fn(),
      handlePaginationChange: vi.fn(),
      setSort: vi.fn(),
      filters: {}
    });
  });

  const mockLocationState = (searchType: SearchType) => ({
    state: {
      searchType,
      filters: {}
    },
    pathname: searchType === SearchType.IUV ? '/results-IUV' : '/results'
  });

  it('renders IUV version correctly', () => {
    // @ts-expect-error mocking location state
    mockUseLocation.mockReturnValue(mockLocationState(SearchType.IUV));

    render(<DebtPositionResults />);

    expect(
      screen.getByText('DebtPositions.Results.titleIUV')
    ).toBeInTheDocument();
    expect(screen.getByText('IUVDataGrid')).toBeInTheDocument();
  });

  it('renders standard version correctly', () => {
    mockUseLocation.mockReturnValue(
      // @ts-expect-error mocking location state
      mockLocationState(SearchType.DEBT_POSITION)
    );

    render(<DebtPositionResults />);

    expect(screen.getByText('DebtPositions.Results.title')).toBeInTheDocument();
    expect(screen.getByText('DebtPositionsDataGrid')).toBeInTheDocument();
  });

  it('passes correct props to FilterContainer', () => {
    mockUseLocation.mockReturnValue(
      // @ts-expect-error mocking location state
      mockLocationState(SearchType.DEBT_POSITION)
    );

    render(<DebtPositionResults />);

    expect(FilterContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.any(Array),
        values: expect.any(Object),
        onChange: expect.any(Function)
      }),
      expect.anything()
    );
  });

  it('passes correct props to DataGrid', () => {
    mockUseLocation.mockReturnValue(
      // @ts-expect-error mocking location state
      mockLocationState(SearchType.DEBT_POSITION)
    );

    render(<DebtPositionResults />);

    expect(DebtPositionsDataGrid).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          content: expect.any(Array),
          totalElements: expect.any(Number)
        }),
        onSortChange: expect.any(Function),
        sortModel: expect.any(Array),
        onPaginationChange: expect.any(Function)
      }),
      expect.anything()
    );
  });

  it('navigates to create wizard when action button clicked', () => {
    const navigateMock = vi.fn();
    mockUseNavigate.mockReturnValue(navigateMock);
    mockUseLocation.mockReturnValue(
      // @ts-expect-error mocking location state
      mockLocationState(SearchType.DEBT_POSITION)
    );

    render(<DebtPositionResults />);

    const actionButton = screen.getByTestId('action-button');
    fireEvent.click(actionButton);

    expect(navigateMock).toHaveBeenCalledWith(
      PageRoutes.DEBT_POSITION_CREATE_WIZARD
    );
  });
});
