import { useMutation, useQuery } from '@tanstack/react-query';
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
    },
    // parameters to always fetch new data and avoid re-rendering of fields
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false
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

const deleteOrgSilService = ({ organizationId }: { organizationId: number }) =>
  useMutation({
    mutationKey: ['deleteOrgSilService', organizationId],
    mutationFn: async (orgSilServiceId: number) => {
      const { data } = await utils.apiClient.bff.deleteOrgSilService(
        organizationId,
        orgSilServiceId
      );
      return data;
    }
  });

const updateOrgSilService = ({ organizationId }: { organizationId: number }) =>
  useMutation({
    mutationKey: ['updateOrgSilService', organizationId],
    mutationFn: async (payload: OrgSilServiceDecryptedDTO) => {
      const { data } = await utils.apiClient.bff.updateOrgSilService(
        organizationId,
        payload
      );

      parseAndLog(orgSilServiceDecryptedDTOSchema, data);
      return data;
    }
  });

export default {
  getOrgSilServices,
  getOrgSilServiceById,
  createOrgSilService,
  deleteOrgSilService,
  updateOrgSilService
};
