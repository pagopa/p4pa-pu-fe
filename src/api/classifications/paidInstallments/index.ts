import { useMutation } from '@tanstack/react-query';
import utils from '../../../utils';
import { buildQueryParams, PaidInstallmentsFilteredRequest } from './mappings';
import { pagedClassificationPaidInstallmentsViewSchema } from '../../../../generated/zod-schema';
import { parseAndLog } from '../../../utils/loaders';

/**
 * Hook to retrieve the paid installments of an organization
 *
 * @param organizationId - Organization ID
 * @returns useMutation hook to execute the API call
 */
export const getPaidInstallments = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useMutation({
    mutationKey: ['getPaidInstallments', organizationId],
    mutationFn: async (args: PaidInstallmentsFilteredRequest) => {
      const query = buildQueryParams(args);

      const { data } = await utils.apiClient.bff.getPaidInstallments(
        organizationId,
        query,
        {
          paramsSerializer: {
            indexes: null
          }
        }
      );
      parseAndLog(pagedClassificationPaidInstallmentsViewSchema, data);
      return data;
    }
  });
