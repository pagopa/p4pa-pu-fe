import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import { pagedOrgSilServiceViewSchema } from '../../../generated/zod-schema';
import { buildQueryParams, OrgSilServicesFilteredRequest } from './mappings';

const getOrgSilServices = ({ organizationId }: { organizationId: number }) =>
  useMutation({
    mutationKey: ['getOrgSilServices', organizationId],
    mutationFn: async (args: OrgSilServicesFilteredRequest) => {
      const query = buildQueryParams(args);
      const { data } = await utils.apiClient.bff.getOrgSilServicesByFilters(
        organizationId,
        query
      );

      parseAndLog(pagedOrgSilServiceViewSchema, data);
      return data;
    }
  });

export default {
  getOrgSilServices
};
