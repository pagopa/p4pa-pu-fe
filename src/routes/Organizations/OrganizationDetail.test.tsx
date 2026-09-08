import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { getOrganizationDetail } from '../../api/organizations';
import { OrganizationDetail } from './OrganizationDetail';
import utils from '../../utils';

vi.mock('../../assets/appio.svg', () => ({
  default: 'appio-svg-mock'
}));
vi.mock('../../assets/send.svg', () => ({
  default: 'send-svg-mock'
}));

vi.mock('../../api/organizations', () => ({
  getOrganizationDetail: vi.fn(),
  updateOrganization: vi.fn()
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: () => ({ organizationId: '33' }),
    useNavigate: () => vi.fn()
  };
});

vi.mock('../../utils', async () => {
  const actual = await vi.importActual<{ default: Record<string, unknown> }>(
    '../../utils'
  );
  return {
    ...actual,
    default: {
      ...actual.default,
      config: {
        deployPath: '/test'
      },
      roles: {
        useIsSuperAdmin: vi.fn(() => false)
      }
    }
  };
});

describe('OrganizationDetail Page', () => {
  const dataMock = {
    organizationId: 33,
    flagTreasury: false,
    ipaCode: 'IPA_TEST',
    orgFiscalCode: '99999999990',
    orgName: 'Ente P4PA intermediato 1',
    orgTypeCode: '03',
    orgTypeDescription: 'Comune',
    orgEmail: 'enteditest@email.it',
    iban: 'IT111',
    segregationCode: '00',
    orgLogo: '',
    status: 'ACTIVE',
    additionalLanguage: 'EN',
    startDate: '2024-12-19',
    brokerId: 1,
    flagNotifyOutcomePush: false,
    flagPaymentNotification: false
  };

  const mockQueryResult = (overrides: Partial<typeof dataMock> = {}) => {
    const mockGetOrganizationDetail = getOrganizationDetail as ReturnType<
      typeof vi.fn
    >;
    mockGetOrganizationDetail.mockReturnValue({
      data: { ...dataMock, ...overrides },
      isSuccess: true,
      isError: false,
      refetch: vi.fn()
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryResult();
  });

  it('renders Organization Detail without crashing', async () => {
    render(<OrganizationDetail />);

    expect(screen.getByText(dataMock.ipaCode)).toBeInTheDocument();
    expect(screen.getByText(dataMock.orgTypeDescription)).toBeInTheDocument();
    expect(screen.getByText(dataMock.iban)).toBeInTheDocument();
  });

  it('renders Organization Detail with enable-button', async () => {
    const mockUseIsSuperAdmin = vi.mocked(utils.roles.useIsSuperAdmin);
    mockQueryResult({ status: 'DRAFT' });
    mockUseIsSuperAdmin.mockReturnValue(true);

    render(<OrganizationDetail />);

    expect(
      screen.getByTestId('enable-organization-button')
    ).toBeInTheDocument();
  });
});
