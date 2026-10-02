import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import userEvent from '@testing-library/user-event';
import {
  getOrganizationApiKeys,
  getOrganizationDetail,
  getPdndClients,
  getPdndServices
} from '../../api/organizations';
import { OrganizationIntegrations } from './OrganizationIntegrations';
import {
  OrganizationApiKeyType,
  PdndServiceType
} from '../../../generated/core/data-contracts';

vi.mock('../../api/organizations', () => ({
  getOrganizationDetail: vi.fn(),
  getOrganizationApiKeys: vi.fn(),
  getPdndServices: vi.fn(),
  getPdndClients: vi.fn()
}));
vi.mock('./SubUnitIntegrations', () => ({
  SubUnitIntegrations: () => <div data-testid="sub-unit-integrations" />
}));

const mockQuery = <T,>(fn: T, data: unknown) =>
  vi.mocked(fn as () => unknown).mockReturnValue({ data });

describe('OrganizationIntegrations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery(getOrganizationDetail, { orgName: 'Ente', flagNotifyIo: true });
    mockQuery(getOrganizationApiKeys, [
      { keyType: OrganizationApiKeyType.IO },
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
    expect(screen.getByTestId('add-integration-button')).toBeInTheDocument();
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
});
