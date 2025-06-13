import { useStore } from '../../../store/GlobalStore';
import orgSilServicesApi from '../../../api/orgSilServices';

export const useActualizationConfigurations = () => {
  const {
    state: { organizationId }
  } = useStore();

  return orgSilServicesApi.getActualizationServices(organizationId);
};
