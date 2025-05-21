import { useFeConfig } from '../hooks/useFeConfig';
import { useOrganizations } from '../hooks/useOrganizations';
import { useStore } from '../store/GlobalStore';

/** this hook returns true if the logged user is a super admin */
const useIsSuperAdmin = () => {
  const organizations = useOrganizations();
  const configFe = useFeConfig();
  const containsBrokerCF = organizations.data?.some(
    (item) => item.orgFiscalCode === configFe?.brokerFiscalCode
  );
  const adminAtLeast = organizations.data?.some(
    (item) => item.operatorRole === 'ROLE_ADMIN'
  );
  const superAdmin = containsBrokerCF && adminAtLeast;
  return superAdmin;
};

/** this hook returns the exact role of the logged user
 *  @returns 'ROLE_ADMIN' | 'ROLE_OPER' | undefined
 */
const useWhichRole = () => {
  const { state } = useStore();
  return state.operatorRole;
};

export default {
  useIsSuperAdmin,
  useWhichRole
};
