import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Hook personalizzato che gestisce la sincronizzazione bidirezionale tra:
//  1. Parametri di query nell'URL (page e size)
//  2. Stato interno di paginazione dell'applicazione

//  Questo hook si occupa di gestire la paginazione, nello specifico di:
//  - Persistenza dei parametri di paginazione nell'URL per bookmarking e condivisione
//  - Gestione del caso in cui la pagina corrente non è più valida (ad es. dopo un filtraggio)
//  - Sincronizzazione del conteggio totale degli elementi tra API e stato locale

type PaginationData = {
  number: number;
  size: number;
  totalElements?: number;
  totalPages?: number;
};

type UsePaginationSyncProps = {
  paginationData: PaginationData | undefined;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  totalElements: number;
  setTotalElements: (total: number) => void;
};

const usePaginationSync = ({
  paginationData,
  onPageChange,
  onPageSizeChange,
  setTotalElements
}: UsePaginationSyncProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // useEffect che aggiorna lo stato locale quando il backend comunica un nuovo numero totale di elementi.
  useEffect(() => {
    if (paginationData?.totalElements !== undefined) {
      setTotalElements(paginationData.totalElements);
    }
  }, [paginationData?.totalElements, setTotalElements]);

  // Effect che gestisce il caso edge in cui la pagina corrente nell'URL supera il numero totale di pagine disponibili (ad esempio dopo un'operazione di filtro che riduce il dataset).
  // In questo caso, resettiamo la pagina a 1 mantenendo la dimensione corrente.
  useEffect(() => {
    const totalPages = paginationData?.totalPages;
    const currentDataSize = paginationData?.size;
    const currentUrlPage = parseInt(searchParams.get('page') || '1');

    if (totalPages !== undefined && currentUrlPage > totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');
      params.set('size', String(currentDataSize)); // Mantiene la dimensione corrente
      setSearchParams(params, { replace: true }); // Sostituisce l'URL invece di aggiungere alla history
    }
  }, [paginationData?.totalPages]);

  // Effect che sincronizza i dati di paginazione con l'URL.

  // Nota: l'indice di pagina da API è 0-based, mentre nell'URL utilizziamo 1-based per una migliore esperienza utente (la prima pagina è 1, non 0).
  useEffect(() => {
    if (paginationData) {
      const params = new URLSearchParams(searchParams);
      // Converti da 0-based (API) a 1-based (URL) per l'indice di pagina
      params.set('page', String(paginationData.number + 1));
      params.set('size', String(paginationData.size));
      // Utilizziamo replace: true per evitare di creare entry multiple nella history del browser
      setSearchParams(params, { replace: true });
    }
  }, [paginationData?.number, paginationData?.size]);

  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    onPageSizeChange(newSize);
  };

  return {
    handlePageChange,
    handlePageSizeChange
  };
};

export default usePaginationSync;
