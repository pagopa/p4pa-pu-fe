import { GetIngestionFlowFilesParamsStatusEnum, IngestionFlowFile } from '../../generated/data-contracts';

export type FlowStatus = Pick<IngestionFlowFile, 'status'>['status'];

export const FLOW_STATUS_VALUES = [
  'UPLOADED',
  'PROCESSING',
  'COMPLETED',
  'ERROR'
] as const;

export enum FlowFileType {
  RECEIPT = 'RECEIPT',
  RECEIPT_PAGOPA = 'RECEIPT_PAGOPA',
  PAYMENTS_REPORTING = 'PAYMENTS_REPORTING',
  PAYMENTS_REPORTING_PAGOPA = 'PAYMENTS_REPORTING_PAGOPA',
  TREASURY_OPI = 'TREASURY_OPI',
  TREASURY_CSV = 'TREASURY_CSV',
  TREASURY_XLS = 'TREASURY_XLS',
  TREASURY_POSTE = 'TREASURY_POSTE',
  DP_INSTALLMENTS = 'DP_INSTALLMENTS'
}

export type FlowFilters = {
  flowFileTypes: Array<GetIngestionFlowFilesParamsStatusEnum>;
  fileName?: string;
  status?: FlowStatus;
  creationDateFrom?: string;
  creationDateTo?: string;
  sort?: Array<string>;
};

export type PaginationParams = {
  size: number;
  page: number;
};

export type FlowFileFilters = FlowFilters & PaginationParams;

export const STATE_COLORS: Record<
  FlowStatus,
  'success' | 'info' | 'secondary' | 'error'
> = {
  COMPLETED: 'success',
  UPLOADED: 'info',
  PROCESSING: 'info',
  ERROR: 'error'
};

export const MENU_STATES = ['COMPLETED', 'ERROR'] as const;
export const DOWNLOAD_STATES = ['UPLOADED'] as const;

export type DateRangeValue = {
  from: Date | null;
  to: Date | null;
};

export type FilterFieldValue =
  | string
  | number
  | boolean
  | Date
  | DateRangeValue
  | null
  | undefined;

export type BaseFilterValues = Record<string, FilterFieldValue>;
