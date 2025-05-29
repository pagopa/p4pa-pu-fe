import { useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { userInfoSchema } from '../../generated/zod-schema';

const getUserInfoPlain = async () => {
  const { data: user } = await utils.apiClient.bff.getUserInfo();
  if (user) {
    parseAndLog(userInfoSchema, user);
  }
  return user;
};

const getUserInfo = (options = {}) => {
  return useQuery({
    queryKey: ['userInfo'],
    queryFn: getUserInfoPlain,
    ...options
  });
};

export default {
  getUserInfo,
  getUserInfoPlain
};
