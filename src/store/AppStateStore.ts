import { signal } from '@preact/signals-react';
import { AppState } from '../models/AppState';
import { BredcrumbItem } from '../components/Breadcrumbs/Breadcrumbs';

export const appState = signal<AppState>({
  loading: false,
  customBreadcrumbsItems: [],
  ready: false,
  announcement: ''
});

export function setAppState(newState: Partial<AppState>) {
  appState.value = { ...appState.value, ...newState };
}

export function setLoading(newState: AppState['loading']) {
  appState.value.loading = newState;
}

export function setCustomBreadcrumbsItems(newState: Array<BredcrumbItem>) {
  appState.value = { ...appState.value, customBreadcrumbsItems: newState };
}

export function setAnnouncement(newState: string) {
  appState.value = { ...appState.value, announcement: newState };
}
