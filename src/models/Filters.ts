import {
  IngestionFlowFileStatus,
  IngestionFlowFileTypeEnum
} from '../../generated/apiClient';
export type FlowStatus = IngestionFlowFileStatus;

export type FilterValues = {
  ACCOUNTING_DATE_FROM: Date | null;
  ACCOUNTING_DATE_TO: Date | null;
  AMOUNT: number;
  BILL_CODE: string;
  BILL_FROM: Date | null;
  DOCUMENT_CODE: string;
  DOCUMENT_CODE_FROM: Date | null;
  IUV: string;
  PAYER: string;
  REPORT_ID: string;
  TEMPORARY_CODE: string;
  TEMPORARY_CODE_FROM: Date | null;
  VALUE_DATE_FROM: Date | null;
  VALUE_DATE_TO: Date | null;
};

export const FLOW_STATUS_VALUES = [
  'UPLOADED',
  'PROCESSING',
  'COMPLETED',
  'ERROR'
] as const;

export type FlowFilters = {
  ingestionFlowFileTypes: Array<IngestionFlowFileTypeEnum>;
  fileName?: string;
  status?: IngestionFlowFileStatus;
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
