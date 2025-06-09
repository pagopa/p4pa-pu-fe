import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { accessTokenSchema } from '../../generated/zod-schema';
import navigation from '../utils/navigation';

export const postToken = async () => {
  const currentUrl = new URL(window.location.href);
  const idToken = currentUrl.hash.replace('#', '') || '';

  try {
    const { data: token } = await utils.apiClient.bff.postToken({ idToken });

    parseAndLog(accessTokenSchema, token);
    return { token, idToken };
  } catch {
    return null;
  }
};

export const postTokenOrError = async () => {
  const response = await postToken();
  if (response == null) {
    navigation.setAuthErrorState(true);
    utils.storage.clear();
    navigation.navigateToLoggedOut();
    return;
  }
  return response;
};
