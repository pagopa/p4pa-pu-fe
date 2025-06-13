import { useStore } from '../../../store/GlobalStore';
import orgSilServicesApi from '../../../api/orgSilServices';

export const useNotificationConfigurations = () => {
  const {
    state: { organizationId }
  } = useStore();

  return orgSilServicesApi.getNotificationServices(organizationId);
};
