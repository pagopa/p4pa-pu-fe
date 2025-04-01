import { describe, expect, it, Mock, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { DebtTypes } from './DebtTypes';
import { useSearchParams } from 'react-router-dom';
import { getDebtPositionTypeWithCount } from '../../api/debtPositionsTypes';
import useDebtTypesFilters from '../../hooks/useDebtTypesFilters';
import * as TitleComponentModule from '../TitleComponent/TitleComponent';
import * as FilterContainerModule from '../FilterContainer/FilterContainer';
import * as DebtTypesDataGridModule from './DebtTypesDataGrid';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { render } from '../../__tests__/renderers';
import { STATE } from '../../store/types';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
}));

vi.mock('../../store/GlobalStore', () => ({
  useStore: () => ({
    state: {
      [STATE.ORGANIZATION_ID]: 123,
      APP_STATE: { loading: false, customBreadcrumbsItems: [] }
    },
    setState: vi.fn()
  }),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

vi.mock('../../api/debtPositionsTypes', () => ({
  getDebtPositionTypeWithCount: vi.fn().mockImplementation(() => ({
    data: null,
    isLoading: false
  }))
}));

vi.mock('../../hooks/useDebtTypesFilters', () => ({
  default: vi.fn()
}));

vi.mock('../TitleComponent/TitleComponent', () => ({
  default: vi.fn().mockImplementation((props) => {
    return <div data-testid="title-component">{props.title}</div>;
  })
}));

vi.mock('../FilterContainer/FilterContainer', () => ({
  default: vi.fn().mockImplementation(() => {
    return <div data-testid="filter-container">Filter Container Mock</div>;
  }),
  COMPONENT_TYPE: {
    textField: 'textField',
    button: 'button'
  }
}));

vi.mock('./DebtTypesDataGrid', () => ({
  default: vi.fn().mockImplementation(() => {
    return <div data-testid="debt-types-data-grid">Data Grid Mock</div>;
  })
}));

describe('DebtTypes', () => {
  const mockFilters = {
    appliedFilters: {
      page: 0,
      size: 10,
      sort: undefined
    },
    draftFilters: {
      page: 0,
      size: 10
    },
    updateDraftFilters: vi.fn(),
    applyFilters: vi.fn(),
    updatePagination: vi.fn(),
    handleSortModelChange: vi.fn(),
    sortModel: [],
    isSearchEnabled: false
  };

  const mockData = {
    content: [
      {
        debtPositionTypeId: 1,
        description: 'Tipo A',
        updateDate: '2023-01-15',
        activeOrganizations: 5
      },
      {
        debtPositionTypeId: 2,
        description: 'Tipo B',
        updateDate: '2023-02-20',
        activeOrganizations: 3
      }
    ],
    totalElements: 2,
    totalPages: 1,
    number: 0,
    size: 10
  };

  const mockTranslations = {
    commons: {
      routes: {
        DEBT_TYPES_CATALOG: 'Catalogo Tipi di Debito'
      },
      createNew: 'Crea Nuovo',
      search: 'Cerca'
    },
    debtTypes: {
      description: 'Gestisci i tuoi tipi di debito',
      searchDescription: 'Cerca per descrizione'
    },
    flowDataGrid: {
      noDataRows: 'Nessun dato disponibile'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    i18nTestSetup(mockTranslations);

    vi.spyOn(TitleComponentModule, 'default');
    vi.spyOn(FilterContainerModule, 'default');
    vi.spyOn(DebtTypesDataGridModule, 'default');

    (useSearchParams as Mock).mockReturnValue([new URLSearchParams(), vi.fn()]);

    (useDebtTypesFilters as Mock).mockReturnValue(mockFilters);

    (getDebtPositionTypeWithCount as Mock).mockReturnValue({
      data: mockData,
      isLoading: false
    });
  });

  it('should correctly render DebtTypes component', () => {
    render(<DebtTypes />);

    expect(screen.getByTestId('title-component')).toBeInTheDocument();
    expect(screen.getByTestId('filter-container')).toBeInTheDocument();
    expect(screen.getByTestId('debt-types-data-grid')).toBeInTheDocument();
  });

  it('should call getDebtPositionTypeWithCount with correct parameters', () => {
    render(<DebtTypes />);

    expect(getDebtPositionTypeWithCount).toHaveBeenCalledWith(123, {
      page: 0,
      size: 10,
      sort: undefined
    });
  });

  it('should pass props to TitleComponent', () => {
    render(<DebtTypes />);

    expect(TitleComponentModule.default).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Catalogo Tipi di Debito',
        description: 'Gestisci i tuoi tipi di debito',
        callToAction: [
          expect.objectContaining({
            buttonText: 'Crea Nuovo'
          })
        ]
      }),
      expect.anything()
    );
  });

  it('should pass props to FilterContainer', () => {
    render(<DebtTypes />);

    expect(FilterContainerModule.default).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            label: 'Cerca per descrizione',
            type: 'textField'
          }),
          expect.objectContaining({
            label: 'Cerca',
            type: 'button',
            disabled: expect.any(Boolean)
          })
        ]
      }),
      expect.anything()
    );
  });

  it('should pass props to DebtTypesDataGrid', () => {
    render(<DebtTypes />);

    expect(DebtTypesDataGridModule.default).toHaveBeenCalledWith(
      expect.objectContaining({
        data: mockData,
        sortModel: [],
        isLoading: false,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          size: 10
        }
      }),
      expect.anything()
    );
  });

  it('should handle date null', () => {
    (getDebtPositionTypeWithCount as Mock).mockReturnValue({
      data: null,
      isLoading: false
    });

    render(<DebtTypes />);

    expect(DebtTypesDataGridModule.default).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          content: [],
          size: 0,
          totalElements: 0,
          totalPages: 0,
          number: 0
        }
      }),
      expect.anything()
    );
  });

  it('should put pagination params in URL', () => {
    (useSearchParams as Mock).mockReturnValue([
      new URLSearchParams('page=3&size=20'),
      vi.fn()
    ]);

    render(<DebtTypes />);

    expect(useDebtTypesFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        initialFilters: {
          page: 2,
          size: 20
        }
      })
    );
  });

  it('should apply description filters if present', () => {
    (useDebtTypesFilters as Mock).mockReturnValue({
      ...mockFilters,
      appliedFilters: {
        ...mockFilters.appliedFilters,
        description: 'test'
      }
    });

    render(<DebtTypes />);

    expect(getDebtPositionTypeWithCount).toHaveBeenCalledWith(
      123,
      expect.objectContaining({
        description: 'test',
        page: 0,
        size: 10,
        sort: undefined
      })
    );
  });

  it('should handle loading state', () => {
    (getDebtPositionTypeWithCount as Mock).mockReturnValue({
      data: mockData,
      isLoading: true
    });

    render(<DebtTypes />);

    expect(DebtTypesDataGridModule.default).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true
      }),
      expect.anything()
    );
  });

  it('should update URL params on filters change', () => {
    const setSearchParamsMock = vi.fn();
    (useSearchParams as Mock).mockReturnValue([
      new URLSearchParams(),
      setSearchParamsMock
    ]);

    render(<DebtTypes />);

    const onFiltersChange =
      vi.mocked(useDebtTypesFilters).mock.calls[0][0].onFiltersChange;

    expect(onFiltersChange).toBeDefined();

    if (onFiltersChange) {
      onFiltersChange({ page: 2, size: 15 });

      expect(setSearchParamsMock).toHaveBeenCalledWith(
        expect.any(URLSearchParams),
        { replace: true }
      );

      const params = setSearchParamsMock.mock.calls[0][0];
      expect(params.get('page')).toBe('3');
      expect(params.get('size')).toBe('15');
    }
  });
});
