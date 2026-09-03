import { computed, signal } from '@preact/signals-react';

import { OrganizationDTO } from '../../generated/core/data-contracts';
import { organizationIdState } from './OrganizationIdStore';

// Initialize the persistent store
export const organizationsState = signal<Array<OrganizationDTO>>([]);

// Function to update the organizationId
export function setOrganizations(organizations: Array<OrganizationDTO>) {
  organizationsState.value = organizations;
}

export const selectedOrganizationState = computed(() => {
  const organizationId = organizationIdState.state.value;
  const organizations = organizationsState.value;

  const selected = organizations.find(
    (org) => org.organizationId === organizationId
  );

  return selected;
});
