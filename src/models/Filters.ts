import {
  IngestionFlowFileStatus,
  IngestionFlowFileTypeEnum,
  ExportFileTypeEnum,
  ExportFileStatus
} from '../../generated/apiClient';
export type FlowStatus = IngestionFlowFileStatus;

export type FilteredRequest<T> = {
  filters: T;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export type FilterValues = {
  ACCOUNTING_DATE_FROM: Date | null;
  ACCOUNTING_DATE_TO: Date | null;
  ACCOUNT_REGISTRY_CODE: string;
  AMOUNT: number | null;
  BILL_CODE: string;
  BILL_FROM: Date | null;
  BILL_DATE_FROM: Date | null;
  BILL_DATE_TO: Date | null;
  DOCUMENT_CODE: string;
  DOCUMENT_CODE_FROM: Date | null;
  IUV: string;
  IUR: string;
  IUD: string;
  IUF: string;
  PAYER: string;
  PSP_COMPANY_NAME: string;
  REGULATION_UNIQUE_IDENTIFIER: string;
  REMITTANCE_INFORMATION: string;
  REPORT_ID: string;
  TEMPORARY_CODE: string;
  TEMPORARY_CODE_FROM: Date | null;
  VALUE_DATE_FROM: Date | null;
  VALUE_DATE_TO: Date | null;
  REGION_VALUE_DATE_FROM: Date | null;
  REGION_VALUE_DATE_TO: Date | null;
  PAY_DATE_FROM: Date | null;
  PAY_DATE_TO: Date | null;
  CLASSIFICATION_TYPE: string;
  LAST_CLASSIFICATION_DATE_FROM: Date | null;
  LAST_CLASSIFICATION_DATE_TO: Date | null;
  REGULATION_DATE_FROM: Date | null;
  REGULATION_DATE_TO: Date | null;
  PAYMENT_DATE_FROM: Date | null;
  PAYMENT_DATE_TO: Date | null;
  ASSESSMENT_NAME: string;
  DEBT_TYPE: string;
  ASSESSMENT_STATUS: string;
  LAST_UPDATE_DATE_FROM: Date | null;
  LAST_UPDATE_DATE_TO: Date | null;
  OFFICE_CODE: string;
  OFFICE_DESCRIPTION: string;
  ASSESSMENT_CODE: string;
  ASSESSMENT_DESCRIPTION: string;
  SECTION_CODE: string;
  SECTION_DESCRIPTION: string;
  DEBT_POSITION_TYPE_ORG_CODE: string;
  OPERATING_YEAR: string;
  STATUS: string;
};

export type FlowFilters = {
  ingestionFlowFileTypes: Array<IngestionFlowFileTypeEnum>;
  fileName?: string;
  status?: IngestionFlowFileStatus;
  creationDateFrom?: Date;
  creationDateTo?: Date;
  sort?: Array<string>;
};

export type ExportFlowFilters = {
  exportFileType: ExportFileTypeEnum;
  fileName?: string;
  status?: ExportFileStatus;
  creationDateFrom?: Date;
  creationDateTo?: Date;
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
  WAITING_FILE: 'info',
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
export const EXPORT_DOWNLOAD_STATES = [ExportFileStatus.COMPLETED];

export type DateRangeValue = {
  from?: Date | null;
  to?: Date | null;
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
