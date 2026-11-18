import { act, fireEvent, render, screen } from '@core/__tests__/renderers';
import {
  getOrganizationDetail,
  updateOrganization
} from '@core/api/organizations';
import { setOrganizationId } from '@core/store/OrganizationIdStore';
import { PageRoutes } from '@core/routes';
import utils from '@core/utils';
import { OrganizationStatus } from '@generated/core/client';
import { generatePath, useNavigate, useParams } from 'react-router';
import { OrganizationDetail } from '.';
import type { OrganizationDetail as OrganizationDetailDTO } from '@generated/core/client';

vi.mock('../../../assets/appio.svg', () => ({ default: 'appio-svg-mock' }));
vi.mock('../../../assets/send.svg', () => ({ default: 'send-svg-mock' }));

vi.mock('../../../api/organizations', () => ({
  getOrganizationDetail: vi.fn(),
  updateOrganization: vi.fn()
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn()
  };
});

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
  const query = {
    data: { ...baseOrganizationDetail, ...overrides },
    isSuccess: true,
    isError: false,
    refetch: vi.fn()
  };
  vi.mocked(getOrganizationDetail).mockReturnValue(
    query as unknown as ReturnType<typeof getOrganizationDetail>
  );
  return query;
};

const mockOrganizationDetailError = () => {
  vi.mocked(getOrganizationDetail).mockReturnValue({
    data: undefined,
    isSuccess: false,
    isError: true,
    refetch: vi.fn()
  } as unknown as ReturnType<typeof getOrganizationDetail>);
};

const mockNavigate = vi.fn();

const openEnableDialog = () => {
  const openSpy = vi
    .spyOn(utils.dialog, 'open')
    .mockImplementation(() => undefined);
  const closeSpy = vi
    .spyOn(utils.dialog, 'close')
    .mockImplementation(() => undefined);
  const notifySpy = vi
    .spyOn(utils.notify, 'emit')
    .mockImplementation(() => undefined);

  fireEvent.click(screen.getByTestId('enable-organization-button'));

  expect(openSpy).toHaveBeenCalledTimes(1);
  const dialogConfig = openSpy.mock.calls[0][0];

  return { dialogConfig, openSpy, closeSpy, notifySpy };
};

describe('OrganizationDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(utils.roles.useIsSuperAdmin).mockReturnValue(false);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useParams).mockReturnValue({ organizationId: '33' });
    vi.mocked(updateOrganization).mockReturnValue({
      mutateAsync: vi.fn()
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

  it('redirects to the organizations index when the query is in error', () => {
    mockOrganizationDetailError();

    render(<OrganizationDetail />);

    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.ORGANIZATIONS_INDEX);
  });

  it('falls back to the organization id stored in the state when the URL param is not numeric', () => {
    setOrganizationId(66);
    vi.mocked(useParams).mockReturnValue({ organizationId: 'not-a-number' });

    render(<OrganizationDetail />);

    expect(getOrganizationDetail).toHaveBeenCalledWith(66);
  });

  it('navigates to the edit page when the edit button is clicked', () => {
    render(<OrganizationDetail />);

    fireEvent.click(screen.getByTestId('edit-organization-button'));

    expect(mockNavigate).toHaveBeenCalledWith(
      generatePath(PageRoutes.ORGANIZATIONS_EDIT, {
        organizationId: String(33)
      })
    );
  });

  it('navigates to the integrations page when the manage integrations button is clicked', () => {
    render(<OrganizationDetail />);

    fireEvent.click(screen.getByTestId('manage-integrations-button'));

    expect(mockNavigate).toHaveBeenCalledWith(
      generatePath(PageRoutes.ORGANIZATIONS_INTEGRATIONS, {
        organizationId: String(33)
      })
    );
  });

  it('opens the enable dialog and closes it through its onClose callback', () => {
    mockOrganizationDetailQuery({ status: OrganizationStatus.DRAFT });
    vi.mocked(utils.roles.useIsSuperAdmin).mockReturnValue(true);

    render(<OrganizationDetail />);

    const { dialogConfig, closeSpy } = openEnableDialog();

    dialogConfig.onClose?.();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('activates the organization when all required fields are filled', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(updateOrganization).mockReturnValue({
      mutateAsync
    } as unknown as ReturnType<typeof updateOrganization>);
    vi.mocked(utils.roles.useIsSuperAdmin).mockReturnValue(true);
    const { refetch } = mockOrganizationDetailQuery({
      status: OrganizationStatus.DRAFT,
      orgLogo: 'logo.png'
    });

    render(<OrganizationDetail />);

    const { dialogConfig, notifySpy, closeSpy } = openEnableDialog();

    await act(async () => {
      await dialogConfig.onConfirm?.();
    });

    expect(mutateAsync).toHaveBeenCalledWith({
      organizationId: 33,
      organizationData: expect.objectContaining({
        organizationId: 33,
        status: OrganizationStatus.ACTIVE
      })
    });
    expect(refetch).toHaveBeenCalled();
    expect(notifySpy).toHaveBeenCalledWith(
      'organizations.enableDialog.success',
      'success'
    );
    expect(closeSpy).toHaveBeenCalled();
  });

  it('does not activate the organization and notifies when required fields are missing', async () => {
    const mutateAsync = vi.fn();
    vi.mocked(updateOrganization).mockReturnValue({
      mutateAsync
    } as unknown as ReturnType<typeof updateOrganization>);
    vi.mocked(utils.roles.useIsSuperAdmin).mockReturnValue(true);
    mockOrganizationDetailQuery({
      status: OrganizationStatus.DRAFT,
      orgLogo: '',
      segregationCode: ''
    });

    render(<OrganizationDetail />);

    const { dialogConfig, notifySpy, closeSpy } = openEnableDialog();

    await act(async () => {
      await dialogConfig.onConfirm?.();
    });

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(notifySpy).toHaveBeenCalledWith(
      'organizations.enableDialog.emptyFields',
      'error'
    );
    expect(closeSpy).toHaveBeenCalled();
  });

  it('notifies an error when the activation request fails', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('fail'));
    vi.mocked(updateOrganization).mockReturnValue({
      mutateAsync
    } as unknown as ReturnType<typeof updateOrganization>);
    vi.mocked(utils.roles.useIsSuperAdmin).mockReturnValue(true);
    mockOrganizationDetailQuery({
      status: OrganizationStatus.DRAFT,
      orgLogo: 'logo.png',
      orgName: undefined as unknown as string
    });

    render(<OrganizationDetail />);

    const { dialogConfig, notifySpy, closeSpy } = openEnableDialog();

    await act(async () => {
      await dialogConfig.onConfirm?.();
    });

    expect(notifySpy).toHaveBeenCalledWith(
      'organizations.enableDialog.error',
      'error'
    );
    expect(closeSpy).toHaveBeenCalled();
  });
});
