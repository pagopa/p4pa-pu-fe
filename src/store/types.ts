import { UserMemo } from '../models/User';
import { OrganizationIdMemo } from '../models/Organization';
import { ConfigFE } from '../../generated/apiClient';
import { AppState } from '../models/AppState';
import { OperatoRole } from '../models/OperatorRole';
import { FilterValues } from '../models/Filters';

export type State = {
  [STATE.USER_INFO]: UserMemo | undefined;
  [STATE.ORGANIZATION_ID]: OrganizationIdMemo;
  [STATE.CONFIG_FE]: ConfigFE | undefined;
  [STATE.APP_STATE]: AppState;
  [STATE.FILTERS]: Array<string>;
  [STATE.FILTER_VALUES]: FilterValues;
  [STATE.OPERATOR_ROLE]: OperatoRole | undefined;
};

export type StoreContextProps = {
  state: State;
  setState: (key: keyof State, value: unknown) => void;
};

export enum STATE {
  APP_STATE = 'appState',
  USER_INFO = 'userInfo',
  CONFIG_FE = 'configFe',
  ORGANIZATION_ID = 'organizationId',
  FILTERS = 'filters',
  FILTER_VALUES = 'filterValues',
  OPERATOR_ROLE = 'operatorRole'
}
