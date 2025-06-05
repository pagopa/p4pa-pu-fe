import { useStore } from '../store/GlobalStore';

/** this hook returns true if the logged user is a super admin */
const useIsSuperAdmin = () => {
  const { state } = useStore();
  const role = useWhichRole();
  const organizations = state.organizations;
  const configFe = state.configFe;
  const containsBrokerCF = organizations?.some(
    (org) => org.orgFiscalCode === configFe?.brokerFiscalCode
  );
  const superAdmin = containsBrokerCF && role == 'ROLE_ADMIN';
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
