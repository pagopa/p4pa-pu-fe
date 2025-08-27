import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent
} from '../../../__tests__/renderers';
import { MyOrg } from './MyOrg';
import { useNavigate, generatePath } from 'react-router';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';

// Mock react-router's useNavigate and generatePath
vi.mock('react-router', async (importActual) => ({
  ...(await importActual()),
  useNavigate: vi.fn(),
  generatePath: vi.fn()
}));

// Mock your store hook
vi.mock('../../../store/GlobalStore', () => ({
  useStore: () => ({
    state: { organizationId: 3 }
  }),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

// Mock useSearch hook fully
vi.mock('../../../hooks/useSearch', () => ({
  useSearch: vi.fn()
}));

import { useSearch } from '../../../hooks/useSearch';

describe('MyOrg', () => {
  const mockNavigate = vi.fn();
  const mockGeneratePath = generatePath as unknown as ReturnType<typeof vi.fn>;
  const mockMutateAsync = vi.fn();
  const mockApplyFilters = vi.fn();

  beforeEach(() => {
    i18nTestSetup({
      'debtTypesCreated.myOrganizationDataGrid.code': 'Code',
      'debtTypesCreated.myOrganizationDataGrid.description': 'Description',
      'debtTypesCreated.myOrganizationDataGrid.lastUpdateDate': 'Last Update',
      'debtTypesCreated.myOrganizationDataGrid.enabledOperators':
        'Enabled Operators',
      'commons.status.ACTIVE': 'Active',
      'commons.status.DISABLED': 'Disabled',
      'commons.state': 'State',
      'commons.searchForCode': 'Search for code',
      'commons.searchForDescription': 'Search for description',
      'commons.search': 'Search'
    });

    vi.resetAllMocks();

    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockNavigate
    );
    mockGeneratePath.mockReturnValue('/mock-path');

    // Setup useSearch mock to return expected structure used by MyOrg
    (useSearch as unknown as Mock).mockReturnValue({
      query: {
        mutateAsync: mockMutateAsync,
        data: {
          content: [
            {
              debtPositionTypeOrgId: 1,
              code: 'CODE1',
              description: 'Description 1',
              updateDate: '2023-01-01T12:00:00Z',
              flagActive: true,
              enabledOperators: 3
            },
            {
              debtPositionTypeOrgId: 2,
              code: 'CODE2',
              description: 'Description 2',
              updateDate: '2023-02-01T12:00:00Z',
              flagActive: false,
              enabledOperators: 5
            }
          ],
          totalPages: 1
        }
      },
      applyFilters: mockApplyFilters
    });
  });

  it('should render data grid with correct columns', async () => {
    render(<MyOrg />);
    await waitFor(() => {
      expect(screen.getByText('Code')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Last Update')).toBeInTheDocument();
      expect(screen.getByText('Enabled Operators')).toBeInTheDocument();
      expect(screen.getAllByText('State').length).toBeGreaterThan(0);
    });
  });

  it('should render data rows correctly', async () => {
    render(<MyOrg />);
    await waitFor(() => {
      expect(screen.getByText('CODE1')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('CODE2')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });
  });

  it('should apply filters on search button click', async () => {
    render(<MyOrg />);
    const searchBtn = screen.getByRole('button', { name: 'Search' });

    act(() => {
      searchBtn.click();
    });

    await waitFor(() => {
      expect(mockApplyFilters).toHaveBeenCalled();
    });
  });

  it('navigates to detail page when row action is clicked', async () => {
    render(<MyOrg />);
    await waitFor(() => screen.getByText('CODE1'));

    // Assuming you added data-testid to the icon as suggested earlier
    const icon = screen.getByTestId('navigate-icon-1');

    fireEvent.click(icon);

    expect(mockNavigate).toHaveBeenCalledWith('/mock-path');
    expect(mockGeneratePath).toHaveBeenCalledWith(expect.any(String), {
      debtPositionTypeOrgId: 1
    });
  });
});
