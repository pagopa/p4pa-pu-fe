import { renderHook, waitFor } from '../__tests__/renderers';
import utils from '../utils';
import { vi, Mock } from 'vitest';
import { userInfoDTOSchema } from '../../generated/core/zod-schema';
import user from './user';
import { createMock } from 'zodock';

vi.mock('../utils', () => {
  return {
    default: {
      apiClient: {
        bff: {
          getUserInfo: vi.fn()
        }
      }
    }
  };
});

describe('getUserInfo', () => {
  const mockUser = createMock(userInfoDTOSchema);

  it('should return user data when API call is successful', async () => {
    (utils.apiClient.bff.getUserInfo as Mock).mockResolvedValue({
      data: mockUser
    });

    const { result } = renderHook(() => user.getUserInfo());

    await waitFor(() => expect(result.current.data).toEqual(mockUser));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('should not succeed when API call fails', async () => {
    const mockError = new Error('API Error');
    (utils.apiClient.bff.getUserInfo as Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => user.getUserInfo());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(false);
    });
  });
});
