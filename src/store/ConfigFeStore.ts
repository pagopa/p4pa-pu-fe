import { signal } from '@preact/signals-react';
import { ConfigFE } from '../../generated/apiClient';

// Initialize the persistent store
export const configFeState = signal<ConfigFE | undefined>(undefined);

// Function to update the user info
export function setConfigFe(newState: ConfigFE | undefined) {
  configFeState.value = newState;
}
