import { useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { configFESchema } from '../../generated/core/zod-schema';

const getBrokersConfigPlain = async () => {
  const { data: config } = await utils.apiClient.bff.getBrokerConfig();
  if (config) {
    parseAndLog(configFESchema, config);
  }
  return config;
};

const getBrokersConfig = (options = {}) => {
  return useQuery({
    queryKey: ['brokersConfig'],
    queryFn: getBrokersConfigPlain,
    retry: 2,
    ...options
  });
};

export default {
  getBrokersConfig,
  getBrokersConfigPlain
};
