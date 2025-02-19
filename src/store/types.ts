import { UserMemo } from '../models/User';
import { OrganizationIdMemo } from '../models/Organization';
import { ConfigFE } from '../../generated/apiClient';
import { AppState } from '../models/AppState';

export interface State {
  [STATE.USER_INFO]: UserMemo | undefined;
  [STATE.ORGANIZATION_ID]: OrganizationIdMemo | undefined;
  [STATE.CONFIG_FE]: ConfigFE | undefined;
  [STATE.APP_STATE]: AppState;
}

export interface StoreContextProps {
  state: State;
  setState: (key: keyof State, value: unknown) => void;
}

export enum STATE {
  APP_STATE = 'appState',
  USER_INFO = 'userInfo',
  CONFIG_FE = 'configFe',
  ORGANIZATION_ID = 'organizationId'
}

export enum FlowFileType {
  RECEIPT = 'RECEIPT',
  RECEIPT_PAGOPA = 'RECEIPT_PAGOPA',
  PAYMENTS_REPORTING = 'PAYMENTS_REPORTING',
  PAYMENTS_REPORTING_PAGOPA = 'PAYMENTS_REPORTING_PAGOPA',
  TREASURY_OPI = 'TREASURY_OPI',
  TREASURY_CSV = 'TREASURY_CSV',
  TREASURY_XLS = 'TREASURY_XLS',
  TREASURY_POSTE = 'TREASURY_POSTE'
}

export enum FlowStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface FlowFilters {
  flowFileTypes: FlowFileType[];
  fileName?: string;
  status?: FlowStatus;
  creationDateFrom?: string;
  creationDateTo?: string;
}

export interface PaginationParams {
  size: number;
  page: number;
}

export type FlowFileFilters = FlowFilters & PaginationParams;

export const STATE_COLORS: Record<FlowStatus, 'success' | 'primary' | 'secondary' | 'error'> = {
  [FlowStatus.COMPLETED]: 'success',
  [FlowStatus.UPLOADED]: 'primary',
  [FlowStatus.PROCESSING]: 'primary',
  [FlowStatus.ERROR]: 'error'
};

export const MENU_STATES = [FlowStatus.COMPLETED, FlowStatus.ERROR];
export const DOWNLOAD_STATES = [FlowStatus.UPLOADED];
