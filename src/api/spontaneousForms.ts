import { useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { spontaneousFormSchema } from '../../generated/zod-schema';

export type SpontaneousForm = {
  spontaneousFormId?: number;
  code: string;
};

export const getSpontaneousForms = (organizationId: number, enabled = true) =>
  useQuery({
    queryKey: ['getSpontaneousForms', organizationId],
    queryFn: async () => {
      const { data } =
        await utils.apiClient.bff.getSpontaneousForms(organizationId);
      parseAndLog(spontaneousFormSchema.array(), data);
      return data;
    },
    enabled: !!organizationId && enabled
  });
