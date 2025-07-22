import {
  ClassificationPaidInstallmentsView,
  PagedClassificationPaidInstallmentsView
} from '../../../../generated/data-contracts';

/**
 * Tipi TypeScript generati dal backend
 * Utilizzati direttamente senza wrapper personalizzati
 */
export type PaidInstallmentDTO = ClassificationPaidInstallmentsView;
export type PagedPaidInstallmentsDTO = PagedClassificationPaidInstallmentsView;

/**
 * Filtri per la richiesta API paid-installments
 * Basati sui parametri supportati dall'endpoint API
 */
export type PaidInstallmentsFilters = {
  /** Filtro IUV opzionale */
  iuv?: string;
  /** Data inizio periodo pagamento */
  paymentDateTimeFrom?: string;
  /** Data fine periodo pagamento */
  paymentDateTimeTo?: string;
  /** Data inizio ultimo aggiornamento */
  updateDateFrom?: string;
  /** Data fine ultimo aggiornamento */
  updateDateTo?: string;
};

/**
 * Parametri per la richiesta API paid-installments
 * Segue il pattern standard delle altre API del progetto
 */
export type PaidInstallmentsFilteredRequest = {
  /** Parametri obbligatori richiesti dall'API */
  debtPositionTypeOrgCode: string;
  assessmentId: number;
  /** Filtri opzionali */
  filters?: PaidInstallmentsFilters;
  /** Parametri di paginazione */
  pagination: {
    page: number;
    size: number;
  };
  /** Ordinamento */
  sort?: Array<string>;
};

/**
 * Costruisce i parametri query per l'API paid-installments
 * Segue il pattern standard delle altre API del progetto
 */
export const buildQueryParams = ({
  debtPositionTypeOrgCode,
  assessmentId,
  filters,
  pagination,
  sort
}: PaidInstallmentsFilteredRequest) => ({
  // Parametri obbligatori
  debtPositionTypeOrgCode,
  assessmentId,
  // Filtri opzionali
  ...(filters?.iuv && { iuv: filters.iuv }),
  ...(filters?.paymentDateTimeFrom && {
    paymentDateTimeFrom: filters.paymentDateTimeFrom
  }),
  ...(filters?.paymentDateTimeTo && {
    paymentDateTimeTo: filters.paymentDateTimeTo
  }),
  ...(filters?.updateDateFrom && { updateDateFrom: filters.updateDateFrom }),
  ...(filters?.updateDateTo && { updateDateTo: filters.updateDateTo }),
  // Paginazione
  page: pagination.page,
  size: pagination.size,
  // Ordinamento
  ...(sort?.length && { sort })
});
