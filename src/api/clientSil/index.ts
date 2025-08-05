import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import { clientDTOPageSchema, clientDTOSchema } from '../../../generated/zod-schema';
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
