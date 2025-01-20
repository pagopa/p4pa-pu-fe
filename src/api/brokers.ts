import { useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { configFESchema } from '../../generated/zod-schema';

const getBrokersConfig = (options = {}) => {
  return useQuery({
    queryKey: ['brokersConfig'],
    queryFn: async () => {
      const { data: config } = await utils.apiClient.brokers.getBrokerConfig();
      if (config) {
        parseAndLog(configFESchema, { ...config, brokerId: config?.brokerId ?? '' });
      }
      return config;
    },
    ...options
  });
};

export default {
  getBrokersConfig
};
