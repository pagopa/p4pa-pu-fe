import { signal } from '@preact/signals-react';
import { OperatoRole } from '../models/OperatorRole';

export const operatorRoleState = signal<OperatoRole>();

export function setOperatorRole(operatorRole: OperatoRole) {
  operatorRoleState.value = operatorRole;
}

