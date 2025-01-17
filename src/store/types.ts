import { UserMemo } from '../models/User';
import { OrganizationIdMemo } from '../models/Organization';
import { ConfigFE } from '../../generated/apiClient';

export interface State {
  [STATE.USER_INFO]: UserMemo | undefined;
  [STATE.ORGANIZATION_ID]: OrganizationIdMemo | undefined;
  [STATE.CONFIG_FE]: ConfigFE | undefined;
}

export interface StoreContextProps {
  state: State;
  setState: (key: keyof State, value: unknown) => void;
}

export enum STATE {
  USER_INFO = 'userInfo',
  CONFIG_FE = 'configFe',
  ORGANIZATION_ID = 'organizationId'
}
