import { useEffect, useState } from 'react';
import brokers from './api/brokers';
import user from './api/user';
import loader from './utils/loaders';
import { setConfigFe } from './store/ConfigFeStore';
import { setupOrganizations } from './hooks/useOrganizations';
import { useStore } from './store/GlobalStore';
import { setUserInfo } from './store/UserInfoStore';

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

export default useSetup;
