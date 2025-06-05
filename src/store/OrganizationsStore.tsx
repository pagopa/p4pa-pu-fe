import { signal } from '@preact/signals-react';

import { OrganizationDTO } from '../../generated/data-contracts';

// Initialize the persistent store
export const organizationsState = signal<Array<OrganizationDTO>>([]);

// Function to update the organizationId
export function setOrganizations(organizations: Array<OrganizationDTO>) {
  organizationsState.value = organizations;
}
