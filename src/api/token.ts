import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { accessTokenSchema } from '../../generated/zod-schema';

export const postToken = async () => {
    const currentUrl = new URL(window.location.href);
    const idToken = currentUrl.hash.replace('#', '') || '';
  
    try {
      const { data: token } = await utils.apiClient.bff.postToken({idToken});
      
      parseAndLog(accessTokenSchema, token);
      return token;
    } catch {
      return null;
    }
  };