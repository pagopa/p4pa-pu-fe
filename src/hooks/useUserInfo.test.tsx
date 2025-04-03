import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useUserInfo } from './useUserInfo';
import user from '../api/user';
import { StoreProvider } from '../store/GlobalStore';
import { UserInfo } from '../../generated/apiClient';
import { act } from 'react';
import { appState } from '../store/AppStateStore';
import { renderHook } from '../__tests__/renderers';
import { userInfoState } from '../store/UserInfoStore';

vi.mock('../api/user', () => ({
  default: {
    getUserInfo: vi.fn(() => ({
      data: undefined,
      isLoading: false,
      isError: false,
      isSuccess: false
    }))
  }
}));

describe('useUserInfo hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userInfoState.value = undefined;
  });

  it('should return existing userInfo if already set', () => {
    // Set an initial userInfo value
    userInfoState.value = { key: 'value' } as unknown as UserInfo;

    const { result } = renderHook(() => useUserInfo(), {
      wrapper: StoreProvider
    });

    expect(result.current).toEqual({ key: 'value' });
  });

  it('should fetch data when userInfo is not set', async () => {
    const mockData = { key: 'newValue' };

    (user.getUserInfo as Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      isSuccess: true
    });

    const { result, rerender } = renderHook(() => useUserInfo(), {
      wrapper: StoreProvider
    });

    expect(result.current).toBeUndefined();

    await act(async () => {
      userInfoState.value = mockData as unknown as UserInfo;
      rerender(); // Rerender the hook to reflect state change
    });

    expect(result.current).toEqual(mockData);
  });

  it('should set loading state when fetching data', async () => {
    (user.getUserInfo as Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      isSuccess: false
    });

    expect(appState.value.loading).toBeFalsy();

    renderHook(() => useUserInfo(), { wrapper: StoreProvider });

    expect(appState.value.loading).toBe(true);
  });

  it('should log error when fetching data fails', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => null);

    (user.getUserInfo as Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      isSuccess: false
    });

    renderHook(() => useUserInfo(), {
      wrapper: StoreProvider
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to fetch user info',
      undefined
    );

    consoleErrorSpy.mockRestore();
  });
});
