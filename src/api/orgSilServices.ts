import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { orgSilServiceSchema } from '../../generated/zod-schema';
import {
  OrgSilServiceType,
  OrgSilService
} from '../../generated/data-contracts';

const isValidService = (
  service: OrgSilService
): service is OrgSilService & { orgSilServiceId: number } => {
  return service.orgSilServiceId != null && service.orgSilServiceId > 0;
};

const getOrgSilServices = (
  organizationId: number,
  serviceType: OrgSilServiceType
) => {
  return useQuery({
    queryKey: ['org-sil-services', organizationId, serviceType],
    queryFn: async () => {
      const { data: services } = await utils.apiClient.bff.getOrgSilServices(
        organizationId,
        { serviceType }
      );

      try {
        parseAndLog(z.array(orgSilServiceSchema), services, true);
        const validServices = services.filter(isValidService);
        return validServices;
      } catch {
        return [];
      }
    },
    enabled: !!organizationId,
    retry: 1
  });
};

const getNotificationServices = (organizationId: number) => {
  return getOrgSilServices(
    organizationId,
    OrgSilServiceType.PAID_NOTIFICATION_OUTCOME
  );
};

const getActualizationServices = (organizationId: number) => {
  return getOrgSilServices(organizationId, OrgSilServiceType.ACTUALIZATION);
};

export default {
  getOrgSilServices,
  getNotificationServices,
  getActualizationServices
};

export type { OrgSilService };
export { isValidService };
