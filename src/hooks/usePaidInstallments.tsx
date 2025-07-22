import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/GlobalStore';
import utils from '../utils';
import { AxiosError } from 'axios';
import { getPaidInstallments } from '../api/classifications/paidInstallments';
import {
  PaidInstallmentsFilteredRequest,
  PagedPaidInstallmentsDTO,
  PaidInstallmentsFilters
} from '../api/classifications/paidInstallments/mappings';

/**
 * Parametri per l'hook usePaidInstallments
 */
type UsePaidInstallmentsParams = {
  /** Se abilitare la query (default: true) */
  enabled?: boolean;
  /** Dimensione della pagina per la paginazione (default: 10) */
  pageSize?: number;
  /** Codice tipo posizione debitoria organizzazione (richiesto per l'API) */
  debtPositionTypeOrgCode: string;
  /** ID assessment (richiesto per l'API) */
  assessmentId: number;
  /** Callback per gestione errori personalizzata */
  onError?: (error: AxiosError) => void;
};

/**
 * Parametri per la chiamata fetchPaidInstallments
 */
type FetchPaidInstallmentsParams = {
  /** Filtri opzionali per la ricerca */
  filters?: PaidInstallmentsFilters;
  /** Parametri di paginazione (opzionali, usa default dell'hook se non specificati) */
  pagination?: {
    page: number;
    size: number;
  };
  /** Ordinamento (opzionale, default: paymentDateTime desc) */
  sort?: Array<string>;
};

/**
 * Risultato dell'hook usePaidInstallments
 */
type UsePaidInstallmentsResult = {
  /** Funzione per eseguire la chiamata API */
  fetchPaidInstallments: (
    params?: FetchPaidInstallmentsParams
  ) => Promise<PagedPaidInstallmentsDTO>;
  /** Dati dell'ultima chiamata riuscita */
  data?: PagedPaidInstallmentsDTO;
  /** Stato di loading */
  isLoading: boolean;
  /** Stato di errore */
  isError: boolean;
  /** Dettagli dell'errore */
  error: unknown;
  /** Stato di successo */
  isSuccess: boolean;
  /** Stato di pending */
  isPending: boolean;
};

/**
 * Custom hook per recuperare i paid installments di un'organizzazione
 *
 * Utilizza l'endpoint API reale /bff/organization/{organizationId}/classifications/paid-installments
 * seguendo il pattern standard delle altre API del progetto.
 *
 * Requisiti API:
 * - organizationId: viene recuperato automaticamente dal GlobalStore
 * - debtPositionTypeOrgCode: deve essere fornito tramite parametri
 * - assessmentId: deve essere fornito tramite parametri
 *
 * Il hook fornisce:
 * - Gestione automatica dello stato di loading/error/success
 * - Validazione dei parametri richiesti
 * - Gestione errori intelligente con notifiche
 * - Supporto per filtri, paginazione e ordinamento
 * - Integrazione con il sistema di store globale
 *
 * @param params - Parametri di configurazione dell'hook
 * @returns Hook con metodi e proprietà per gestire i paid installments
 *
 * @example
 * ```tsx
 * const {
 *   fetchPaidInstallments,
 *   data,
 *   isLoading,
 *   isError
 * } = usePaidInstallments({
 *   enabled: true,
 *   debtPositionTypeOrgCode: 'DEPT_001',
 *   assessmentId: 123,
 *   pageSize: 20
 * });
 *
 * // Eseguire la chiamata
 * useEffect(() => {
 *   fetchPaidInstallments({
 *     filters: { iuv: 'IUV123' },
 *     pagination: { page: 0, size: 10 },
 *     sort: ['paymentDateTime:desc']
 *   });
 * }, [fetchPaidInstallments]);
 * ```
 */
export const usePaidInstallments = ({
  enabled = true,
  pageSize = 10,
  debtPositionTypeOrgCode,
  assessmentId,
  onError
}: UsePaidInstallmentsParams): UsePaidInstallmentsResult => {
  const { t } = useTranslation();
  const {
    state: { organizationId }
  } = useStore();

  // Hook API usando il pattern del progetto
  const paidInstallmentsQuery = getPaidInstallments({ organizationId });

  const { data, error, isError, isSuccess, isPending, mutateAsync } =
    paidInstallmentsQuery;

  /**
   * Gestione errori predefinita
   * Segue il pattern degli altri hook per consistenza
   */
  const handleError = useCallback(
    (error: unknown) => {
      const axiosError = error as AxiosError;
      const isServerError =
        axiosError?.response?.status && axiosError.response.status >= 500;

      // Mostra notifica solo per errori non del server (4xx)
      if (!isServerError) {
        utils.notify.emit(t('errors.fetchPaidInstallments'), 'error');
      }

      // Chiama callback personalizzato se fornito
      if (onError && axiosError) {
        onError(axiosError);
      }

      console.error('Error fetching paid installments:', error);
    },
    [t, onError]
  );

  /**
   * Funzione per eseguire la chiamata API con parametri personalizzabili
   * Costruisce automaticamente la richiesta con valori di default sensati
   */
  const fetchPaidInstallments = useCallback(
    async (
      params?: FetchPaidInstallmentsParams
    ): Promise<PagedPaidInstallmentsDTO> => {
      if (!enabled) {
        throw new Error('Hook is disabled');
      }

      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      // Costruisce la richiesta con parametri di default
      const request: PaidInstallmentsFilteredRequest = {
        debtPositionTypeOrgCode,
        assessmentId,
        filters: params?.filters,
        pagination: params?.pagination || {
          page: 0,
          size: pageSize
        },
        sort: params?.sort || ['paymentDateTime:desc'] // Ordine cronologico decrescente di default
      };

      try {
        const result = await mutateAsync(request);
        return result;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    [
      enabled,
      organizationId,
      debtPositionTypeOrgCode,
      assessmentId,
      pageSize,
      mutateAsync,
      handleError
    ]
  );

  return {
    fetchPaidInstallments,
    data,
    isLoading: isPending,
    isError,
    error,
    isSuccess,
    isPending
  };
};
