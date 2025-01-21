import { signal } from '@preact/signals-react';
import { ConfigFE } from '../../generated/apiClient';

export const configFeState = signal<ConfigFE | undefined>(undefined);

export function setConfigFe(newState: ConfigFE | undefined) {
  configFeState.value = newState;
}
