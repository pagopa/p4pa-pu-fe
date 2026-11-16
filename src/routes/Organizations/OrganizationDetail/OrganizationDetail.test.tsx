import { fireEvent, render, screen, waitFor } from '@core/__tests__/renderers';
import {
  getOrganizationDetail,
  updateOrganization
} from '@core/api/organizations';
import utils from '@core/utils';
import { OrganizationStatus } from '@generated/core/client';
import { OrganizationDetail } from '.';
import type { OrganizationDetail as OrganizationDetailDTO } from '@generated/core/client';
import { PageRoutes } from '@core/routes';
import { setOrganizationId } from '@core/store/OrganizationIdStore';
import type { OrganizationIdMemo } from '@core/models/Organization';

const mockNavigate = vi.fn();

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mockNavigate
}));

vi.mock('../../../assets/appio.svg', () => ({ default: 'appio-svg-mock' }));
vi.mock('../../../assets/send.svg', () => ({ default: 'send-svg-mock' }));

vi.mock('../../../api/organizations', () => ({
  getOrganizationDetail: vi.fn(),
  updateOrganization: vi.fn()
}));

vi.mock('../../../utils', async () => {
  const actual = await vi.importActual<{ default: Record<string, unknown> }>(
    '../../../utils'
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
  const refetch = vi.fn();
  vi.mocked(getOrganizationDetail).mockReturnValue({
    data: { ...baseOrganizationDetail, ...overrides },
    isSuccess: true,
    isError: false,
    refetch
  } as unknown as ReturnType<typeof getOrganizationDetail>);
  return refetch;
};

describe('OrganizationDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setOrganizationId(33 as OrganizationIdMemo);
    vi.mocked(utils.roles.useIsSuperAdmin).mockReturnValue(false);
    vi.mocked(updateOrganization).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({})
    } as unknown as ReturnType<typeof updateOrganization>);
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

  it('shows the manage integrations button', () => {
    render(<OrganizationDetail />);

    expect(
      screen.getByTestId('manage-integrations-button')
    ).toBeInTheDocument();
  });

  it('navigates to the edit page when edit is clicked', () => {
    render(<OrganizationDetail />);

    fireEvent.click(screen.getByTestId('edit-organization-button'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(
        String(PageRoutes.ORGANIZATIONS_EDIT).split('/')[1]
      )
    );
    expect(mockNavigate.mock.calls[0][0]).toContain('33');
  });

  it('navigates to the integrations page when manage integrations is clicked', () => {
    render(<OrganizationDetail />);

    fireEvent.click(screen.getByTestId('manage-integrations-button'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(
        String(PageRoutes.ORGANIZATIONS_INTEGRATIONS).split('/')[1]
      )
    );
    expect(mockNavigate.mock.calls[0][0]).toContain('33');
  });

  it('falls back to the organization id from the store when the URL id is not numeric', () => {
    setOrganizationId(77 as OrganizationIdMemo);

    render(<OrganizationDetail />);

    expect(getOrganizationDetail).toHaveBeenCalledWith(77);
  });

  it('navigates back to the organizations list when the query fails', () => {
    vi.mocked(getOrganizationDetail).mockReturnValue({
      data: undefined,
      isSuccess: false,
      isError: true,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof getOrganizationDetail>);

    render(<OrganizationDetail />);

    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.ORGANIZATIONS_INDEX);
  });

  it('does not activate the organization when mandatory fields are missing', async () => {
    mockOrganizationDetailQuery({ status: OrganizationStatus.DRAFT, iban: '' });
    vi.mocked(utils.roles.useIsSuperAdmin).mockReturnValue(true);
    const notifySpy = vi.spyOn(utils.notify, 'emit');
    let confirm: (() => void) | undefined;
    vi.spyOn(utils.dialog, 'open').mockImplementation((dialog) => {
      confirm = dialog.onConfirm;
    });
    const closeSpy = vi.spyOn(utils.dialog, 'close');

    render(<OrganizationDetail />);
    fireEvent.click(screen.getByTestId('enable-organization-button'));
    await confirm?.();

    expect(notifySpy).toHaveBeenCalledWith(
      'organizations.enableDialog.emptyFields',
      'error'
    );
    expect(closeSpy).toHaveBeenCalled();
    expect(updateOrganization().mutateAsync).not.toHaveBeenCalled();
  });

  it('activates the organization when all mandatory fields are present', async () => {
    const refetch = mockOrganizationDetailQuery({
      status: OrganizationStatus.DRAFT,
      orgLogo: 'logo.png'
    });
    vi.mocked(utils.roles.useIsSuperAdmin).mockReturnValue(true);
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(updateOrganization).mockReturnValue({
      mutateAsync
    } as unknown as ReturnType<typeof updateOrganization>);
    const notifySpy = vi.spyOn(utils.notify, 'emit');
    let confirm: (() => void) | undefined;
    vi.spyOn(utils.dialog, 'open').mockImplementation((dialog) => {
      confirm = dialog.onConfirm;
    });
    vi.spyOn(utils.dialog, 'close').mockImplementation(() => undefined);

    render(<OrganizationDetail />);
    fireEvent.click(screen.getByTestId('enable-organization-button'));
    await confirm?.();

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: 33,
          organizationData: expect.objectContaining({
            status: OrganizationStatus.ACTIVE
          })
        })
      );
    });
    expect(refetch).toHaveBeenCalled();
    expect(notifySpy).toHaveBeenCalledWith(
      'organizations.enableDialog.success',
      'success'
    );
  });

  it('notifies an error when the activation request fails', async () => {
    mockOrganizationDetailQuery({
      status: OrganizationStatus.DRAFT,
      orgLogo: 'logo.png'
    });
    vi.mocked(utils.roles.useIsSuperAdmin).mockReturnValue(true);
    const mutateAsync = vi.fn().mockRejectedValue(new Error('update failed'));
    vi.mocked(updateOrganization).mockReturnValue({
      mutateAsync
    } as unknown as ReturnType<typeof updateOrganization>);
    const notifySpy = vi.spyOn(utils.notify, 'emit');
    let confirm: (() => void) | undefined;
    vi.spyOn(utils.dialog, 'open').mockImplementation((dialog) => {
      confirm = dialog.onConfirm;
    });
    vi.spyOn(utils.dialog, 'close').mockImplementation(() => undefined);

    render(<OrganizationDetail />);
    fireEvent.click(screen.getByTestId('enable-organization-button'));
    await confirm?.();

    await waitFor(() => {
      expect(notifySpy).toHaveBeenCalledWith(
        'organizations.enableDialog.error',
        'error'
      );
    });
  });
});
