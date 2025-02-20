import { IngestionFlowFile } from '../../generated/data-contracts';

export type FlowStatus = Pick<IngestionFlowFile, 'status'>['status'];

export const FLOW_STATUS_VALUES = ['UPLOADED', 'PROCESSING', 'COMPLETED', 'ERROR'] as const;

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
  COMPLETED: 'success',
  UPLOADED: 'primary',
  PROCESSING: 'primary',
  ERROR: 'error'
};

export const MENU_STATES = ['COMPLETED', 'ERROR'] as const;
export const DOWNLOAD_STATES = ['UPLOADED'] as const;
