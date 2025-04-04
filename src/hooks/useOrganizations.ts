import { useEffect } from 'react';
import { useStore } from '../store/GlobalStore';
import utils from '../utils';
import { setOperatorRole } from '../store/OperatorRoleStore';
import { setOrganizationId } from '../store/OrganizationIdStore';

export const useOrganizations = () => {
  const {
    state: { organizationId }
  } = useStore();

  const { data, ...query } = utils.loaders.getOrganizations();

  useEffect(() => {
    if (!organizationId && data) {
      const firstOrganization = data[0];
      setOrganizationId(firstOrganization.organizationId);
      setOperatorRole(firstOrganization.operatorRole);

      if (query.isError) {
        // TODO: Handle error (e.g., show a toast)
        console.error('Failed to fetch fe config', query.error);
      }
    }
  }, [data, query.isLoading, query.isError, query.isSuccess]);

  return { data, ...query };
};
