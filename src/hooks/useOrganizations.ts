import { useEffect } from 'react';
import { useStore } from '../store/GlobalStore';
import utils from '../utils';
import { setOperatorRole } from '../store/OperatorRoleStore';
import { setOrganizationId } from '../store/OrganizationIdStore';
import { OrganizationDTO } from '../../generated/apiClient';
import { IdTokenPayload } from '../models/IdTokenPayload';

export const setupOrganizations = (
  orgs: Array<OrganizationDTO>,
  organizationId: number,
  idToken?: IdTokenPayload
) => {
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

export const useOrganizations = () => {
  const {
    state: { organizationId, idToken }
  } = useStore();

  const { data, ...query } = utils.loaders.getOrganizations();

  useEffect(() => {
    if (data && data.length > 0) {
      setupOrganizations(data, organizationId, idToken);
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
