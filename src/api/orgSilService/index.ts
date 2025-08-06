import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import {
  orgSilServiceDecryptedDTOSchema,
  pagedOrgSilServiceViewSchema
} from '../../../generated/zod-schema';
import { buildQueryParams, OrgSilServicesFilteredRequest } from './mappings';
import { OrgSilServiceDecryptedDTO } from '../../../generated/apiClient';

const getOrgSilServices = ({ organizationId }: { organizationId: number }) =>
  useMutation({
    mutationKey: ['getOrgSilServices', organizationId],
    mutationFn: async (args: OrgSilServicesFilteredRequest) => {
      const query = buildQueryParams(args);
      const { data } = await utils.apiClient.bff.getOrgSilServicesByFilters(
        organizationId,
        query,
        {
          paramsSerializer: {
            indexes: null
          }
        }
      );

      parseAndLog(pagedOrgSilServiceViewSchema, data);
      return data;
    }
  });

const createOrgSilService = ({ organizationId }: { organizationId: number }) =>
  useMutation({
    mutationKey: ['createOrgSilService', organizationId],
    mutationFn: async (payload: OrgSilServiceDecryptedDTO) => {
      const { data } = await utils.apiClient.bff.createOrgSilService(
        organizationId,
        payload
      );

      parseAndLog(orgSilServiceDecryptedDTOSchema, data);
      return data;
    }
  });

export default {
  getOrgSilServices,
  createOrgSilService
};
