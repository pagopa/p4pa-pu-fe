import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { generatePath, useNavigate, useParams } from 'react-router';
import { render, screen } from '../../../__tests__/renderers';
import {
  getOrganizationApiKeys,
  getOrganizationDetail,
  getPdndClients,
  getPdndServices
} from '../../../api/organizations';
import { appState } from '../../../store/AppStateStore';
import { PageRoutes } from '../..';
import { OrganizationIntegrations } from '.';
import {
  OrganizationApiKeyType,
  PdndServiceType
} from '../../../../generated/core/data-contracts';

vi.mock('../../../api/organizations', () => ({
  getOrganizationDetail: vi.fn(),
  getOrganizationApiKeys: vi.fn(),
  getPdndServices: vi.fn(),
  getPdndClients: vi.fn()
}));
vi.mock('../SubUnitIntegrations', () => ({
  SubUnitIntegrations: () => <div data-testid="sub-unit-integrations" />
}));
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn()
  };
});

const mockNavigate = vi.fn();

const mockQuery = <T,>(fn: T, data: unknown) =>
  vi.mocked(fn as () => unknown).mockReturnValue({ data });

describe('OrganizationIntegrations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appState.value = {
      loading: false,
      customBreadcrumbsItems: [],
      ready: false
    };

    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useParams).mockReturnValue({ organizationId: '33' });

    mockQuery(getOrganizationDetail, { orgName: 'Ente' });
    mockQuery(getOrganizationApiKeys, [
      { keyType: OrganizationApiKeyType.IO, flagActive: true },
      { keyType: OrganizationApiKeyType.GENERATE_NOTICE }
    ]);
    mockQuery(getPdndServices, [
      {
        serviceName: 'SEND service',
        serviceType: PdndServiceType.SEND,
        purposeId: 'purp_1',
        clientId: 'client-a',
        clientName: 'A'
      }
    ]);
    mockQuery(getPdndClients, [
      { clientId: 'client-c', clientName: 'Client C', organizationId: 1 }
    ]);
  });

  it('renders the organization integrations', () => {
    render(<OrganizationIntegrations />);

    expect(
      screen.getByText('organizations.integrations.keyTypes.IO')
    ).toBeInTheDocument();
    expect(
      screen.getByText('organizations.integrations.keyTypes.GENERATE_NOTICE')
    ).toBeInTheDocument();
    expect(
      screen.getByText('organizations.integrations.active')
    ).toBeInTheDocument();
    expect(screen.getByText('SEND service')).toBeInTheDocument();
    expect(screen.getByText('purp_1')).toBeInTheDocument();
    expect(screen.getByText('Client C')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Ente' })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'organizations.management.subUnits' })
    ).toBeInTheDocument();
  });

  it('hides the organization integrations on the sub-units tab', async () => {
    render(<OrganizationIntegrations />);

    await userEvent.click(
      screen.getByRole('tab', { name: 'organizations.management.subUnits' })
    );

    expect(screen.queryByText('SEND service')).not.toBeInTheDocument();
    expect(screen.getByTestId('sub-unit-integrations')).toBeInTheDocument();
  });

  it('shows the empty state when there are no integrations', () => {
    mockQuery(getOrganizationApiKeys, []);
    mockQuery(getPdndServices, []);
    mockQuery(getPdndClients, []);
    render(<OrganizationIntegrations />);

    expect(
      screen.getByText('organizations.integrations.emptyTitle')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('organizations.integrations.pagoPaProducts')
    ).not.toBeInTheDocument();
  });

  it('navigates to the add integration page', async () => {
    render(<OrganizationIntegrations />);

    await userEvent.click(screen.getByTestId('add-integration-button'));

    expect(mockNavigate).toHaveBeenCalledWith(
      generatePath(PageRoutes.ADD_INTEGRATION, { organizationId: 33 })
    );
  });

  it('sets breadcrumbs once the organization name is available', () => {
    render(<OrganizationIntegrations />);

    expect(appState.value.customBreadcrumbsItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'ORGANIZATIONS',
          pathname: PageRoutes.ORGANIZATIONS_INDEX
        }),
        expect.objectContaining({
          id: 'ORGANIZATIONS_DETAIL',
          pathname: generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
            organizationId: 33
          }),
          label: 'Ente'
        }),
        expect.objectContaining({ id: 'ORGANIZATIONS_INTEGRATIONS' })
      ])
    );
  });

  it('does not set breadcrumbs while the organization is not loaded', () => {
    mockQuery(getOrganizationDetail, undefined);

    render(<OrganizationIntegrations />);

    expect(appState.value.customBreadcrumbsItems).toEqual([]);
  });
});
