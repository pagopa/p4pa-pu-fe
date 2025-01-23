import { signal } from '@preact/signals-react';
import { AppState } from '../models/AppState';

export const appState = signal<AppState>({ loading: false });

export function setAppState(newState: AppState) {
  appState.value = newState;
}

export function setLoading(newState: AppState['loading']) {
  appState.value.loading = newState;
}
