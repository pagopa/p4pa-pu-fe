import { refreshToken as requestRefreshToken } from '@core/api/token';
import type { AccessToken } from '../../generated/core/data-contracts';

export const refreshToken = async (): Promise<AccessToken> => {
  const currentRefreshToken = window.localStorage.getItem('refreshToken') || '';

  const newTokens = await requestRefreshToken(currentRefreshToken);
  window.localStorage.setItem('accessToken', newTokens.access_token);
  window.localStorage.setItem('refreshToken', newTokens.refresh_token || '');
  return newTokens;
};
export default refreshToken;
