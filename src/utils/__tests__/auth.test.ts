import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AccessToken } from '../../../generated/core/data-contracts';
import { refreshToken as requestRefreshToken } from '@core/api/token';
import refreshToken from '../auth';

vi.mock('@core/api/token', () => ({
  refreshToken: vi.fn()
}));

describe('refreshToken utility', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('requests new tokens and persists them', async () => {
    const currentRefreshToken = 'current-refresh-token';
    const newTokens: AccessToken = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      token_type: 'Bearer',
      expires_in: 3600
    };
    vi.mocked(requestRefreshToken).mockResolvedValue(newTokens);
    window.localStorage.setItem('refreshToken', currentRefreshToken);

    const result = await refreshToken();

    expect(requestRefreshToken).toHaveBeenCalledWith(currentRefreshToken);
    expect(window.localStorage.getItem('accessToken')).toBe(
      newTokens.access_token
    );
    expect(window.localStorage.getItem('refreshToken')).toBe(
      newTokens.refresh_token
    );
    expect(result).toBe(newTokens);
  });

  it('uses an empty refresh token when none is stored or returned', async () => {
    const newTokens: AccessToken = {
      access_token: 'new-access-token',
      token_type: 'Bearer',
      expires_in: 3600
    };
    vi.mocked(requestRefreshToken).mockResolvedValue(newTokens);

    await refreshToken();

    expect(requestRefreshToken).toHaveBeenCalledWith('');
    expect(window.localStorage.getItem('refreshToken')).toBe('');
  });

  it('propagates errors from the refresh-token request', async () => {
    const error = new Error('Refresh failed');
    vi.mocked(requestRefreshToken).mockRejectedValue(error);

    await expect(refreshToken()).rejects.toBe(error);
    expect(window.localStorage.getItem('accessToken')).toBeNull();
    expect(window.localStorage.getItem('refreshToken')).toBeNull();
  });
});
