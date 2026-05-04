import utils from '../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { accessTokenSchema } from '../../generated/zod-schema';
import { createMock } from 'zodock';
import { postTokenOrError } from './token';

vi.mock('./utils', () => {
  const originalModule = vi.importActual('utils');
  return {
    ...originalModule,
    apiClient: {
      bff: {
        token: {
          postToken: vi.fn()
        }
      }
    }
  };
});

describe('get Token API ', () => {
  const fakeSelfCareToken = '123456789abc';

  it('returns Token correctly', async () => {
    globalThis.location = {
      ...globalThis.location,
      href: `http://sito.it/auth-callback#${fakeSelfCareToken}`
    };

    const dataMock = createMock(accessTokenSchema);

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'postToken')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);
    const result = await postTokenOrError();

    expect(apiMock).toHaveBeenCalledWith({ idToken: fakeSelfCareToken });
    expect(result).toEqual({ token: dataMock, idToken: fakeSelfCareToken });
  });

  it('should return null on failure', async () => {
    globalThis.location = {
      ...globalThis.location,
      href: 'https://sito.it/auth-callback'
    };

    vi.mocked(utils.apiClient.bff.postToken).mockRejectedValue(new Error());
    const result = await postTokenOrError();

    expect(result).toBe(null);
  });
});
