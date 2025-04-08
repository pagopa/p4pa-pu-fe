import {
  IngestionFlowFileStatus,
  IngestionFlowFileTypeEnum,
  ExportFileStatus as ApiExportFileStatus,
  ExportFileTypeEnum
} from '../../generated/apiClient';
export type FlowStatus = IngestionFlowFileStatus;
export type ExportFileStatus = ApiExportFileStatus;

export type FilterValues = {
  ACCOUNTING_DATE_FROM: Date | null;
  ACCOUNTING_DATE_TO: Date | null;
  AMOUNT: number | null;
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

export type FlowFilters = {
  ingestionFlowFileTypes: Array<IngestionFlowFileTypeEnum>;
  fileName?: string;
  status?: IngestionFlowFileStatus;
  creationDateFrom?: string;
  creationDateTo?: string;
  sort?: Array<string>;
};

export type ExportFlowFilters = {
  exportFileType: ExportFileTypeEnum;
  fileName?: string;
  status?: ExportFileStatus;
  creationDateFrom?: string;
  creationDateTo?: string;
  sort?: Array<string>;
};

export type PaginationParams = {
  size: number;
  page: number;
};

export type FlowFileFilters = FlowFilters & PaginationParams;
export type ExportFileFilters = ExportFlowFilters & PaginationParams;

export const STATE_COLORS: Record<
  FlowStatus,
  'success' | 'info' | 'secondary' | 'error'
> = {
  COMPLETED: 'success',
  UPLOADED: 'info',
  PROCESSING: 'info',
  ERROR: 'error'
};

export const EXPORT_STATE_COLORS: Record<
  ExportFileStatus,
  'success' | 'info' | 'secondary' | 'error'
> = {
  COMPLETED: 'success',
  REQUESTED: 'info',
  PROCESSING: 'info',
  EXPIRED: 'error',
  ERROR: 'error'
};

export const MENU_STATES = ['COMPLETED', 'ERROR'] as const;
export const DOWNLOAD_STATES = ['UPLOADED'] as const;
export const EXPORT_DOWNLOAD_STATES = ['COMPLETED'] as const;

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
