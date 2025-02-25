import { signal } from '@preact/signals-react';

export const superAdminState = signal<boolean>(false);

export function setSuperAdmin(superAdmin: boolean) {
  superAdminState.value = superAdmin;
}

