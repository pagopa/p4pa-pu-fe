import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useFeConfig } from './useFeConfig';
import brokers from '../api/brokers';
import { StoreProvider } from '../store/GlobalStore';
import { configFeState } from '../store/ConfigFeStore';
import { ConfigFE } from '../../generated/apiClient';
import { act } from 'react';
import { appState } from '../store/AppStateStore';
import { renderHook } from '../__tests__/renderers';

vi.mock('../api/brokers', () => ({
  default: {
    getBrokersConfig: vi.fn(() => ({
      data: undefined,
      isLoading: false,
      isError: false,
      isSuccess: false
    }))
  }
}));

describe('useFeConfig hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configFeState.value = undefined;
  });

  it('should return existing configFe if already set', () => {
    // Set an initial configFe value
    configFeState.value = { key: 'value' } as unknown as ConfigFE;

    const { result } = renderHook(() => useFeConfig(), {
      wrapper: StoreProvider
    });

    expect(result.current).toEqual({ key: 'value' });
  });

  it('should fetch config when configFe is not set', async () => {
    const mockData = { key: 'newValue' };

    (brokers.getBrokersConfig as Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      isSuccess: true
    });

    const { result, rerender } = renderHook(() => useFeConfig(), {
      wrapper: StoreProvider
    });

    expect(result.current).toBeUndefined();

    await act(async () => {
      configFeState.value = mockData as unknown as ConfigFE;
      rerender(); // Rerender the hook to reflect state change
    });

    expect(result.current).toEqual(mockData);
  });

  it('should set loading state when fetching config', async () => {
    (brokers.getBrokersConfig as Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      isSuccess: false
    });

    expect(appState.value.loading).toBeFalsy();

    renderHook(() => useFeConfig(), { wrapper: StoreProvider });

    expect(appState.value.loading).toBe(true);
  });

  it('should log error when fetching config fails', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    (brokers.getBrokersConfig as Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      isSuccess: false
    });

    renderHook(() => useFeConfig(), {
      wrapper: StoreProvider
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch fe config', undefined);

    consoleErrorSpy.mockRestore();
  });
});
