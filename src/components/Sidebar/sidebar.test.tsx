import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { OperatorRole } from '../../../generated/core/data-contracts';
import { setOperatorRole } from '../../store/OperatorRoleStore';
import utils from '../../utils';
import { vi } from 'vitest';
import { render } from '../../__tests__/renderers';
import type { AxiosResponse } from 'axios';
import type { SupersetUrlResponseDTO } from '../../../generated/core/client';
import { PageRoutes } from '../../routes';

const renderSidebar = () => render(<Sidebar />);
const clickRoute = (route: string) => {
  const link = document.querySelector<HTMLAnchorElement>(`a[href="${route}"]`);
  if (!link) {
    throw new Error(`Could not find sidebar link for route "${route}"`);
  }
  fireEvent.click(link);
};
const clickStatistics = () => {
  const button = document.querySelector<HTMLButtonElement>(
    'button[aria-controls="submenu-commons.routes.statistics"]'
  );
  if (!button) {
    throw new Error('Could not find the statistics menu button');
  }
  fireEvent.click(button);
};

const createMockResponse = (
  data: SupersetUrlResponseDTO
): AxiosResponse<SupersetUrlResponseDTO> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as AxiosResponse<SupersetUrlResponseDTO>['config']
});

describe('Sidebar component', () => {
  it('should not render backoffice section when the role is operator', () => {
    setOperatorRole(OperatorRole.ROLE_OPER);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);

    renderSidebar();

    expect(screen.queryByText('commons.routes.BACKOFFICE')).toBeNull();
    expect(screen.queryByText('commons.routes.ORGANIZATIONS')).toBeNull();
  });

  it('should render backoffice section with all sub menu items when the role is superAdmin', () => {
    setOperatorRole(OperatorRole.ROLE_ADMIN);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => true);

    renderSidebar();

    expect(screen.queryByText('commons.routes.BACKOFFICE')).toBeDefined();

    expect(
      screen.queryByText('commons.routes.BACKOFFICE_TAXONOMY')
    ).toBeDefined();
    expect(
      screen.queryByText('commons.routes.BACKOFFICE_EVENTS')
    ).toBeDefined();
    expect(screen.queryByText('commons.routes.CLIENT_SIL')).toBeDefined();
    expect(screen.queryByText('commons.routes.ORG_SIL_SERVICE')).toBeDefined();

    expect(screen.queryByText('commons.routes.ORGANIZATIONS')).toBeDefined();

    clickRoute(PageRoutes.ORGANIZATIONS);
  });

  it('should render backoffice section with a limited sub menu items when the role is admin', () => {
    setOperatorRole(OperatorRole.ROLE_ADMIN);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);

    renderSidebar();

    expect(screen.queryByText('commons.routes.BACKOFFICE')).toBeDefined();

    expect(screen.queryByText('commons.routes.BACKOFFICE_TAXONOMY')).toBeNull();
    expect(screen.queryByText('commons.routes.BACKOFFICE_EVENTS')).toBeNull();
    expect(screen.queryByText('commons.routes.ORGANIZATIONS')).toBeNull();

    expect(screen.queryByText('commons.routes.CLIENT_SIL')).toBeDefined();
    expect(screen.queryByText('commons.routes.ORG_SIL_SERVICE')).toBeDefined();
  });

  it('should render debt types section for admin and superAdmin', () => {
    setOperatorRole(OperatorRole.ROLE_ADMIN);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);

    renderSidebar();

    expect(screen.queryByText('commons.routes.DEBT_TYPES')).toBeDefined();
    expect(
      screen.queryByText('commons.routes.DEBT_TYPES_DASHBOARD')
    ).toBeDefined();

    expect(screen.queryByText('commons.routes.DEBT_TYPES_CATALOG')).toBeNull();
  });

  it('should render debt types catalog for superAdmin only', () => {
    setOperatorRole(OperatorRole.ROLE_ADMIN);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => true);

    renderSidebar();

    expect(screen.queryByText('commons.routes.DEBT_TYPES')).toBeDefined();
    expect(
      screen.queryByText('commons.routes.DEBT_TYPES_DASHBOARD')
    ).toBeDefined();
    expect(
      screen.queryByText('commons.routes.DEBT_TYPES_CATALOG')
    ).toBeDefined();
  });

  it('should render common menu items for all roles', () => {
    setOperatorRole(OperatorRole.ROLE_OPER);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);

    renderSidebar();

    expect(screen.queryByText('commons.routes.HOME')).toBeDefined();
    expect(screen.queryByText('commons.routes.DEBT_POSITIONS')).toBeDefined();
    expect(screen.queryByText('commons.routes.FLOWS')).toBeDefined();
    expect(screen.queryByText('commons.routes.CLASSIFICATIONS')).toBeDefined();
    expect(screen.queryByText('commons.routes.ASSESSMENT')).toBeDefined();
    expect(screen.queryByText('commons.routes.STATISTICS')).toBeDefined();

    clickRoute(PageRoutes.HOME);
  });

  it('should render statistics section for all roles', () => {
    setOperatorRole(OperatorRole.ROLE_OPER);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);

    renderSidebar();

    expect(screen.queryByText('commons.routes.STATISTICS')).toBeDefined();
  });

  it('should collapse the sidebar when an admin opens their organization', () => {
    setOperatorRole(OperatorRole.ROLE_ADMIN);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);

    renderSidebar();

    clickRoute(PageRoutes.MYORGANIZATION);
  });

  it('should open the generated statistics URL', async () => {
    setOperatorRole(OperatorRole.ROLE_OPER);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);
    vi.spyOn(utils.apiClient.bff, 'generateSupersetUrl').mockResolvedValue(
      createMockResponse({
        authorizedUrl: 'https://statistics.example.com'
      })
    );
    const openWindow = vi.spyOn(window, 'open').mockImplementation(() => null);

    renderSidebar();
    clickStatistics();

    await waitFor(() => {
      expect(openWindow).toHaveBeenCalledWith(
        'https://statistics.example.com',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  it('should notify when no statistics URL is returned', async () => {
    setOperatorRole(OperatorRole.ROLE_OPER);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);
    vi.spyOn(utils.apiClient.bff, 'generateSupersetUrl').mockResolvedValue(
      createMockResponse({})
    );
    const notify = vi
      .spyOn(utils.notify, 'emit')
      .mockImplementation(() => undefined);

    renderSidebar();
    clickStatistics();

    await waitFor(() => {
      expect(notify).toHaveBeenCalledWith(
        'statistics.urlNotAvailable',
        'error'
      );
    });
  });

  it('should notify when generating the statistics URL fails', async () => {
    setOperatorRole(OperatorRole.ROLE_OPER);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);
    const error = new Error('URL generation failed');
    vi.spyOn(utils.apiClient.bff, 'generateSupersetUrl').mockRejectedValue(
      error
    );
    const notify = vi
      .spyOn(utils.notify, 'emit')
      .mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    renderSidebar();
    clickStatistics();

    await waitFor(() => {
      expect(notify).toHaveBeenCalledWith(
        'statistics.urlGenerationFailed',
        'error'
      );
    });
  });

  it('should show a progress indicator while generating the statistics URL', async () => {
    setOperatorRole(OperatorRole.ROLE_OPER);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);
    let resolveRequest!: (
      response: AxiosResponse<SupersetUrlResponseDTO>
    ) => void;
    const request = new Promise<AxiosResponse<SupersetUrlResponseDTO>>(
      (resolve) => {
        resolveRequest = resolve;
      }
    );
    vi.spyOn(utils.apiClient.bff, 'generateSupersetUrl').mockReturnValue(
      request
    );

    renderSidebar();
    clickStatistics();

    expect(
      await screen.findByRole('progressbar', { hidden: true })
    ).toBeInTheDocument();

    resolveRequest(createMockResponse({}));
    await waitFor(() => {
      expect(
        screen.queryByRole('progressbar', { hidden: true })
      ).not.toBeInTheDocument();
    });
  });

  it('should not render My organization section when the role is operator', () => {
    setOperatorRole(OperatorRole.ROLE_OPER);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);

    renderSidebar();

    expect(screen.queryByText('commons.routes.MYORGANIZATION')).toBeNull();
  });
});
