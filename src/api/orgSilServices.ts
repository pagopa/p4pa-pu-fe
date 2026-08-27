import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { orgSilServiceExtendedDTOSchema } from '../../generated/core/zod-schema';
import {
  OrgSilServiceType,
  OrgSilServiceExtendedDTO
} from '../../generated/core/data-contracts';

const isValidService = (
  service: OrgSilServiceExtendedDTO
): service is OrgSilServiceExtendedDTO & { orgSilServiceId: number } => {
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
        parseAndLog(z.array(orgSilServiceExtendedDTOSchema), services, true);
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

export type { orgSilServiceExtendedDTOSchema };
export { isValidService };
