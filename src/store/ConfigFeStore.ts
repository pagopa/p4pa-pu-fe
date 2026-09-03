import { signal } from '@preact/signals-react';
import { ConfigFE } from '../../generated/core/client';

export const configFeState = signal<ConfigFE | undefined>(undefined);

export function setConfigFe(newState: ConfigFE | undefined) {
  configFeState.value = newState;
}
