import brokers from '../api/brokers';
import user from '../api/user';
import loader from '../utils/loaders';
import { setConfigFe } from '../store/ConfigFeStore';
import { setUserInfo } from '../store/UserInfoStore';
import { idTokenPayloadState } from '../store/IdTokenStore';
import { CircularProgress, Stack } from '@mui/material';
import { setOperatorRole } from '../store/OperatorRoleStore';
import { OrganizationDTO } from '../../generated/apiClient';
import { IdTokenPayload } from '../models/IdTokenPayload';
import {
  selectedOrganizationState,
  setOrganizations
} from '../store/OrganizationsStore';
import {
  organizationIdState,
  setOrganizationId
} from '../store/OrganizationIdStore';
import { setAppState } from '../store/AppStateStore';
import { setupInterceptors } from './interceptors';
import utils from '.';
import { OrganizationStatus } from '../../generated/data-contracts';
import { PageRoutes } from '../routes';
import { generatePath, LoaderFunctionArgs, redirect } from 'react-router';
import { AxiosError } from 'axios';
import navigation from './navigation';

const deployPath = utils.config.deployPath;

const setupOrganizations = (
  orgs: Array<OrganizationDTO>,
  organizationId: number,
  idToken?: IdTokenPayload
) => {
  setOrganizations(orgs);
  const currentOrgExists =
    organizationId && orgs.some((org) => org.organizationId === organizationId);

  if (currentOrgExists) {
    setOrganizationId(organizationId);
    const matchedOrg = orgs.find(
      (org) => org.organizationId === organizationId
    );
    if (matchedOrg) {
      setOperatorRole(matchedOrg.operatorRole);
    }
  }
  if (!currentOrgExists) {
    const savedOrg = organizationId
      ? orgs.find((org) => org.organizationId === organizationId)
      : null;

    const idTokenMatchedOrg =
      !savedOrg && idToken
        ? orgs.find(
            (org) =>
              org.orgFiscalCode === idToken.organization.fiscal_code &&
              org.ipaCode === idToken.organization.ipaCode
          )
        : null;

    const orgToSelect = savedOrg || idTokenMatchedOrg || orgs[0];
    if (orgToSelect) {
      setOrganizationId(orgToSelect.organizationId);
      setOperatorRole(orgToSelect.operatorRole);
    }
  }
};

/** Initial setup function to prepare the application state and necessary config */
const stateSetup = async () => {
  try {
    // configuring Interceptors
    setupInterceptors(utils.apiClient);
    setupInterceptors(utils.fileshareClient);
    // store critical data
    const organizationId = organizationIdState.state.value;
    const idToken = idTokenPayloadState.value;
    const orgs = await loader.getOrganizationsPlain();
    const brokersConfigPlain = await brokers.getBrokersConfigPlain();
    const userInfo = await user.getUserInfoPlain();

    if (!userInfo.brokerId) {
      console.error('User brokerId is missing');
      throw new Error('User brokerId is missing');
      window.location.replace(`${deployPath}/errorBlocking`);
    }

    setUserInfo(userInfo);
    setConfigFe(brokersConfigPlain);
    setupOrganizations(orgs, organizationId, idToken);
    setAppState({ ready: true });
  } catch (error) {
    // 401: interceptor already handled logout/redirect.
    // Exit silently to prevent race condition with other loaders.
    if (error instanceof AxiosError && error.response?.status === 401) {
      return;
    }
    throw error;
  }
};

const setupOrError = async () => {
  try {
    await stateSetup();
  } catch {
    window.location.replace(`${deployPath}/errorBlocking`);
  }
};

const draftFallbackLoader = async ({ request }: LoaderFunctionArgs) => {
  // If there's an auth error in progress, exit silently
  if (navigation.isAuthErrorInProgress()) {
    return null;
  }

  const url = new URL(request.url);
  const currentPath = url.pathname;
  const selectedOrganization = selectedOrganizationState.value;

  // Guard against missing organization (e.g., after failed setup)
  if (!selectedOrganization?.organizationId) {
    return null;
  }

  const draftPath = generatePath(PageRoutes.DRAFT_COURTESY_PAGE, {
    organizationId: selectedOrganization.organizationId
  });

  if (
    selectedOrganization?.status === OrganizationStatus.DRAFT &&
    currentPath !== draftPath
  ) {
    throw redirect(draftPath);
  }

  return null;
};

const appSetup = async (args: LoaderFunctionArgs) => {
  await setupOrError();
  await draftFallbackLoader(args);
};

/** Fallback component to show while stateSetup is in progress */
const setupFallback = () => (
  <Stack justifyContent={'center'} alignItems={'center'} height={'100vh'}>
    <CircularProgress size={40} />
  </Stack>
);

export { setupOrError, setupFallback, draftFallbackLoader, appSetup };
