import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface PaginationData {
  number: number;
  size: number;
  totalElements?: number;
  totalPages?: number;
}

interface UsePaginationSyncProps {
  paginationData: PaginationData | undefined;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  totalElements: number;
  setTotalElements: (total: number) => void;
}

const usePaginationSync = ({
  paginationData,
  onPageChange,
  onPageSizeChange,
  setTotalElements
}: UsePaginationSyncProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Gestione del totale degli elementi
  useEffect(() => {
    if (paginationData?.totalElements !== undefined) {
      setTotalElements(paginationData.totalElements);
    }
  }, [paginationData?.totalElements, setTotalElements]);

  // Gestione del caso in cui la pagina corrente supera il totale delle pagine
  useEffect(() => {
    const totalPages = paginationData?.totalPages;
    const currentDataSize = paginationData?.size;
    const currentUrlPage = parseInt(searchParams.get('page') || '1');

    if (totalPages !== undefined && currentUrlPage > totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');
      params.set('size', String(currentDataSize));
      setSearchParams(params, { replace: true });
    }
  }, [paginationData?.totalPages]);

  // Sincronizzazione dell'URL con i dati di paginazione
  useEffect(() => {
    if (paginationData) {
      const params = new URLSearchParams(searchParams);
      params.set('page', String(paginationData.number + 1));
      params.set('size', String(paginationData.size));
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
