import { useQuery } from '@tanstack/react-query';
import utils from '../utils';

export const getTreasuryDetail = (
  organizationId: number,
  treasuryId: string,
  options = {}
) => {
  return useQuery({
    queryKey: ['treasurydetail', organizationId, treasuryId],
    queryFn: async () => {
      const { data: treasurydetail } =
        await utils.apiClient.bff.getTreasuryDetail(organizationId, treasuryId);
      return treasurydetail;
    },
    retry: false,
    ...options
  });
};
