import { describe, it, vi, expect } from 'vitest';
import { AppState } from '../models/AppState';
import { appState, setAppState, setLoading } from './AppStateStore';

vi.mock('@preact/signals-react', async () => {
  const actual =
    await vi.importActual<typeof import('@preact/signals-react')>('@preact/signals-react');
  return {
    ...actual,
    signal: vi.fn(actual.signal)
  };
});

describe('AppState Store', () => {
  it('should initialize appState with the default value', () => {
    expect(appState.value).toEqual({ loading: false });
  });

  it('setAppState should update the appState to the provided new state', () => {
    const newState: AppState = { loading: true };
    setAppState(newState);

    expect(appState.value).toEqual(newState);
  });

  it('setLoading should update only the loading property in appState', () => {
    const initialState: AppState = { loading: false };
    appState.value = initialState; // Reset the state for this test

    setLoading(true);

    expect(appState.value).toEqual({ loading: true });
  });
});
