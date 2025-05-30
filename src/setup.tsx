import { useEffect, useState } from 'react';
import brokers from './api/brokers';
import user from './api/user';
import loader from './utils/loaders';
import { setConfigFe } from './store/ConfigFeStore';
import { setupOrganizations } from './hooks/useOrganizations';
import { useStore } from './store/GlobalStore';
import { setUserInfo } from './store/UserInfoStore';
import { organizationIdState } from './store/OrganizationIdStore';
import { idTokenPayloadState } from './store/IdTokenStore';
import { setupInterceptors } from './utils/interceptors';
import utils from './utils';

const useSetup = () => {
  const [ready, setReady] = useState(false);
  const {
    state: { organizationId, idToken }
  } = useStore();
  useEffect(() => {
    (async () => {
      try {
        const orgs = await loader.getOrganizationsPlain();
        const brokersConfigPlain = await brokers.getBrokersConfigPlain();
        const userInfo = await user.getUserInfoPlain();

        setUserInfo(userInfo);
        setConfigFe(brokersConfigPlain);
        setupOrganizations(orgs, organizationId, idToken);
        setReady(true);
      } catch (error) {
        console.error('Setup failed:', error);
      }
    })();
  }, []);

  return ready;
};

/** Initial setup function to prepare the application state and necessary config */
const setup = async () => {
  // configuring Interceptors
  setupInterceptors(utils.apiClient);
  setupInterceptors(utils.fileshareClient);

  // store critical data
  const organizationId = organizationIdState.state.value;
  const idToken = idTokenPayloadState.value;
  console.log(
    'Setting up with organizationId:',
    organizationId,
    'and idToken:',
    idToken
  );
  const orgs = await loader.getOrganizationsPlain();
  const brokersConfigPlain = await brokers.getBrokersConfigPlain();
  const userInfo = await user.getUserInfoPlain();
  await (() => new Promise((resolve) => setTimeout(resolve, 10000)))(); // Simulate delay

  setUserInfo(userInfo);
  setConfigFe(brokersConfigPlain);
  setupOrganizations(orgs, organizationId, idToken);
};

const fakeSetup = () => new Promise((_resolve) => setTimeout(_resolve, 10000)); // Simulate delay

export { useSetup, setup, fakeSetup };
