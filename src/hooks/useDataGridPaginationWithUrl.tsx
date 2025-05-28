import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Tipo per i dati di paginazione ricevuti dal backend
type PaginationData = {
  number: number; // Pagina corrente (0-based)
  size: number; // Dimensione pagina
  totalElements?: number; // Totale elementi
  totalPages?: number; // Totale pagine
};

// Stato interno di paginazione
export type PaginationState = {
  page: number; // Pagina corrente (0-based)
  size: number; // Dimensione pagina
};

type UseDataGridPaginationWithUrlProps = {
  // Parametri di inizializzazione
  initialPage?: number; // Pagina iniziale (0-based), fallback se non presente in URL
  initialSize?: number; // Dimensione iniziale, fallback se non presente in URL

  // Callback per notificare cambiamenti di paginazione
  onPaginationChange?: (newPagination: PaginationState) => void;

  // Configurazione URL (opzionale - se non fornita, funziona come useDataGridPagination)
  enableUrlSync?: boolean; // Abilita sincronizzazione con URL

  // Totale elementi per calcoli (usato per gestire overflow pagine)
  totalElements?: number;
};

type UseDataGridPaginationWithUrlReturn = {
  // Stato di paginazione corrente
  pagination: {
    page: number; // 0-based per compatibilità con backend
    size: number;
    currentPage: number; // 1-based per UI
  };

  // Handlers per la paginazione
  handlePageChange: (newPage: number) => void; // Input 1-based
  handlePageSizeChange: (newSize: number) => void;

  // Setter per aggiornare totale elementi (necessario per sincronizzazione)
  setTotalElements: (total: number) => void;

  // Metodo per sincronizzare con dati del backend (se URL sync abilitato)
  syncWithBackendData: (data: PaginationData | undefined) => void;
};

/**
 * Hook centralizzato per gestione paginazione DataGrid con supporto opzionale per sincronizzazione URL
 *
 * Principi applicati:
 * - SOLID: Singola responsabilità (paginazione + URL sync)
 * - DRY: Unifica logica di useDataGridPagination e usePaginationSync
 * - KISS: Interfaccia semplice con opzioni chiare
 *
 * Supporta due modalità:
 * 1. Solo stato interno (enableUrlSync = false) - compatibile con useDataGridPagination esistente
 * 2. Con sincronizzazione URL (enableUrlSync = true) - replica funzionalità usePaginationSync
 */
export const useDataGridPaginationWithUrl = ({
  initialPage = 0,
  initialSize = 10,
  onPaginationChange,
  enableUrlSync = false,
  totalElements = 0
}: UseDataGridPaginationWithUrlProps = {}): UseDataGridPaginationWithUrlReturn => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [internalTotalElements, setInternalTotalElements] =
    useState<number>(totalElements);

  // Aggiorna totalElements interno quando cambia la prop esterna
  useEffect(() => {
    setInternalTotalElements(totalElements);
  }, [totalElements]);

  // Determina valori iniziali: URL se sync abilitato, altrimenti parametri passati
  const getInitialValues = useCallback((): PaginationState => {
    if (enableUrlSync) {
      const pageFromUrl = parseInt(searchParams.get('page') || '1'); // 1-based in URL
      const sizeFromUrl = parseInt(
        searchParams.get('size') || String(initialSize)
      );

      // Gestisce valori NaN fallback ai default
      const validPage = isNaN(pageFromUrl) ? 1 : pageFromUrl;
      const validSize = isNaN(sizeFromUrl) ? initialSize : sizeFromUrl;

      return {
        page: validPage - 1, // Converte a 0-based per stato interno
        size: validSize
      };
    }

    return {
      page: initialPage,
      size: initialSize
    };
  }, [enableUrlSync, searchParams, initialPage, initialSize]);

  const [pagination, setPagination] =
    useState<PaginationState>(getInitialValues);

  // Handler per cambio pagina (input 1-based, converte a 0-based internamente)
  const handlePageChange = useCallback(
    (newPage: number) => {
      const newPagination = {
        ...pagination,
        page: newPage - 1 // Converte da 1-based (UI) a 0-based (interno)
      };

      setPagination(newPagination);
      onPaginationChange?.(newPagination);

      // Se URL sync abilitato, aggiorna subito l'URL
      if (enableUrlSync) {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(newPage)); // Mantiene 1-based in URL
        params.set('size', String(newPagination.size));
        setSearchParams(params, { replace: true });
      }
    },
    [
      pagination,
      onPaginationChange,
      enableUrlSync,
      searchParams,
      setSearchParams
    ]
  );

  // Handler per cambio dimensione pagina
  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      const maxPage = Math.ceil(internalTotalElements / newSize);
      const currentOneBasedPage = pagination.page + 1; // Pagina attuale in formato 1-based

      // Se con la nuova size la pagina corrente supera le pagine disponibili,
      // riporta all'ultima pagina valida o alla prima se maxPage è 0
      const newOneBasedPage =
        currentOneBasedPage > maxPage
          ? Math.max(1, maxPage)
          : currentOneBasedPage;

      const newPagination = {
        size: newSize,
        page: newOneBasedPage - 1 // Converte a 0-based
      };

      setPagination(newPagination);
      onPaginationChange?.(newPagination);

      // Se URL sync abilitato, aggiorna l'URL
      if (enableUrlSync) {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(newOneBasedPage)); // 1-based in URL
        params.set('size', String(newSize));
        setSearchParams(params, { replace: true });
      }

      return newOneBasedPage;
    },
    [
      pagination.page,
      internalTotalElements,
      onPaginationChange,
      enableUrlSync,
      searchParams,
      setSearchParams
    ]
  );

  // Metodo per sincronizzare con dati del backend (sostituisce la logica di usePaginationSync)
  const syncWithBackendData = useCallback(
    (data: PaginationData | undefined) => {
      if (!enableUrlSync || !data) return;

      // Aggiorna il totale elementi se fornito dal backend
      if (data.totalElements !== undefined) {
        setInternalTotalElements(data.totalElements);
      }

      // Gestisce caso edge: pagina corrente > totale pagine disponibili
      const currentUrlPage = parseInt(searchParams.get('page') || '1');
      if (data.totalPages !== undefined && currentUrlPage > data.totalPages) {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        params.set('size', String(data.size));
        setSearchParams(params, { replace: true });
        return;
      }

      // Sincronizza stato interno con dati backend
      const backendPagination = {
        page: data.number, // Backend è 0-based
        size: data.size
      };

      // Aggiorna stato interno solo se diverso
      setPagination((prevPagination) => {
        if (
          prevPagination.page !== backendPagination.page ||
          prevPagination.size !== backendPagination.size
        ) {
          return backendPagination;
        }
        return prevPagination;
      });

      // Sincronizza URL con dati backend
      const params = new URLSearchParams(searchParams);
      params.set('page', String(data.number + 1)); // Converte a 1-based per URL
      params.set('size', String(data.size));
      setSearchParams(params, { replace: true });
    },
    [enableUrlSync, searchParams, setSearchParams]
  );

  // Setter per totale elementi (esposto per compatibilità con usePaginationSync)
  const setTotalElements = useCallback((total: number) => {
    setInternalTotalElements(total);
  }, []);

  return {
    pagination: {
      ...pagination,
      currentPage: pagination.page + 1 // Espone versione 1-based per UI
    },
    handlePageChange,
    handlePageSizeChange,
    setTotalElements,
    syncWithBackendData
  };
};
