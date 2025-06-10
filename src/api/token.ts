import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { accessTokenSchema } from '../../generated/zod-schema';
import navigation from '../utils/navigation';

export const postToken = async () => {
  const currentUrl = new URL(window.location.href);
  const idToken = currentUrl.hash.replace('#', '') || '';
  const { data: token } = await utils.apiClient.bff.postToken({ idToken });
  parseAndLog(accessTokenSchema, token);
  return { token, idToken };
};

export const postTokenOrError = async () => {
  try {
    const response = await postToken();
    return response;
  } catch {
    navigation.setAuthErrorState(true);
    utils.storage.clear();
    return null;
  }
};
