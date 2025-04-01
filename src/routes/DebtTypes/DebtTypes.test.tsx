import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '../../__tests__/renderers';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getDebtPositionTypeWithCount } from '../../api/debtPositionsTypes';
import DebtTypes from './DebtTypes';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';

i18nTestSetup({
  'commons.routes.DEBT_TYPES_CATALOG': 'Debt Types Catalog',
  'commons.createNew': 'Create New',
  'debtTypes.description': 'Manage your debt types',
  'debtTypes.searchDescription': 'Search by description',
  'commons.search': 'Search',
  'flowDataGrid.name': 'Name',
  'flowDataGrid.lastUpdate': 'Last Update',
  'flowDataGrid.authorizedOrganizations': 'Authorized Organizations',
  'flowDataGrid.noDataRows': 'No data available'
});

const mockData = {
  content: [
    {
      debtPositionTypeId: 1,
      description: 'Type A',
      updateDate: '2023-01-15',
      activeOrganizations: 5
    },
    {
      debtPositionTypeId: 2,
      description: 'Type B',
      updateDate: '2023-02-20',
      activeOrganizations: 3
    }
  ],
  totalPages: 2,
  totalElements: 2,
  number: 0,
  size: 10
};

vi.mock('../../api/debtPositionsTypes', () => ({
  getDebtPositionTypeWithCount: vi.fn()
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn().mockReturnValue(vi.fn()),
    useSearchParams: vi.fn().mockReturnValue([new URLSearchParams(), vi.fn()]),
    Link: ({ children }: { children: React.ReactNode }) => children,
    generatePath: vi.fn().mockReturnValue('/mock-path')
  };
});

vi.mock('../../store/GlobalStore', () => ({
  useStore: () => ({
    state: {
      ORGANIZATION_ID: 3,
      APP_STATE: { loading: false, customBreadcrumbsItems: [] }
    },
    setState: vi.fn()
  }),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

describe('DebtTypes Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (
      getDebtPositionTypeWithCount as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: mockData,
      isLoading: false
    });
  });

  it('renders DebtTypes without crashing', () => {
    render(<DebtTypes />);

    expect(screen.getByText('Debt Types Catalog')).toBeInTheDocument();
    expect(screen.getByText('Manage your debt types')).toBeInTheDocument();
    expect(screen.getByText('Create New')).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Search by description' })
    ).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();

    expect(screen.getByRole('grid')).toBeInTheDocument();

    expect(screen.getByText('Type A')).toBeInTheDocument();
    expect(screen.getByText('Type B')).toBeInTheDocument();
  });

  it('applies filters when search button is clicked', async () => {
    render(<DebtTypes />);

    const searchInput = screen.getByLabelText('Search by description');
    fireEvent.change(searchInput, { target: { value: 'Type A' } });

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(getDebtPositionTypeWithCount).toHaveBeenCalledWith(
        expect.any(Number),
        expect.objectContaining({ description: 'Type A' })
      );
    });
  });

  it('navigates to creation page when Create New button is clicked', () => {
    const navigateMock = vi.fn();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(navigateMock);

    render(<DebtTypes />);

    const createButton = screen.getByText('Create New');
    fireEvent.click(createButton);

    expect(navigateMock).toHaveBeenCalledWith('/debt-types/new');
  });

  it('handles pagination changes', async () => {
    render(<DebtTypes />);

    const nextPageButton = screen.getByLabelText('Go to next page');
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(getDebtPositionTypeWithCount).toHaveBeenCalledWith(
        expect.any(Number),
        expect.objectContaining({ page: 1 })
      );
    });
  });

  it('handles URL parameters for pagination', () => {
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      new URLSearchParams('page=2&size=20'),
      vi.fn()
    ]);

    render(<DebtTypes />);

    expect(getDebtPositionTypeWithCount).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({ page: 1, size: 20 })
    );
  });
});
