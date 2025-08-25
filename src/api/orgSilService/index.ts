import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import {
  orgSilServiceDecryptedDTOSchema,
  pagedOrgSilServiceViewSchema
} from '../../../generated/zod-schema';
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

const getOrgSilServiceById = ({
  organizationId,
  orgSilServiceId
}: {
  organizationId: number;
  orgSilServiceId: number;
}) =>
  useQuery({
    queryKey: ['orgSilService', organizationId, orgSilServiceId],
    queryFn: async () => {
      const { data } = await utils.apiClient.bff.getOrgSilServiceDetails(
        organizationId,
        orgSilServiceId
      );

      parseAndLog(orgSilServiceDecryptedDTOSchema, data);
      return { response: data };
    }
  });

export default {
  getOrgSilServices,
  getOrgSilServiceById
};
