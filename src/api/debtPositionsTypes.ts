import { useQuery } from '@tanstack/react-query';
import utils from '../utils';

export const getDebtPositionsTypes = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useQuery({
    queryKey: ['getDebtPositionsTypes'],
    queryFn: async () => {
      const { data: response } =
        await utils.apiClient.bff.getDebtPositionTypeOrgs(organizationId);
      return response;
    }
  });
