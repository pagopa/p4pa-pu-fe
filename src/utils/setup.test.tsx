import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '../__tests__/renderers';
import { AxiosError, type AxiosResponse } from 'axios';
import { generatePath } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import type { OrganizationDTO } from '../../generated/core/data-contracts';
import { OrganizationStatus } from '../../generated/core/data-contracts';
import {
  appSetup,
  draftFallbackLoader,
  setupFallback,
  setupOrError
} from './setup';
import {
  organizationsState,
  selectedOrganizationState,
  setOrganizations
} from '../store/OrganizationsStore';
import {
  organizationIdState,
  setOrganizationId
} from '../store/OrganizationIdStore';
import { operatorRoleState } from '../store/OperatorRoleStore';
import { appState } from '../store/AppStateStore';
import { idTokenPayloadState } from '../store/IdTokenStore';
import { PageRoutes } from '../routes';
import utils from '.';

const mocks = vi.hoisted(() => ({
  getOrganizationsPlain: vi.fn(),
  getBrokersConfigPlain: vi.fn(),
  getUserInfoPlain: vi.fn(),
  setupInterceptors: vi.fn(),
  isAuthErrorInProgress: vi.fn()
}));

vi.mock('../api/brokers', () => ({
  default: { getBrokersConfigPlain: mocks.getBrokersConfigPlain }
}));

vi.mock('../api/user', () => ({
  default: { getUserInfoPlain: mocks.getUserInfoPlain }
}));

vi.mock('./loaders', () => ({
  default: { getOrganizationsPlain: mocks.getOrganizationsPlain }
}));

vi.mock('./interceptors', () => ({
  setupInterceptors: mocks.setupInterceptors
}));

vi.mock('./navigation', () => ({
  default: { isAuthErrorInProgress: mocks.isAuthErrorInProgress }
}));

const buildOrg = (overrides: Partial<OrganizationDTO> = {}): OrganizationDTO =>
  ({
    organizationId: 1,
    orgFiscalCode: 'CF1',
    ipaCode: 'IPA1',
    operatorRole: 'ROLE_ADMIN',
    status: OrganizationStatus.ACTIVE,
    ...overrides
  }) as OrganizationDTO;

const loaderArgs = (url: string): LoaderFunctionArgs =>
  ({ request: new Request(url) }) as LoaderFunctionArgs;

describe('setup', () => {
  let replaceSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    organizationsState.value = [];
    organizationIdState.state.value = undefined as never;
    operatorRoleState.value = undefined;
    idTokenPayloadState.value = undefined;
    appState.value = {
      loading: false,
      customBreadcrumbsItems: [],
      ready: false
    };

    mocks.getBrokersConfigPlain.mockResolvedValue({});
    mocks.getUserInfoPlain.mockResolvedValue({ brokerId: 1 });
    mocks.isAuthErrorInProgress.mockReturnValue(false);
    replaceSpy = vi
      .spyOn(window.location, 'replace')
      .mockImplementation(() => undefined);
  });

  describe('state setup', () => {
    it('loads config, user, organizations and marks the app as ready', async () => {
      const orgs = [buildOrg()];
      mocks.getOrganizationsPlain.mockResolvedValue(orgs);
      setOrganizationId(1);

      await appSetup(loaderArgs('http://localhost/'));

      expect(mocks.setupInterceptors).toHaveBeenCalledTimes(2);
      expect(organizationsState.value).toEqual(orgs);
      expect(organizationIdState.state.value).toBe(1);
      expect(operatorRoleState.value).toBe('ROLE_ADMIN');
      expect(appState.value.ready).toBe(true);
      expect(replaceSpy).not.toHaveBeenCalled();
    });

    it('selects the organization matching the id token when none is stored', async () => {
      const orgs = [
        buildOrg({ organizationId: 1, orgFiscalCode: 'CF1', ipaCode: 'IPA1' }),
        buildOrg({ organizationId: 2, orgFiscalCode: 'CF2', ipaCode: 'IPA2' })
      ];
      mocks.getOrganizationsPlain.mockResolvedValue(orgs);
      idTokenPayloadState.value = {
        organization: { fiscal_code: 'CF2', ipaCode: 'IPA2' }
      };

      await appSetup(loaderArgs('http://localhost/'));

      expect(organizationIdState.state.value).toBe(2);
    });

    it('falls back to the first organization when the id token does not match', async () => {
      const orgs = [buildOrg({ organizationId: 4 })];
      mocks.getOrganizationsPlain.mockResolvedValue(orgs);
      idTokenPayloadState.value = {
        organization: { fiscal_code: 'UNKNOWN', ipaCode: 'UNKNOWN' }
      };

      await appSetup(loaderArgs('http://localhost/'));

      expect(organizationIdState.state.value).toBe(4);
    });

    it('does not select an organization when the list is empty', async () => {
      mocks.getOrganizationsPlain.mockResolvedValue([]);

      await appSetup(loaderArgs('http://localhost/'));

      expect(organizationIdState.state.value).toBeUndefined();
      expect(appState.value.ready).toBe(true);
    });

    it('redirects to the blocking error page when brokerId is missing', async () => {
      mocks.getOrganizationsPlain.mockResolvedValue([]);
      mocks.getUserInfoPlain.mockResolvedValue({});
      vi.spyOn(console, 'error').mockImplementation(() => undefined);

      await setupOrError();

      expect(replaceSpy).toHaveBeenCalledWith(
        `${utils.config.deployPath}/errorBlocking`
      );
    });

    it('stays silent on a 401 error because the interceptor handles it', async () => {
      mocks.getOrganizationsPlain.mockRejectedValue(
        new AxiosError('unauthorized', '401', undefined, undefined, {
          status: 401
        } as AxiosResponse)
      );

      await setupOrError();

      expect(replaceSpy).not.toHaveBeenCalled();
    });

    it('redirects to the blocking error page on a generic error', async () => {
      mocks.getOrganizationsPlain.mockRejectedValue(new Error('network'));

      await setupOrError();

      expect(replaceSpy).toHaveBeenCalledWith(
        `${utils.config.deployPath}/errorBlocking`
      );
    });
  });

  describe('draftFallbackLoader', () => {
    it('returns null while an auth error is in progress', async () => {
      mocks.isAuthErrorInProgress.mockReturnValue(true);

      await expect(
        draftFallbackLoader(loaderArgs('http://localhost/'))
      ).resolves.toBeNull();
    });

    it('returns null when no organization is selected', async () => {
      await expect(
        draftFallbackLoader(loaderArgs('http://localhost/'))
      ).resolves.toBeNull();
    });

    it('redirects a draft organization to the courtesy page', async () => {
      const draftOrg = buildOrg({ status: OrganizationStatus.DRAFT });
      setOrganizations([draftOrg]);
      setOrganizationId(1);

      await expect(
        draftFallbackLoader(loaderArgs('http://localhost/other'))
      ).rejects.toMatchObject({ status: 302 });
    });

    it('does not redirect when already on the courtesy page', async () => {
      const draftOrg = buildOrg({ status: OrganizationStatus.DRAFT });
      setOrganizations([draftOrg]);
      setOrganizationId(1);
      const draftPath = generatePath(PageRoutes.DRAFT_COURTESY_PAGE, {
        organizationId: '1'
      });

      await expect(
        draftFallbackLoader(loaderArgs(`http://localhost${draftPath}`))
      ).resolves.toBeNull();
    });

    it('does not redirect an active organization', async () => {
      setOrganizations([buildOrg({ status: OrganizationStatus.ACTIVE })]);
      setOrganizationId(1);

      await expect(
        draftFallbackLoader(loaderArgs('http://localhost/other'))
      ).resolves.toBeNull();
      expect(selectedOrganizationState.value?.organizationId).toBe(1);
    });
  });

  it('renders the setup fallback spinner', () => {
    const { container } = render(setupFallback());

    expect(container.firstChild).toBeInTheDocument();
  });
});
