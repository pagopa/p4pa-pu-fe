import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { SaveDebtPositionTypeOrgDTO } from '../../generated/core/data-contracts';
import {
  debtPositionTypeOrgSchema,
  saveDebtPositionTypeOrgDTOSchema
} from '../../generated/core/zod-schema';
import { parseAndLog } from '../utils/loaders';
import { AxiosError } from 'axios';

export const getDebtPositionTypeOrgs = ({
  organizationId,
  flagActive
}: {
  organizationId: number;
  flagActive?: boolean;
}) =>
  useQuery({
    queryKey: ['getDebtPositionTypeOrgs', organizationId, flagActive],
    queryFn: async () => {
      const { data: response } =
        await utils.apiClient.bff.getDebtPositionTypeOrgs(
          organizationId,
          flagActive !== undefined ? { flagActive } : undefined
        );
      return response;
    }
  });

export const getDebtPositionTypeOrgById = ({
  organizationId,
  debtPositionTypeOrgId
}: {
  organizationId: number;
  debtPositionTypeOrgId: number;
}) =>
  useQuery({
    queryKey: [
      'getDebtPositionTypeOrgs',
      organizationId,
      debtPositionTypeOrgId
    ],
    queryFn: async () =>
      await utils.apiClient.bff.getDebtPositionTypeOrgById(
        organizationId,
        debtPositionTypeOrgId
      ),
    select: ({ data }) => {
      parseAndLog(debtPositionTypeOrgSchema, data);
      const optionsMap = [
        {
          value: data.debtPositionTypeOrgId,
          label: data.description
        }
      ];

      return { response: data, optionsMap };
    },
    enabled: !!debtPositionTypeOrgId && !!organizationId
  });

export type CreateDebtPositionTypeOrg = {
  organizationId: number;
  data: SaveDebtPositionTypeOrgDTO;
};

export const createDebtPositionTypeOrg = () =>
  useMutation({
    mutationKey: ['postDebtPositionTypeOrg'],
    mutationFn: async (query: CreateDebtPositionTypeOrg) => {
      parseAndLog(saveDebtPositionTypeOrgDTOSchema, query.data);
      const { data } = await utils.apiClient.bff.createDebtPositionTypeOrg(
        query.organizationId,
        query.data
      );
      parseAndLog(debtPositionTypeOrgSchema, data);
      return data;
    }
  });

export type UpdateDebtPositionTypeOrg = {
  organizationId: number;
  debtPositionTypeOrgId: number;
  data: SaveDebtPositionTypeOrgDTO;
};

export const updateDebtPositionTypeOrg = () =>
  useMutation({
    mutationKey: ['updateDebtPositionTypeOrg'],
    mutationFn: async (query: UpdateDebtPositionTypeOrg) => {
      parseAndLog(saveDebtPositionTypeOrgDTOSchema, query.data);
      const { data } = await utils.apiClient.bff.updateDebtPositionTypeOrg(
        query.organizationId,
        query.debtPositionTypeOrgId,
        query.data
      );
      parseAndLog(debtPositionTypeOrgSchema, data);
      return data;
    }
  });

export type UpdateFlagActiveDebtPositionTypeOrg = {
  organizationId: number;
  debtPositionTypeOrgId: number;
  flagActive: boolean;
};

export const updateFlagActiveDebtPositionTypeOrg = (
  onSuccess?: () => void,
  onError?: (error: AxiosError) => void
) =>
  useMutation({
    mutationKey: ['updateFlagActiveDebtPositionTypeOrg'],
    mutationFn: async (query: UpdateFlagActiveDebtPositionTypeOrg) => {
      await utils.apiClient.bff.updateFlagActiveDebtPositionTypeOrg(
        query.organizationId,
        query.debtPositionTypeOrgId,
        { flagActive: query.flagActive }
      );
    },
    onSuccess,
    onError
  });
