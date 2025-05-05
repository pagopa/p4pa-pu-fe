import { fireEvent, waitFor } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { PageRoutes } from '../../App';
import DebtTypesCreated from './DebtTypesCreated';
import { render, screen } from '../../__tests__/renderers';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const translations = {
  'commons.routes.DEBT_TYPES_CREATED': 'Debt Types Created',
  'debtTypesCreated.callToAction': 'Create New Debt Type',
  'debtTypesCreated.description': 'Manage your debt types',
  'commons.searchForCode': 'Search by code',
  'commons.searchForDescription': 'Search by description',
  'commons.search': 'Search',
  'commons.searchForIPACode': 'Search by IPA code',
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

    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.DEBT_TYPE_CREATE);
  });

  it('renders the correct tabs', () => {
    render(<DebtTypesCreated />);

    expect(screen.getByText('My Organization')).toBeInTheDocument();
    expect(screen.getByText('Managed Organizations')).toBeInTheDocument();
  });

  it('renders correct filter fields for the My Organization tab', () => {
    render(<DebtTypesCreated />);

    expect(screen.getByLabelText('Search by code')).toBeInTheDocument();
    expect(screen.getByLabelText('Search by description')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Search').closest('button')).toBeDisabled();
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
      expect(screen.getByLabelText('Search by IPA code')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Search').closest('button')).toBeDisabled();
    });
  });

  it('enables search button when filter field is filled in Managed Organizations tab', async () => {
    render(<DebtTypesCreated />);

    const managedOrgsTab = screen.getByText('Managed Organizations');
    fireEvent.click(managedOrgsTab);

    const ipaCodeInput = await screen.findByLabelText('Search by IPA code');
    fireEvent.change(ipaCodeInput, { target: { value: '12345' } });

    await waitFor(() => {
      expect(screen.getByText('Search').closest('button')).not.toBeDisabled();
    });
  });

  it('executes search with correct parameters for My Organization tab', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<DebtTypesCreated />);

    const codeInput = screen.getByLabelText('Search by code');
    const descriptionInput = screen.getByLabelText('Search by description');

    fireEvent.change(codeInput, { target: { value: 'test-code' } });
    fireEvent.change(descriptionInput, {
      target: { value: 'test-description' }
    });

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      'code:',
      'test-code',
      'description:',
      'test-description'
    );
  });

  it('executes search with correct parameters for Managed Organizations tab', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<DebtTypesCreated />);

    const managedOrgsTab = screen.getByText('Managed Organizations');
    fireEvent.click(managedOrgsTab);

    const ipaCodeInput = await screen.findByLabelText('Search by IPA code');
    fireEvent.change(ipaCodeInput, { target: { value: '12345' } });

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    expect(consoleSpy).toHaveBeenCalledWith('IPA Code:', '12345');
  });

  it('mostra i dati di MyOrg senza filtri applicati', async () => {
    render(<DebtTypesCreated />);

    await waitFor(() => {
      expect(screen.getByText('My Organization')).toBeInTheDocument();
    });
  });

  it('filtra correttamente i dati di MyOrg quando viene applicato un filtro per codice', async () => {
    const consoleSpy = vi.spyOn(console, 'log');

    render(<DebtTypesCreated />);

    const codeInput = screen.getByLabelText('Search by code');
    fireEvent.change(codeInput, { target: { value: 'test-code' } });

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      'code:',
      'test-code',
      'description:',
      ''
    );
  });

  it('filtra correttamente i dati di MyOrg quando viene applicato un filtro per descrizione', async () => {
    const consoleSpy = vi.spyOn(console, 'log');

    render(<DebtTypesCreated />);

    const descriptionInput = screen.getByLabelText('Search by description');
    fireEvent.change(descriptionInput, {
      target: { value: 'test-description' }
    });

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      'code:',
      '',
      'description:',
      'test-description'
    );
  });

  it('filtra correttamente i dati di MyOrg quando vengono applicati entrambi i filtri', async () => {
    const consoleSpy = vi.spyOn(console, 'log');

    render(<DebtTypesCreated />);
    const codeInput = screen.getByLabelText('Search by code');
    const descriptionInput = screen.getByLabelText('Search by description');

    fireEvent.change(codeInput, { target: { value: 'test-code' } });
    fireEvent.change(descriptionInput, {
      target: { value: 'test-description' }
    });

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      'code:',
      'test-code',
      'description:',
      'test-description'
    );
  });
});
