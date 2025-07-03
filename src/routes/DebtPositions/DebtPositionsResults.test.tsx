import { describe, expect, it, Mock, vi } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import { useLocation, useNavigate } from 'react-router';
import FilterContainer from '../../components/FilterContainer/FilterContainer';
import { SearchType } from '../../models/DebtPositions';
import DebtPositionResults from './DebtPositionsResults';
import { DebtPositionsDataGrid } from './components/DebtPositionsDataGrid';
import { PageRoutes } from '../../routes';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useLocation: vi.fn(),
  useNavigate: vi.fn(() => vi.fn()),
  Navigate: vi.fn(),
  generatePath: vi.fn((path) => path),
  createBrowserRouter: vi.fn()
}));

vi.mock('../../hooks/useDebtPositionsSearch', () => ({
  default: vi.fn(() => ({
    query: { data: { content: [], totalElements: 0 } },
    applyFilters: vi.fn(),
    handleFilterChange: vi.fn(),
    handlePageChange: vi.fn(),
    handlePageSizeChange: vi.fn(),
    handlePaginationChange: vi.fn(),
    setSort: vi.fn(),
    sortModel: [],
    handleSortModelChange: vi.fn(),
    pagination: { page: 0, size: 10 },
    filterValues: {}
  }))
}));

vi.mock('../../hooks/useDebtPositionsFilters', () => ({
  default: vi.fn(() => ({
    filters: []
  }))
}));

type ActionType = {
  buttonText?: string;
  onActionClick: () => void;
};

vi.mock('../../components/TitleComponent/TitleComponent', () => ({
  default: vi.fn(
    ({
      title,
      callToAction
    }: {
      title: string;
      callToAction?: Array<ActionType>;
    }) => (
      <div>
        <div>{title}</div>
        {callToAction?.map((action: ActionType, index: number) => (
          <button
            key={index}
            onClick={action.onActionClick}
            data-testid="action-button"
          >
            {action.buttonText}
          </button>
        ))}
      </div>
    )
  )
}));

vi.mock(
  '../../components/FilterContainer/FilterContainer',
  async (importOriginal) => ({
    ...(await importOriginal()),
    default: vi.fn(() => <div>FilterContainer</div>)
  })
);

vi.mock('./components/DebtPositionIUVDataGrid', () => ({
  IUVDataGrid: vi.fn(() => <div>IUVDataGrid</div>)
}));

vi.mock('./components/DebtPositionsDataGrid', () => ({
  DebtPositionsDataGrid: vi.fn(() => <div>DebtPositionsDataGrid</div>)
}));

describe('DebtPositionResults', () => {
  const mockLocationState = (searchType: SearchType) => ({
    state: {
      searchType,
      filters: {
        // Add mock filter values if needed for your tests
      }
    }
  });

  it('should render IUV version correctly', () => {
    (useLocation as Mock).mockReturnValue(mockLocationState(SearchType.IUV));

    render(<DebtPositionResults />);

    expect(
      screen.getByText('DebtPositions.Results.titleIUV')
    ).toBeInTheDocument();
    expect(screen.getByText('IUVDataGrid')).toBeInTheDocument();
  });

  it('should render standard version correctly', () => {
    (useLocation as Mock).mockReturnValue(
      mockLocationState(SearchType.DEBT_POSITION)
    );

    render(<DebtPositionResults />);

    expect(screen.getByText('DebtPositions.Results.title')).toBeInTheDocument();
    expect(screen.getByText('DebtPositionsDataGrid')).toBeInTheDocument();
  });

  it('should pass correct props to FilterContainer', () => {
    (useLocation as Mock).mockReturnValue(
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

  it('should pass correct props to DataGrid', () => {
    (useLocation as Mock).mockReturnValue(
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

  it('should navigate to create wizard when action button is clicked', () => {
    const navigateMock = vi.fn();
    (useLocation as Mock).mockReturnValue(
      mockLocationState(SearchType.DEBT_POSITION)
    );
    (useNavigate as Mock).mockReturnValue(navigateMock);

    render(<DebtPositionResults />);

    const actionButton = screen.getByTestId('action-button');
    fireEvent.click(actionButton);

    expect(navigateMock).toHaveBeenCalledWith(
      PageRoutes.DEBT_POSITION_CREATE_WIZARD
    );
  });
});
