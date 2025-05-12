import { AppState } from '../models/AppState';
import { ConfigFE } from '../../generated/apiClient';
import { FilterValues } from '../models/Filters';
import { OperatoRole } from '../models/OperatorRole';
import { OrganizationIdMemo } from '../models/Organization';
import { UserInfo } from '../../generated/data-contracts';
import { IdTokenPayload } from '../models/IdTokenPayload';
import { KeyofFilterValues } from './FilterStore';

export type State = {
  [STATE.USER_INFO]: UserInfo | undefined;
  [STATE.ORGANIZATION_ID]: OrganizationIdMemo;
  [STATE.CONFIG_FE]: ConfigFE | undefined;
  [STATE.APP_STATE]: AppState;
  [STATE.SELECTED_FILTERS]: Array<KeyofFilterValues>;
  [STATE.FILTER_VALUES]: FilterValues;
  [STATE.OPERATOR_ROLE]: OperatoRole | undefined;
  [STATE.ID_TOKEN]: IdTokenPayload | undefined;
};

export type StoreContextProps = {
  state: State;
};

export enum STATE {
  APP_STATE = 'appState',
  USER_INFO = 'userInfo',
  CONFIG_FE = 'configFe',
  ORGANIZATION_ID = 'organizationId',
  SELECTED_FILTERS = 'selectedFilters',
  FILTER_VALUES = 'filterValues',
  OPERATOR_ROLE = 'operatorRole',
  ID_TOKEN = 'idToken'
}

// Enum per i codici di errore
export enum ValidationErrorCode {
  REQUIRED = 'commons.required',
  INVALID_CF = 'debtPositionCreateWizard.step2.taxCode.invalid',
  INVALID_VAT = 'debtPositionCreateWizard.step2.taxCode.invalidVAT',
  VALID = 'commons.valid'
}
