import { useQuery } from '@tanstack/react-query';
import utils from '../utils';

export const getDebtPositionTypeDetail = ({
  organizationId,
  debtPositionTypeId
}: {
  organizationId: number;
  debtPositionTypeId: number;
}) =>
  useQuery({
    queryKey: ['getDebtPositionTypeDetail'],
    queryFn: async () => {
      const { data: response } =
        await utils.apiClient.bff.getDebtPositionTypeDetail(
          organizationId,
          debtPositionTypeId
        );
      return response;
    }
  });
