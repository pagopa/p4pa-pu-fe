import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { SaveDebtPositionTypeOrgDTO } from '../../generated/data-contracts';
import { debtPositionTypeOrgSchema } from '../../generated/zod-schema';
import { parseAndLog } from '../utils/loaders';

export const getDebtPositionTypeOrgs = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useQuery({
    queryKey: ['getDebtPositionTypeOrgs', organizationId],
    queryFn: async () => {
      const { data: response } =
        await utils.apiClient.bff.getDebtPositionTypeOrgs(organizationId);
      return response;
    }
  });

export type CreateDebtPositionTypeOrg = {
  organizationId: number;
  data: SaveDebtPositionTypeOrgDTO;
};

export const createDebtPositionTypeOrg = () =>
  useMutation({
    mutationKey: ['postDebtPositionTypeOrg'],
    mutationFn: async (query: CreateDebtPositionTypeOrg) => {
      const { data } = await utils.apiClient.bff.createDebtPositionTypeOrg(
        query.organizationId,
        query.data
      );
      parseAndLog(debtPositionTypeOrgSchema, data);
      return data;
    }
  });
