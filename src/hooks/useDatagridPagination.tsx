import { useState, useCallback } from 'react';

export type PaginationState = {
  page: number;
  size: number;
};

type UseDataGridPaginationProps = {
  initialPage?: number;
  initialSize?: number;
  onPaginationChange?: (newPagination: PaginationState) => void;
  totalElements?: number;
};

export const useDataGridPagination = ({
  initialPage = 0,
  initialSize = 10,
  onPaginationChange,
  totalElements = 0
}: UseDataGridPaginationProps = {}) => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    size: initialSize
  });

  const handlePageChange = useCallback(
    (newPage: number) => {
      const newPagination = {
        ...pagination,
        page: newPage - 1
      };
      setPagination(newPagination);
      onPaginationChange?.(newPagination);
    },
    [pagination, onPaginationChange]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      const maxPage = Math.ceil(totalElements / newSize); // quante pagine ci sono disponibili con la nuova size
      const currentOneBasedPage = pagination.page + 1; // pagina attuale, in formato 1-based
      // Se con la nuova size la pagina corrente (es. 5) supera le pagine disponibili (es. 3), lo riportiamo all’ultima pagina valida.

      const newOneBasedPage =
        currentOneBasedPage > maxPage ? maxPage : currentOneBasedPage;

      const newPagination = {
        size: newSize,
        page: newOneBasedPage - 1 // converte a zero-based
      };

      setPagination(newPagination); // aggiorna stato interno
      onPaginationChange?.(newPagination); // notifica il cambiamento

      return newOneBasedPage;
    },
    [onPaginationChange, pagination.page, totalElements]
  );

  return {
    pagination: {
      ...pagination,
      currentPage: pagination.page + 1
    },
    handlePageChange,
    handlePageSizeChange
  };
};
