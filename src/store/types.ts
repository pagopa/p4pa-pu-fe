import { UserMemo } from '../models/User';
import { OrganizationIdMemo } from '../models/Organization';

export interface State {
  [STATE.USER_INFO]: UserMemo | undefined;
  [STATE.ORGANIZATION_ID]: OrganizationIdMemo | undefined;
}

export interface StoreContextProps {
  state: State;
  setState: (key: keyof State, value: unknown) => void;
}

export enum STATE {
  USER_INFO = 'userInfo',
  ORGANIZATION_ID = 'organizationId'
}
