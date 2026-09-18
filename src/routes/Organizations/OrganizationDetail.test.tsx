import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { getOrganizationDetail } from '../../api/organizations';
import { OrganizationDetail } from './OrganizationDetail';
import utils from '../../utils';
import type { OrganizationDetail as OrganizationDetailDTO } from '../../../generated/core/data-contracts';
import { OrganizationStatus } from '@generated/core/client';

vi.mock('../../assets/appio.svg', () => ({ default: 'appio-svg-mock' }));
vi.mock('../../assets/send.svg', () => ({ default: 'send-svg-mock' }));

vi.mock('../../api/organizations', () => ({
  getOrganizationDetail: vi.fn(),
  updateOrganization: vi.fn()
}));

vi.mock('../../utils', async () => {
  const actual = await vi.importActual<{ default: Record<string, unknown> }>(
    '../../utils'
  );
  return {
    ...actual,
    default: {
      ...actual.default,
      roles: { useIsSuperAdmin: vi.fn(() => false) }
    }
  };
});

const baseOrganizationDetail: OrganizationDetailDTO = {
  organizationId: 33,
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
  brokerId: 1
} as OrganizationDetailDTO;

const mockOrganizationDetailQuery = (
  overrides: Partial<OrganizationDetailDTO> = {}
) => {
  vi.mocked(getOrganizationDetail).mockReturnValue({
    data: { ...baseOrganizationDetail, ...overrides },
    isSuccess: true,
    isError: false,
    refetch: vi.fn()
  } as unknown as ReturnType<typeof getOrganizationDetail>);
};

describe('OrganizationDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(utils.roles.useIsSuperAdmin).mockReturnValue(false);
    mockOrganizationDetailQuery();
  });

  it("renders the organization's registry data from the API", () => {
    render(<OrganizationDetail />);

    expect(
      screen.getByText(baseOrganizationDetail.ipaCode)
    ).toBeInTheDocument();
    expect(
      screen.getByText(baseOrganizationDetail.orgTypeDescription as string)
    ).toBeInTheDocument();
    expect(
      screen.getByText(baseOrganizationDetail.iban as string)
    ).toBeInTheDocument();
  });

  it('shows the enable button only for a draft organization when the user is a super admin', () => {
    mockOrganizationDetailQuery({ status: OrganizationStatus.DRAFT });
    vi.mocked(utils.roles.useIsSuperAdmin).mockReturnValue(true);

    render(<OrganizationDetail />);

    expect(
      screen.getByTestId('enable-organization-button')
    ).toBeInTheDocument();
  });

  it('hides the enable button for a non-admin user even on a draft organization', () => {
    mockOrganizationDetailQuery({ status: OrganizationStatus.DRAFT });

    render(<OrganizationDetail />);

    expect(
      screen.queryByTestId('enable-organization-button')
    ).not.toBeInTheDocument();
  });

  it('hides the enable button for an active organization even as a super admin', () => {
    mockOrganizationDetailQuery({ status: OrganizationStatus.ACTIVE });
    vi.mocked(utils.roles.useIsSuperAdmin).mockReturnValue(true);

    render(<OrganizationDetail />);

    expect(
      screen.queryByTestId('enable-organization-button')
    ).not.toBeInTheDocument();
  });
});
