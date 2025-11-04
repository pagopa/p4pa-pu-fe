import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import {
  dashboardByIufSchema,
  dashboardByIuvSchema
} from '../../../generated/zod-schema';
import { parseAndLog } from '../../utils/loaders';

export type getDashboardByIuvQuery = Parameters<
  typeof utils.apiClient.bff.getDashboardByIuv
>[1];

export type getDashboardByIufQuery = Parameters<
  typeof utils.apiClient.bff.getDashboardByIuf
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

export const useDashboardByIuf = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useMutation({
    mutationKey: ['useDashboardByIuf', organizationId],
    mutationFn: async (value: string) => {
      const query: getDashboardByIufQuery = { iuf: value };

      const { data } = await utils.apiClient.bff.getDashboardByIuf(
        organizationId,
        query
      );

      parseAndLog(dashboardByIufSchema, data);
      return data;
    }
  });
