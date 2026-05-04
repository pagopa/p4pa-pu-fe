/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '../../__tests__/renderers';
import { useNavigate } from 'react-router';
import { getDebtPositionTypeWithCount } from '../../api/debtPositionsTypes';
import DebtTypes from './DebtTypes';
import { PageRoutes } from '../../routes';

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

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
    Link: ({ children }: { children: React.ReactNode }) => children,
    generatePath: vi.fn().mockReturnValue('/mock-path')
  };
});

vi.mock('../../store/GlobalStore', () => ({
  useStore: () => ({
    state: {
      organizationId: 3,
      APP_STATE: { loading: false, customBreadcrumbsItems: [] }
    },
    setState: vi.fn()
  }),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockMutateAsync = vi.fn((_args: any) =>
  Promise.resolve({ data: mockData })
);

vi.mock('../../hooks/useSearch', () => ({
  useSearch: vi.fn(() => ({
    query: {
      mutateAsync: mockMutateAsync,
      isLoading: false,
      data: mockData
    },
    applyFilters: (filters: any) =>
      mockMutateAsync({ filters, pagination: { page: 0, size: 10 }, sort: [] })
  }))
}));

describe('DebtTypes Page', () => {
  const navigateMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (
      getDebtPositionTypeWithCount as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: mockData,
      isLoading: false
    });

    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(navigateMock);

    mockMutateAsync.mockClear();
  });

  it('renders page with translation keys as text and shows initial data', () => {
    render(<DebtTypes />);

    expect(
      screen.getByText('commons.routes.DEBT_TYPES_CATALOG')
    ).toBeInTheDocument();
    expect(screen.getByText('debtTypes.description')).toBeInTheDocument();
    expect(screen.getByText('commons.createNewOne')).toBeInTheDocument();

    expect(
      screen.getByRole('textbox', { name: 'commons.searchForDescription' })
    ).toBeInTheDocument();

    expect(screen.getByText('commons.search')).toBeInTheDocument();

    expect(screen.getByText('Type A')).toBeInTheDocument();
    expect(screen.getByText('Type B')).toBeInTheDocument();
  });

  it('calls applyFilters and triggers mutateAsync when Search button is clicked', async () => {
    render(<DebtTypes />);

    const searchInput = screen.getByRole('textbox', {
      name: 'commons.searchForDescription'
    });
    fireEvent.change(searchInput, { target: { value: 'Type A' } });

    const searchButton = screen.getByText('commons.search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({ description: 'Type A' }),
          pagination: expect.any(Object),
          sort: expect.any(Array)
        })
      );
    });
  });

  it('navigates to creation page when Create New button is clicked', () => {
    render(<DebtTypes />);

    const createButton = screen.getByText('commons.createNewOne');
    fireEvent.click(createButton);

    expect(navigateMock).toHaveBeenCalledWith(
      PageRoutes.DEBT_TYPE_CATALOG_CREATE
    );
  });
});
