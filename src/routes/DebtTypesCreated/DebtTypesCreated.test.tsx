import { fireEvent, waitFor } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { PageRoutes } from '../../App';
import DebtTypesCreated from './DebtTypesCreated';
import { render, screen } from '../../__tests__/renderers';
import utils from '../../utils';

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = (await vi.importActual('react-router-dom')) as Record<
    string,
    unknown
  >;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams]
  };
});

const translations = {
  'commons.routes.DEBT_TYPES_DASHBOARD': 'Debt Types Created',
  'debtTypesCreated.callToAction': 'Create New Debt Type',
  'debtTypesCreated.description': 'Manage your debt types',
  'debtTypesCreated.descriptionFull':
    'Manage your debt types or of your managed organizations',
  'commons.searchForCode': 'Search by code',
  'commons.searchForDescription': 'Search by description',
  'commons.search': 'Search',
  'commons.searchForOrganizationName': 'Search by Org name',
  'debtTypesCreated.tabMyOrganization': 'My Organization',
  'debtTypesCreated.tabManagedOrganizations': 'Managed Organizations',
  'debtTypesCreated.myOrganizationDataGrid.code': 'Code',
  'debtTypesCreated.myOrganizationDataGrid.debtType': 'Debt Type',
  'debtTypesCreated.myOrganizationDataGrid.description': 'Description',
  'debtTypesCreated.myOrganizationDataGrid.lastUpdateDate': 'Last Update',
  'debtTypesCreated.myOrganizationDataGrid.enabledOperators':
    'Enabled Operators',
  'debtTypesCreated.paginationRowsPerPage': 'Rows per page'
};

describe('DebtTypesCreated', () => {
  beforeEach(() => {
    i18nTestSetup(translations);
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  it('renders the component with correct title and call to action', () => {
    render(<DebtTypesCreated />);

    expect(screen.getByText('Debt Types Created')).toBeInTheDocument();
    expect(screen.getByText('Create New Debt Type')).toBeInTheDocument();
    expect(screen.getByText('Manage your debt types')).toBeInTheDocument();
  });

  it('navigates to debt type create page when clicking the call to action button', () => {
    render(<DebtTypesCreated />);

    const createButton = screen.getByText('Create New Debt Type');
    fireEvent.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.DEBT_TYPE_ORG_CREATE);
  });

  it('does not render tabs', () => {
    render(<DebtTypesCreated />);

    expect(screen.queryByText('My Organization')).not.toBeInTheDocument();
    expect(screen.queryByText('Managed Organizations')).not.toBeInTheDocument();
  });

  it('renders the correct tabs when the user is a superAdmin', () => {
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => true);
    render(<DebtTypesCreated />);

    expect(screen.getByText('My Organization')).toBeInTheDocument();
    expect(screen.getByText('Managed Organizations')).toBeInTheDocument();
  });

  it('renders correct filter fields for the My Organization tab', () => {
    render(<DebtTypesCreated />);

    expect(screen.getByLabelText('Search by code')).toBeInTheDocument();
    expect(screen.getByLabelText('Search by description')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('enables search button when filter fields are filled in My Organization tab', async () => {
    render(<DebtTypesCreated />);

    const codeInput = screen.getByLabelText('Search by code');
    fireEvent.change(codeInput, { target: { value: 'test-code' } });

    await waitFor(() => {
      expect(screen.getByText('Search').closest('button')).not.toBeDisabled();
    });
  });

  it('switches to Managed Organizations tab and renders correct filter fields', async () => {
    render(<DebtTypesCreated />);

    const managedOrgsTab = screen.getByText('Managed Organizations');
    fireEvent.click(managedOrgsTab);

    await waitFor(() => {
      expect(screen.getByLabelText('Search by Org name')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
    });
  });

  it('executes search with correct parameters for My Organization tab', async () => {
    render(<DebtTypesCreated />);

    const codeInput = screen.getByLabelText('Search by code');
    const descriptionInput = screen.getByLabelText('Search by description');

    fireEvent.change(codeInput, { target: { value: 'test-code' } });
    fireEvent.change(descriptionInput, {
      target: { value: 'test-description' }
    });

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(codeInput).toHaveValue('test-code');
      expect(descriptionInput).toHaveValue('test-description');
    });
  });

  it('executes search with correct parameters for Managed Organizations tab', async () => {
    render(<DebtTypesCreated />);

    const managedOrgsTab = screen.getByText('Managed Organizations');
    fireEvent.click(managedOrgsTab);

    const ipaCodeInput = await screen.findByLabelText('Search by Org name');
    fireEvent.change(ipaCodeInput, { target: { value: '12345' } });

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(ipaCodeInput).toHaveValue('12345');
    });
  });

  it('renders MyOrg data without applied filters', async () => {
    render(<DebtTypesCreated />);

    await waitFor(() => {
      expect(screen.getByText('My Organization')).toBeInTheDocument();
    });
  });

  it('shoud filter MyOrg data correctly with code filter parameter', async () => {
    render(<DebtTypesCreated />);

    const codeInput = screen.getByLabelText('Search by code');
    fireEvent.change(codeInput, { target: { value: 'test-code' } });

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(codeInput).toHaveValue('test-code');
    });
  });

  it('shoud filter MyOrg data correctly with description filter parameter', async () => {
    render(<DebtTypesCreated />);

    const descriptionInput = screen.getByLabelText('Search by description');
    fireEvent.change(descriptionInput, {
      target: { value: 'test-description' }
    });

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(descriptionInput).toHaveValue('test-description');
    });
  });

  it('shoud filter MyOrg data correctly with code and description filters parameters', async () => {
    render(<DebtTypesCreated />);
    const codeInput = screen.getByLabelText('Search by code');
    const descriptionInput = screen.getByLabelText('Search by description');

    fireEvent.change(codeInput, { target: { value: 'test-code' } });
    fireEvent.change(descriptionInput, {
      target: { value: 'test-description' }
    });

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(codeInput).toHaveValue('test-code');
      expect(descriptionInput).toHaveValue('test-description');
    });
  });
});
