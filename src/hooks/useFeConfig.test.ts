import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useFeConfig } from './useFeConfig';
import brokers from '../api/brokers';
import { setLoading } from '../store/AppStateStore';
import { setConfigFe } from '../store/ConfigFeStore';
import { useStore } from '../store/GlobalStore';
import { ConfigFE } from '../../generated/apiClient';
import { State } from '../store/types';

vi.mock('../api/brokers', () => ({
  default: {
    getBrokersConfig: vi.fn()
  }
}));
vi.mock('../store/AppStateStore', () => ({
  setLoading: vi.fn()
}));
vi.mock('../store/ConfigFeStore', () => ({
  setConfigFe: vi.fn()
}));
vi.mock('../store/GlobalStore', () => ({
  useStore: vi.fn()
}));

describe('useFeConfig', () => {
  it('should return configFe from the store when it is already set', () => {
    const mockConfigFe = { key: 'value' };
    vi.mocked(useStore).mockReturnValue({
      state: { configFe: mockConfigFe as unknown as ConfigFE } as unknown as State,
      setState: vi.fn()
    });
    vi.mocked(brokers.getBrokersConfig).mockReturnValue({
      data: null as unknown as ConfigFE,
      isLoading: false,
      isError: false,
      isSuccess: false
    } as unknown as ReturnType<typeof brokers.getBrokersConfig>);

    const { result } = renderHook(useFeConfig);

    expect(result.current).toEqual(mockConfigFe);
    expect(brokers.getBrokersConfig).toHaveBeenCalledWith({ enabled: false });
  });

  it('should fetch config when configFe is not set', () => {
    const mockData = { key: 'newValue' };
    vi.mocked(useStore).mockReturnValue({
      state: { configFe: null as unknown as ConfigFE } as unknown as State,
      setState: vi.fn()
    });

    vi.mocked(brokers.getBrokersConfig).mockReturnValue({
      data: mockData as unknown as ConfigFE,
      isLoading: false,
      isError: false,
      isSuccess: true
    } as ReturnType<typeof brokers.getBrokersConfig>);

    const { result } = renderHook(useFeConfig);

    expect(result.current).toBeNull();
    expect(setConfigFe).toHaveBeenCalledWith(mockData);
  });

  it('should set loading state when fetching config', () => {
    vi.mocked(useStore).mockReturnValue({
      state: { configFe: null as unknown as ConfigFE } as unknown as State,
      setState: vi.fn()
    });
    vi.mocked(brokers.getBrokersConfig).mockReturnValue({
      data: null as unknown as ConfigFE,
      isLoading: true,
      isError: false,
      isSuccess: false
    } as unknown as ReturnType<typeof brokers.getBrokersConfig>);

    renderHook(useFeConfig);
    const { result } = renderHook(useStore);

    expect(result.current.setState).toHaveBeenCalledWith(['appState', 'loading'], {
      loading: true
    });
    expect(setConfigFe).not.toHaveBeenCalled();
  });

  it('should log error when fetching config fails', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(useStore).mockReturnValue({
      state: { configFe: null as unknown as ConfigFE } as unknown as State,
      setState: vi.fn()
    });
    vi.mocked(brokers.getBrokersConfig).mockReturnValue({
      data: null as unknown as ConfigFE,
      isLoading: false,
      isError: true,
      isSuccess: false
    } as unknown as ReturnType<typeof brokers.getBrokersConfig>);

    renderHook(useFeConfig);

    expect(setLoading).toHaveBeenCalledWith(false);
    expect(setConfigFe).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch fe config');

    consoleErrorSpy.mockRestore();
  });
});
