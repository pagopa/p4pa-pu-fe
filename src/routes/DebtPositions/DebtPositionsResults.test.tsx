import { describe, expect, it, Mock, vi } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { useLocation } from 'react-router-dom';
import FilterContainer from '../../components/FilterContainer/FilterContainer';
import { SearchType } from '../../models/DebtPositions';
import DebtPositionResults from './DebtPositionsResults';
import { DebtPositionsDataGrid } from './components/DebtPositionsDataGrid';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn()
}));

vi.mock('../../hooks/useDebtPositionsSearch', () => ({
  default: vi.fn(() => ({
    query: { data: { content: [], totalElements: 0 } },
    applyFilters: vi.fn(),
    handleFilterChange: vi.fn(),
    handlePageChange: vi.fn(),
    handlePageSizeChange: vi.fn(),
    setSort: vi.fn(),
    pagination: { page: 0, size: 10 },
    filterValues: {}
  }))
}));

vi.mock('../../hooks/useDebtPositionsFilters', () => ({
  default: vi.fn(() => ({
    filters: []
  }))
}));

vi.mock('../../components/TitleComponent/TitleComponent', () => ({
  default: vi.fn(({ title }) => <div>{title}</div>)
}));

vi.mock('../../components/FilterContainer/FilterContainer', () => ({
  default: vi.fn(() => <div>FilterContainer</div>)
}));

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

  it('should pass pagination to DataGrid', () => {
    (useLocation as Mock).mockReturnValue(
      mockLocationState(SearchType.DEBT_POSITION)
    );

    render(<DebtPositionResults />);

    expect(DebtPositionsDataGrid).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: expect.objectContaining({
          page: 0,
          size: 10
        })
      }),
      expect.anything()
    );
  });
});
