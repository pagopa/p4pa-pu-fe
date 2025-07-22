import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { orgSilServiceExtendedDTOSchema } from '../../generated/zod-schema';
import {
  OrgSilServiceType,
  OrgSilServiceExtendedDTO
} from '../../generated/data-contracts';

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
<<<<<<< Updated upstream
        parseAndLog(z.array(orgSilServiceExtendedDTOSchema), services, true);
=======
        parseAndLog(z.array(orgSilServiceTypeSchema), services, true);
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
export type { orgSilServiceExtendedDTOSchema };
=======
export type { orgSilServiceTypeSchema };
>>>>>>> Stashed changes
export { isValidService };
