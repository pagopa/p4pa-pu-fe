import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { dashboardByIuvSchema } from '../../../generated/zod-schema';
import { parseAndLog } from '../../utils/loaders';

export type getDashboardByIuvQuery = Parameters<
  typeof utils.apiClient.bff.getDashboardByIuv
>[1];

export const useDashboardByIuv = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useMutation({
    mutationKey: ['getDashboardByIuv', organizationId],
    mutationFn: async (value: string) => {
      const query: getDashboardByIuvQuery = { iuv: value };

      const { data } = await utils.apiClient.bff.getDashboardByIuv(
        organizationId,
        query
      );

      parseAndLog(dashboardByIuvSchema, data);
      return data;
    }
  });
