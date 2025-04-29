import { useEffect } from 'react';
import { useStore } from '../store/GlobalStore';
import utils from '../utils';
import { setOperatorRole } from '../store/OperatorRoleStore';
import { setOrganizationId } from '../store/OrganizationIdStore';

export const useOrganizations = () => {
  const {
    state: { organizationId, idToken }
  } = useStore();

  const { data, ...query } = utils.loaders.getOrganizations();

  useEffect(() => {
    if (data && data.length > 0) {
      const currentOrgExists =
        organizationId &&
        data.some((org) => org.organizationId === organizationId);

      if (!currentOrgExists) {
        const savedOrg = organizationId
          ? data.find((org) => org.organizationId === organizationId)
          : null;

        const idTokenMatchedOrg =
          !savedOrg && idToken
            ? data.find(
                (org) =>
                  org.orgFiscalCode === idToken.organization.fiscal_code &&
                  org.ipaCode === idToken.organization.ipaCode
              )
            : null;

        const orgToSelect = savedOrg || idTokenMatchedOrg || data[0];

        if (orgToSelect) {
          setOrganizationId(orgToSelect.organizationId);
          setOperatorRole(orgToSelect.operatorRole);
        }
      }

      if (query.isError) {
        console.error('Failed to fetch fe config', query.error);
      }
    }
  }, [
    data,
    query.isLoading,
    query.isError,
    query.isSuccess,
    organizationId,
    idToken
  ]);

  return { data, ...query };
};
