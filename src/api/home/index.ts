import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import {
  dashboardByIuvSchema,
  dashboardByFcSchema
} from '../../../generated/zod-schema';
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

export type getDashboardByFiscalCodeQuery = Parameters<
  typeof utils.apiClient.bff.getDashboardByFiscalCode
>[1];

export const useDashboardByFiscalCode = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useMutation({
    mutationKey: ['getDashboardByFiscalCode', organizationId],
    mutationFn: async (value: string) => {
      const query: getDashboardByFiscalCodeQuery = { fiscalCode: value };

      const { data } = await utils.apiClient.bff.getDashboardByFiscalCode(
        organizationId,
        query
      );

      parseAndLog(dashboardByFcSchema, data);
      return data;
    }
  });
