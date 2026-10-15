import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { generatePath, useNavigate, useParams } from 'react-router';
import { render, screen } from '../../../__tests__/renderers';
import { getOrganizationDetail } from '../../../api/organizations';
import {
  getOrganizationApiKeys,
  getPdndClients,
  getPdndServices
} from '@core/api/integrations';
import { useHashParamsListener } from '@core/hooks/useHashParamsListener';
import utils from '@core/utils';
import { appState } from '../../../store/AppStateStore';
import { PageRoutes } from '../..';
import { OrganizationIntegrations } from '.';
import {
  OrganizationApiKeyType,
  PdndServiceType
} from '../../../../generated/core/data-contracts';

vi.mock('../../../api/organizations', () => ({
  getOrganizationDetail: vi.fn()
}));
vi.mock('@core/api/integrations', () => ({
  getOrganizationApiKeys: vi.fn(),
  getPdndServices: vi.fn(),
  getPdndClients: vi.fn()
}));
vi.mock('@core/hooks/useHashParamsListener', () => ({
  useHashParamsListener: vi.fn()
}));
vi.mock('./components/SubUnitIntegrations', () => ({
  SubUnitIntegrations: () => <div data-testid="sub-unit-integrations" />
}));
vi.mock('../../../components/EmptyDataGrid/EmptyDataGrid', () => ({
  default: ({
    title,
    action
  }: {
    title: string;
    action: { label: string; onClick: () => void };
  }) => (
    <div>
      <p>{title}</p>
      <button data-testid="empty-state-action" onClick={action.onClick}>
        {action.label}
      </button>
    </div>
  )
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

const mockTab = (tab?: string) =>
  vi
    .mocked(useHashParamsListener)
    .mockReturnValue(
      (tab ? { tab } : {}) as ReturnType<typeof useHashParamsListener>
    );

const addIntegrationPath = generatePath(PageRoutes.ADD_INTEGRATION, {
  organizationId: 33
});

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
    mockTab();

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

  it('shows the sub-units tab content when the tab hash param is 1', () => {
    mockTab('1');

    render(<OrganizationIntegrations />);

    expect(screen.getByTestId('sub-unit-integrations')).toBeInTheDocument();
    expect(screen.queryByText('SEND service')).not.toBeInTheDocument();
  });

  it('writes the selected tab to the URL hash', async () => {
    const setSpy = vi
      .spyOn(utils.URI, 'set')
      .mockImplementation(() => undefined);

    render(<OrganizationIntegrations />);
    await userEvent.click(
      screen.getByRole('tab', { name: 'organizations.management.subUnits' })
    );

    expect(setSpy).toHaveBeenCalledWith('tab=1');
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

  it('navigates to the add integration page from the header button', async () => {
    render(<OrganizationIntegrations />);

    await userEvent.click(screen.getByTestId('add-integration-button'));

    expect(mockNavigate).toHaveBeenCalledWith(addIntegrationPath);
  });

  it('navigates to the add integration page from the empty state', async () => {
    mockQuery(getOrganizationApiKeys, []);
    mockQuery(getPdndServices, []);
    mockQuery(getPdndClients, []);

    render(<OrganizationIntegrations />);
    await userEvent.click(screen.getByTestId('empty-state-action'));

    expect(mockNavigate).toHaveBeenCalledWith(addIntegrationPath);
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
