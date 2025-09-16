import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within
} from '../../../__tests__/renderers';
import { MyOrganization } from './MyOrganization';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';

vi.mock('react-router', async () => {
  const actual = (await vi.importActual('react-router')) as Record<
    string,
    unknown
  >;
  return {
    ...actual,
    useParams: vi.fn(() => ({
      organizationId: undefined
    }))
  };
});

vi.mock('../../../store/GlobalStore', () => ({
  useStore: () => ({
    state: {
      organizationId: 123
    }
  }),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

vi.mock('../../../api/organizationOperators/organizationOperators', () => ({
  useOrganizationOperatorsSearch: vi.fn()
}));

vi.mock('../../../hooks/useSearch', () => ({
  useSearch: vi.fn()
}));

import { useOrganizationOperatorsSearch } from '../../../api/organizationOperators/organizationOperators';
import { useSearch } from '../../../hooks/useSearch';

describe('MyOrganization', () => {
  const mockMutateAsync = vi.fn();
  const mockApplyFilters = vi.fn();

  beforeEach(() => {
    i18nTestSetup({
      'operatorsList.myOrganizationDataGrid.id': 'ID',
      'operatorsList.myOrganizationDataGrid.nameAndLastName': 'Name',
      'operatorsList.myOrganizationDataGrid.fiscalCode': 'Fiscal Code',
      'operatorsList.myOrganizationDataGrid.enabledDebtTypes':
        'Enabled Debt Types',
      'operatorsList.searchByName': 'Search by Name',
      'operatorsList.searchByLastName': 'Search by Last Name',
      'operatorsList.searchByFiscalCode': 'Search by Fiscal Code',
      'commons.search': 'Search'
    });

    vi.clearAllMocks();

    (useOrganizationOperatorsSearch as unknown as Mock).mockReturnValue({
      mutate: mockMutateAsync
    });

    (useSearch as unknown as Mock).mockReturnValue({
      query: {
        mutateAsync: mockMutateAsync,
        data: {
          content: [
            {
              mappedExternalUserId: '100',
              firstName: 'Carla',
              lastName: 'Danti',
              fiscalCode: 'DNTCRL65S67M126L',
              debtPositionTypeOrgCount: 1400
            },
            {
              mappedExternalUserId: '1000',
              firstName: 'Mario',
              lastName: 'Rossi',
              fiscalCode: 'RSSMRA80A01H501X',
              debtPositionTypeOrgCount: 25
            }
          ],
          totalPages: 1
        }
      },
      applyFilters: mockApplyFilters
    });
  });

  it('renders data grid with correct columns', async () => {
    render(<MyOrganization />);
    await waitFor(() => {
      expect(
        screen.getByRole('columnheader', { name: /ID/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: /Name/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: /Fiscal Code/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: /Enabled Debt Types/i })
      ).toBeInTheDocument();
    });
  });

  it('renders data rows correctly', async () => {
    render(<MyOrganization />);
    await waitFor(() => {
      const grid = screen.getByRole('grid');
      expect(within(grid).getAllByText('100').length).toBeGreaterThan(0);
      expect(within(grid).getAllByText('Carla Danti').length).toBeGreaterThan(
        0
      );
      expect(
        within(grid).getAllByText('DNTCRL65S67M126L').length
      ).toBeGreaterThan(0);
      expect(within(grid).getAllByText('1400').length).toBeGreaterThan(0);
      expect(within(grid).getAllByText('1000').length).toBeGreaterThan(0);
      expect(within(grid).getAllByText('Mario Rossi').length).toBeGreaterThan(
        0
      );
      expect(
        within(grid).getAllByText('RSSMRA80A01H501X').length
      ).toBeGreaterThan(0);
      expect(within(grid).getAllByText('25').length).toBeGreaterThan(0);
    });
  });

  it('renders search filters with correct labels', async () => {
    render(<MyOrganization />);
    expect(screen.getByLabelText('Search by Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Search by Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Search by Fiscal Code')).toBeInTheDocument();
  });

  it('calls applyFilters when search button clicked', async () => {
    render(<MyOrganization />);
    const searchBtn = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchBtn);
    expect(mockApplyFilters).toHaveBeenCalled();
  });

  it('handles row click and logs operator id', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn());
    render(<MyOrganization />);

    await waitFor(() => {
      const grid = screen.getByRole('grid');
      const arrowButtons = within(grid).getAllByTestId('ArrowForwardIosIcon');
      expect(arrowButtons.length).toBeGreaterThan(0);
    });

    const grid = screen.getByRole('grid');
    const arrowButtons = within(grid).getAllByTestId('ArrowForwardIosIcon');
    fireEvent.click(arrowButtons[0]);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Navigate to operator detail:',
      '100'
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

    render(<MyOrganization />);
    await waitFor(() => {
      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
      // Check that no data rows are present
      expect(within(grid).queryByText('Carla Danti')).not.toBeInTheDocument();
    });
  });

  it('handles filter input changes correctly', async () => {
    render(<MyOrganization />);

    const nameInput = screen.getByLabelText('Search by Name');
    const lastNameInput = screen.getByLabelText('Search by Last Name');
    const fiscalCodeInput = screen.getByLabelText('Search by Fiscal Code');

    fireEvent.change(nameInput, { target: { value: 'Mario' } });
    fireEvent.change(lastNameInput, { target: { value: 'Rossi' } });
    fireEvent.change(fiscalCodeInput, {
      target: { value: 'RSSMRA80A01H501X' }
    });

    expect(nameInput).toHaveValue('Mario');
    expect(lastNameInput).toHaveValue('Rossi');
    expect(fiscalCodeInput).toHaveValue('RSSMRA80A01H501X');
  });

  it('maps data correctly from API response', async () => {
    render(<MyOrganization />);

    await waitFor(() => {
      const grid = screen.getByRole('grid');
      expect(within(grid).getAllByText('100').length).toBeGreaterThan(0);
      expect(within(grid).getAllByText('Carla Danti').length).toBeGreaterThan(
        0
      );
      expect(within(grid).getAllByText('1400').length).toBeGreaterThan(0);
    });
  });

  it('handles missing data gracefully', async () => {
    (useSearch as unknown as Mock).mockReturnValue({
      query: {
        mutateAsync: mockMutateAsync,
        data: {
          content: [
            {
              mappedExternalUserId: '999',
              firstName: undefined,
              lastName: undefined,
              fiscalCode: undefined,
              debtPositionTypeOrgCount: undefined
            }
          ],
          totalPages: 1
        }
      },
      applyFilters: mockApplyFilters
    });

    render(<MyOrganization />);
    await waitFor(() => {
      const grid = screen.getByRole('grid');
      expect(within(grid).getAllByText('999').length).toBeGreaterThan(0);
      expect(within(grid).getAllByText('-').length).toBeGreaterThan(0);
    });
  });
});
