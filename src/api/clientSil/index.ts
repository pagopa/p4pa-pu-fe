import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import {
  clientDTOPageSchema,
  clientDTOSchema
} from '../../../generated/zod-schema';
import type { CreateClientRequest } from '../../../generated/data-contracts';
import type { ClientSilFilteredRequest } from './mappings';
import { buildQueryParams } from './mappings';

/**
 * API functions for the management of Client SIL
 */

/**
 * Hook for getting the filtered list of Client SIL
 */
export const getClientSils = ({ organizationId }: { organizationId: number }) =>
  useMutation({
    mutationKey: ['getClientSils', organizationId],
    mutationFn: async (args: ClientSilFilteredRequest) => {
      const queryParams = buildQueryParams(args);

      const { data } = await utils.apiClient.bff.getClients(
        organizationId,
        queryParams,
        {
          paramsSerializer: {
            indexes: null
          }
        }
      );
      parseAndLog(clientDTOPageSchema, data);
      return data;
    }
  });

/**
 * Hook for creating a new Client SIL
 */
export const createClientSil = (organizationId: number) =>
  useMutation({
    mutationKey: ['createClientSil', organizationId],
    mutationFn: async (request: CreateClientRequest) => {
      const { data } = await utils.apiClient.bff.registerClient(
        organizationId,
        request
      );
      parseAndLog(clientDTOSchema, data);
      return data;
    }
  });

export default {
  getClientSils,
  createClientSil
};

/**
 * Hook for getting the details of a specific SIL
 * @param organizationId - Organization ID
 * @param clientId - Cient ID
 * @returns useQuery hook for executing the API call
 */
export const getClientDetail = (organizationId: number, clientId: string) => {
  return useQuery({
    queryKey: ['getClientDetail', organizationId, clientId],
    queryFn: async () => {
      const { data: clientDetail } = await utils.apiClient.bff.getClient(
        organizationId,
        clientId
      );

      parseAndLog(clientDTOSchema, clientDetail);

      return clientDetail;
    }
  });
};
