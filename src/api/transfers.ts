import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { transferDTOSchema } from '../../generated/core/zod-schema';
import { RequestParams } from '../../generated/core/client';

export type ValidateTaxonomyCategoryParams = {
  orgFiscalCode: string;
  taxonomyCategory?: string;
};

export const getTransfers = (organizationId: number, installmentId: number) => {
  return useQuery({
    queryKey: ['transfersQuery', organizationId, installmentId],
    queryFn: async () => {
      const { data: transfers } = await utils.apiClient.bff.getTransfers(
        organizationId,
        { installmentId }
      );
      if (transfers) {
        transfers.forEach((transfer) =>
          parseAndLog(transferDTOSchema, transfer)
        );
      }
      return transfers;
    },
    enabled: !!organizationId && !!installmentId
  });
};

export const validateTaxonomyCategory = () => {
  return useMutation({
    mutationKey: ['validateTaxonomyCategory'],
    mutationFn: async ({
      data,
      params
    }: {
      data: ValidateTaxonomyCategoryParams;
      params?: RequestParams;
    }) => {
      const response = await utils.apiClient.bff.validateTaxonomyCategory(
        data,
        params
      );

      return response;
    }
  });
};
