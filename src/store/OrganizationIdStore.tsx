import { usePersistentSignal } from '../hooks/usePersistentSignal';
import { OrganizationIdMemo } from '../models/Organization';
import { STATE } from './types';

// Initialize the persistent store
export const organizationIdState = usePersistentSignal<OrganizationIdMemo>(
  STATE.ORGANIZATION_ID,
  {
    storage: sessionStorage
  }
);

// Function to update the organizationId
export function setOrganizationId(organizationId: OrganizationIdMemo) {
  organizationIdState.state.value = organizationId;
}
