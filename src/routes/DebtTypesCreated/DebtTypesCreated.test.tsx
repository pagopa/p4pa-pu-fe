import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../__tests__/renderers';
import DebtTypesCreated from './DebtTypesCreated';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import utils from '../../utils';
import { PageRoutes } from '..';

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();

vi.mock('react-router', async () => {
  const actual = (await vi.importActual('react-router')) as Record<
    string,
    unknown
  >;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
    generatePath: vi.fn(() => '/mock-path')
  };
});

describe('DebtTypesCreated component', () => {
  beforeEach(() => {
    i18nTestSetup({
      'commons.routes.DEBT_TYPES_DASHBOARD': 'Debt Types Created',
      'debtTypesCreated.callToAction': 'Create New Debt Type',
      'debtTypesCreated.description': 'Manage your debt types',
      'debtTypesCreated.descriptionFull':
        'Manage your debt types or of your managed organizations',
      'debtTypesCreated.tabMyOrganization': 'My Organization',
      'debtTypesCreated.tabManagedOrganizations': 'Managed Organizations',
      'commons.searchForCode': 'Search by code',
      'commons.searchForDescription': 'Search by description',
      'commons.searchForOrganizationName': 'Search by Org name',
      'commons.search': 'Search'
    });

    mockNavigate.mockClear();
    mockSetSearchParams.mockClear();
    vi.clearAllMocks();
  });

  it('renders title, call to action, and description for non-super admin', () => {
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockReturnValue(false);

    render(<DebtTypesCreated />);

    expect(screen.getByText('Debt Types Created')).toBeInTheDocument();
    expect(screen.getByText('Create New Debt Type')).toBeInTheDocument();
    expect(screen.getByText('Manage your debt types')).toBeInTheDocument();
    // Tabs should not show
    expect(screen.queryByText('My Organization')).not.toBeInTheDocument();
    expect(screen.queryByText('Managed Organizations')).not.toBeInTheDocument();
  });

  it('renders tabs and full description for super admin', () => {
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockReturnValue(true);

    render(<DebtTypesCreated />);

    expect(screen.getByText('My Organization')).toBeInTheDocument();
    expect(screen.getByText('Managed Organizations')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Manage your debt types or of your managed organizations'
      )
    ).toBeInTheDocument();
  });

  it('navigates to create page when call to action clicked', () => {
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockReturnValue(false);

    render(<DebtTypesCreated />);
    const createBtn = screen.getByText('Create New Debt Type');
    fireEvent.click(createBtn);
    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.DEBT_TYPE_ORG_CREATE); // or check exact enum string if you want
  });

  it('switches tabs and shows correct filter fields', async () => {
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockReturnValue(true);

    render(<DebtTypesCreated />);

    // Default tab 0 = My Organization
    expect(screen.getByLabelText('Search by code')).toBeInTheDocument();
    expect(screen.getByLabelText('Search by description')).toBeInTheDocument();

    // Switch to Managed Organizations tab
    const managedTab = screen.getByText('Managed Organizations');
    fireEvent.click(managedTab);

    await waitFor(() => {
      expect(screen.getByLabelText('Search by Org name')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
    });
  });

  it('allows user to enter filters and click Search in My Organization tab', async () => {
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockReturnValue(true);
    render(<DebtTypesCreated />);

    const codeInput = screen.getByLabelText('Search by code');
    const descriptionInput = screen.getByLabelText('Search by description');
    const searchButton = screen.getByText('Search');

    fireEvent.change(codeInput, { target: { value: 'test-code' } });
    fireEvent.change(descriptionInput, {
      target: { value: 'test-description' }
    });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(codeInput).toHaveValue('test-code');
      expect(descriptionInput).toHaveValue('test-description');
      expect(searchButton).toBeEnabled();
    });
  });

  it('allows user to enter filters and click Search in Managed Organizations tab', async () => {
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockReturnValue(true);
    render(<DebtTypesCreated />);
    const managedTab = screen.getByText('Managed Organizations');
    fireEvent.click(managedTab);

    const orgNameInput = await screen.findByLabelText('Search by Org name');
    const searchButton = screen.getByText('Search');
    fireEvent.change(orgNameInput, { target: { value: 'Example Org' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(orgNameInput).toHaveValue('Example Org');
      expect(searchButton).toBeEnabled();
    });
  });
});
