import { useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { configFESchema } from '../../generated/zod-schema';

const getBrokersConfig = (options = {}) => {
  return useQuery({
    queryKey: ['brokersConfig'],
    queryFn: async () => {
      const { data: config } = await utils.apiClient.bff.getBrokerConfig();
      if (config) {
        parseAndLog(configFESchema, config);
      }
      return config;
    },
    retry: 2,
    ...options
  });
};

export default {
  getBrokersConfig
};
