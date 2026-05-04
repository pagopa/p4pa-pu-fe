import { AppState } from '../models/AppState';
import { ConfigFE } from '../../generated/apiClient';
import { FilterValues } from '../models/Filters';
import { OrganizationIdMemo } from '../models/Organization';
import {
  OperatorRole,
  OrganizationDTO,
  UserInfoDTO
} from '../../generated/data-contracts';
import { IdTokenPayload } from '../models/IdTokenPayload';
import { FilterMap } from '../hooks/useMultiFilters';

export type State = {
  [STATE.USER_INFO]: UserInfoDTO | undefined;
  [STATE.ORGANIZATIONS]: Array<OrganizationDTO>;
  [STATE.ORGANIZATION_ID]: OrganizationIdMemo;
  [STATE.CONFIG_FE]: ConfigFE | undefined;
  [STATE.APP_STATE]: AppState;
  [STATE.SELECTED_FILTERS]: Array<keyof FilterMap>;
  [STATE.FILTER_VALUES]: FilterValues;
  [STATE.OPERATOR_ROLE]: OperatorRole | undefined;
  [STATE.ID_TOKEN]: IdTokenPayload | undefined;
};

export type StoreContextProps = {
  state: State;
};

export enum STATE {
  APP_STATE = 'appState',
  USER_INFO = 'userInfo',
  CONFIG_FE = 'configFe',
  ORGANIZATIONS = 'organizations',
  ORGANIZATION_ID = 'organizationId',
  SELECTED_FILTERS = 'selectedFilters',
  FILTER_VALUES = 'filterValues',
  OPERATOR_ROLE = 'operatorRole',
  ID_TOKEN = 'idToken'
}

// Error codes for validation
export enum ValidationErrorCode {
  REQUIRED = 'commons.required',
  INVALID_CF = 'debtPositionCreateWizard.step2.taxCode.invalid',
  INVALID_VAT = 'debtPositionCreateWizard.step2.taxCode.invalidVAT',
  VALID = 'commons.valid'
}
