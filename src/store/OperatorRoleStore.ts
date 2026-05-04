import { computed, signal } from '@preact/signals-react';
import { ExtendedOperatoRole } from '../models/OperatorRole';
import { organizationsState } from './OrganizationsStore';
import { configFeState } from './ConfigFeStore';
import { OperatorRole } from '../../generated/data-contracts';

export const operatorRoleState = signal<OperatorRole>();

export function setOperatorRole(operatorRole: OperatorRole) {
  operatorRoleState.value = operatorRole;
}

export const operatorComputedRole = computed<ExtendedOperatoRole>(() => {
  const role = operatorRoleState.value as OperatorRole;
  const organizations = organizationsState.value;
  const configFe = configFeState.value;

  const containsBrokerCF = organizations?.some(
    (org) => org.orgFiscalCode === configFe?.brokerFiscalCode
  );

  const isSuperAdmin = containsBrokerCF && role == 'ROLE_ADMIN';

  return isSuperAdmin
    ? ExtendedOperatoRole.ROLE_SUPERADMIN
    : ExtendedOperatoRole[role];
});
