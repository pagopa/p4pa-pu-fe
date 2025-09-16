import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within
} from '../../../__tests__/renderers';
import { AllOrganizations } from './AllOrganizations';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';

vi.mock('react-router', async () => {
  const actual = (await vi.importActual('react-router')) as Record<
    string,
    unknown
  >;
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    generatePath: vi.fn(() => '/mock-path'),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
  };
});

vi.mock('../../../store/GlobalStore', () => ({
  useStore: () => ({
    state: {
      organizationId: 3
    }
  }),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

vi.mock('../../../api/organizationOperators/organizationOperators', () => ({
  useBrokerOrganizationsSearch: vi.fn()
}));

vi.mock('../../../hooks/useSearch', () => ({
  useSearch: vi.fn()
}));

import { useBrokerOrganizationsSearch } from '../../../api/organizationOperators';
import { useSearch } from '../../../hooks/useSearch';

describe('AllOrganizations', () => {
  const mockMutateAsync = vi.fn();
  const mockApplyFilters = vi.fn();

  beforeEach(() => {
    i18nTestSetup({
      'debtTypesCreated.managedOrganizationsDataGrid.IPACode': 'IPA Code',
      'debtTypesCreated.managedOrganizationsDataGrid.managedOrg':
        'Organization',
      'operatorsList.allOrganizationsDataGrid.operators': 'Operators',
      'operatorsList.searchByIPACode': 'Search by IPA Code',
      'commons.search': 'Search'
    });

    vi.clearAllMocks();

    // Mock API hook to return mutate function and data
    (useBrokerOrganizationsSearch as unknown as Mock).mockReturnValue({
      mutate: mockMutateAsync,
      data: {
        content: [
          {
            organizationId: 1,
            ipaCode: 'IPA001',
            orgName: 'Azienda ULSS n.7 PEDEMONTANA',
            operatorsCount: 50
          },
          {
            organizationId: 2,
            ipaCode: 'IPA002',
            orgName: 'Città metropolitana di Venezia',
            operatorsCount: 100
          }
        ],
        totalPages: 1
      }
    });

    // Mock useSearch to provide query object with mutateAsync and applyFilters
    (useSearch as unknown as Mock).mockReturnValue({
      query: {
        mutateAsync: mockMutateAsync,
        data: {
          content: [
            {
              organizationId: 1,
              ipaCode: 'IPA001',
              orgName: 'Azienda ULSS n.7 PEDEMONTANA',
              operatorsCount: 50
            },
            {
              organizationId: 2,
              ipaCode: 'IPA002',
              orgName: 'Città metropolitana di Venezia',
              operatorsCount: 100
            }
          ],
          totalPages: 1
        }
      },
      applyFilters: mockApplyFilters
    });
  });

  it('renders data grid with correct columns', async () => {
    render(<AllOrganizations />);
    await waitFor(() => {
      expect(
        screen.getByRole('columnheader', { name: /IPA Code/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: /Organization/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: /Operators/i })
      ).toBeInTheDocument();
    });
  });

  it('renders data rows correctly', async () => {
    render(<AllOrganizations />);
    await waitFor(() => {
      const grid = screen.getByRole('grid');
      expect(within(grid).getAllByText('IPA001').length).toBeGreaterThan(0);
      expect(
        within(grid).getAllByText('Azienda ULSS n.7 PEDEMONTANA').length
      ).toBeGreaterThan(0);
      expect(within(grid).getAllByText('50').length).toBeGreaterThan(0);
      expect(within(grid).getAllByText('IPA002').length).toBeGreaterThan(0);
      expect(
        within(grid).getAllByText('Città metropolitana di Venezia').length
      ).toBeGreaterThan(0);
      expect(within(grid).getAllByText('100').length).toBeGreaterThan(0);
    });
  });

  it('renders search filter with correct label', async () => {
    render(<AllOrganizations />);
    expect(screen.getByLabelText('Search by IPA Code')).toBeInTheDocument();
  });

  it('calls applyFilters when search button clicked', async () => {
    render(<AllOrganizations />);
    const searchBtn = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchBtn);
    expect(mockApplyFilters).toHaveBeenCalled();
  });

  it('handles row click and logs organization id', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn());
    render(<AllOrganizations />);

    await waitFor(() => {
      const grid = screen.getByRole('grid');
      const arrowButtons = within(grid).getAllByTestId('ArrowForwardIosIcon');
      expect(arrowButtons.length).toBeGreaterThan(0);
    });

    const grid = screen.getByRole('grid');
    const arrowButtons = within(grid).getAllByTestId('ArrowForwardIosIcon');
    fireEvent.click(arrowButtons[0]);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Navigate to operators for organization:',
      1
    );

    consoleSpy.mockRestore();
  });

  it('displays empty state when no data available', async () => {
    // Mock empty data response
    (useSearch as unknown as Mock).mockReturnValue({
      query: {
        mutateAsync: mockMutateAsync,
        data: {
          content: [],
          totalPages: 1
        }
      },
      applyFilters: mockApplyFilters
    });

    render(<AllOrganizations />);
    await waitFor(() => {
      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
      // Check that no data rows are present
      expect(within(grid).queryByText('IPA001')).not.toBeInTheDocument();
    });
  });

  it('handles filter input changes correctly', async () => {
    render(<AllOrganizations />);

    const ipaCodeInput = screen.getByLabelText('Search by IPA Code');
    fireEvent.change(ipaCodeInput, { target: { value: 'IPA123' } });

    expect(ipaCodeInput).toHaveValue('IPA123');
  });
});
