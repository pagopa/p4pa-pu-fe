import { useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { configFESchema } from '../../generated/zod-schema';

export const getBrokersConfig = () => {
  return useQuery({
    queryKey: ['brokersConfig'],
    queryFn: async () => {
      const { data: config } = await utils.apiClient.brokers.getBrokerConfig();
      if (config) {
        parseAndLog(configFESchema, config);
      }
      return config;
    }
  });
};

export default {
  getBrokersConfig
};
