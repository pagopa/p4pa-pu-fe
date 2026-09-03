import { useStore } from '../../../store/GlobalStore';
import orgSilServicesApi from '../../../api/orgSilServices';
import { OrgSilServiceType } from '../../../../generated/core/data-contracts';

export const useOrgSilServices = (serviceType: OrgSilServiceType) => {
  const {
    state: { organizationId }
  } = useStore();

  return orgSilServicesApi.getOrgSilServices(organizationId, serviceType);
};

export const useActualizationServices = () =>
  useOrgSilServices(OrgSilServiceType.ACTUALIZATION);

export const useNotificationServices = () =>
  useOrgSilServices(OrgSilServiceType.PAID_NOTIFICATION_OUTCOME);
