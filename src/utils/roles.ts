import { useFeConfig } from '../hooks/useFeConfig';
import { useOrganizations } from '../hooks/useOrganizations';

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

export default {
  useIsSuperAdmin
};
