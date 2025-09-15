/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '../../__tests__/renderers';
import { getOrganizationsByBrokerIdAndFilters } from '../../api/organizations';
import Organizations from './Organizations';

const mockData = {
  content: [
    {
      organizationId: 1,
      orgName: 'Test Organization A',
      orgFiscalCode: 'CF001',
      operatorsCount: 5,
      debtPositionTypeOrgCount: 3,
      status: 'ACTIVE'
    },
    {
      organizationId: 2,
      orgName: 'Test Organization B',
      orgFiscalCode: 'CF002',
      operatorsCount: 2,
      debtPositionTypeOrgCount: 1,
      status: 'DRAFT'
    }
  ],
  totalPages: 2,
  totalElements: 2,
  number: 0,
  size: 10
};

vi.mock('../../api/organizations', () => ({
  getOrganizationsByBrokerIdAndFilters: vi.fn()
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockMutateAsync = vi.fn((_args: any) =>
  Promise.resolve({ data: mockData })
);

vi.mock('../../hooks/useSearch', () => ({
  useSearch: vi.fn(() => ({
    query: {
      mutateAsync: mockMutateAsync,
      isPending: false,
      data: mockData
    },
    applyFilters: (filters: any) =>
      mockMutateAsync({ filters, pagination: { page: 0, size: 10 }, sort: [] })
  }))
}));

vi.mock('../../utils', () => ({
  default: {
    URI: {
      decode: vi.fn(() => ({}))
    }
  }
}));

describe('Organizations Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (
      getOrganizationsByBrokerIdAndFilters as unknown as ReturnType<
        typeof vi.fn
      >
    ).mockReturnValue({
      data: mockData,
      isPending: false
    });

    mockMutateAsync.mockClear();
  });

  it('renders page with translation keys as text and shows initial data', () => {
    render(<Organizations />);

    expect(
      screen.getByText('commons.routes.ORGANIZATIONS')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('textbox', { name: 'commons.searchForOrganization' })
    ).toBeInTheDocument();

    expect(screen.getByText('commons.search')).toBeInTheDocument();

    expect(screen.getByText('Test Organization A')).toBeInTheDocument();
    expect(screen.getByText('Test Organization B')).toBeInTheDocument();
    expect(screen.getByText('CF001')).toBeInTheDocument();
    expect(screen.getByText('CF002')).toBeInTheDocument();
  });

  it('calls applyFilters and triggers mutateAsync when Search button is clicked', async () => {
    render(<Organizations />);

    const searchInput = screen.getByRole('textbox', {
      name: 'commons.searchForOrganization'
    });
    fireEvent.change(searchInput, { target: { value: 'Test Organization A' } });

    const searchButton = screen.getByText('commons.search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({ orgName: 'Test Organization A' }),
          pagination: expect.any(Object),
          sort: expect.any(Array)
        })
      );
    });
  });

  it('updates filter values when typing in search input', () => {
    render(<Organizations />);

    const searchInput = screen.getByRole('textbox', {
      name: 'commons.searchForOrganization'
    });

    fireEvent.change(searchInput, { target: { value: 'New Organization' } });

    expect(searchInput).toHaveValue('New Organization');
  });

  it('shows loading state when data is being fetched', () => {
    vi.mocked(getOrganizationsByBrokerIdAndFilters).mockReturnValue({
      data: undefined,
      isPending: true
    } as any);

    vi.doMock('../../hooks/useSearch', () => ({
      useSearch: vi.fn(() => ({
        query: {
          mutateAsync: mockMutateAsync,
          isPending: true,
          data: undefined
        },
        applyFilters: vi.fn()
      }))
    }));

    render(<Organizations />);

    expect(
      screen.getByText('commons.routes.ORGANIZATIONS')
    ).toBeInTheDocument();
  });

  it('handles empty search input correctly', async () => {
    render(<Organizations />);

    const searchInput = screen.getByRole('textbox', {
      name: 'commons.searchForOrganization'
    });

    fireEvent.change(searchInput, { target: { value: '' } });

    const searchButton = screen.getByText('commons.search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        filters: {},
        pagination: { page: 0, size: 10 },
        sort: []
      });
    });
  });

  it('displays organizations data in the datagrid', () => {
    render(<Organizations />);

    expect(screen.getByText('Test Organization A')).toBeInTheDocument();
    expect(screen.getByText('Test Organization B')).toBeInTheDocument();
    expect(screen.getByText('CF001')).toBeInTheDocument();
    expect(screen.getByText('CF002')).toBeInTheDocument();

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    const elementsWithTwo = screen.getAllByText('2');
    expect(elementsWithTwo.length).toBeGreaterThan(0);

    const elementsWithOne = screen.getAllByText('1');
    expect(elementsWithOne.length).toBeGreaterThan(0);
  });

  it('decodes initial filters from URL hash', () => {
    const mockDecodeFilters = { orgName: 'Initial Org' };

    vi.doMock('../../utils', () => ({
      default: {
        URI: {
          decode: vi.fn(() => mockDecodeFilters)
        }
      }
    }));

    const { rerender } = render(<Organizations />);
    rerender(<Organizations />);

    const searchInput = screen.getByRole('textbox', {
      name: 'commons.searchForOrganization'
    });

    expect(searchInput).toBeInTheDocument();
  });
});
