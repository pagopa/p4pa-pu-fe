import { useMutation } from '@tanstack/react-query';
import utils from '../utils';
  
export const getPagedOrgSubUnits = (
  organizationId: number,
) => {
  return useMutation({
    mutationKey: ['getPagedOrgSubUnits', organizationId],
    mutationFn: async (args: any) => {
      const query = {
        ...args.filters,
        ...args.pagination,
        sort: args.sort
      };

      try {
        const { data } = await utils.apiClient.bff.getPagedOrgSubUnits(
          organizationId,
          query
        );
        return data;
      } catch (error) {
        // TODO: status error should be handled in an interceptor;
        console.error(error);
        return;
      }
    }
  });
};