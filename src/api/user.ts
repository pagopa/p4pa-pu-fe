import { useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { userInfoSchema } from '../../generated/zod-schema';

const getUserInfo = (options = {}) => {
  return useQuery({
    queryKey: ['userInfo'],
    queryFn: async () => {
      const { data: user } = await utils.apiClient.bff.getUserInfo();
      if (user) {
        parseAndLog(userInfoSchema, user);
      }
      return user;
    },
    ...options
  });
};

export default {
  getUserInfo
};
