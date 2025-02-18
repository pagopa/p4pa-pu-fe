import { useState, useCallback } from 'react';

export interface PaginationState {
  page: number;
  size: number;
}

interface UseDataGridPaginationProps {
  initialPage?: number;
  initialSize?: number;
  onPaginationChange?: (newPagination: PaginationState) => void;
}

export const useDataGridPagination = ({
  initialPage = 0,
  initialSize = 10,
  onPaginationChange
}: UseDataGridPaginationProps = {}) => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    size: initialSize
  });

  const handlePageChange = useCallback((newPage: number) => {
    const newPagination = {
      ...pagination,
      page: newPage - 1
    };
    setPagination(newPagination);
    onPaginationChange?.(newPagination);
  }, [pagination, onPaginationChange]);

  const handlePageSizeChange = useCallback((newSize: number) => {
    const newPagination = {
      size: newSize,
      page: 0 
    };
    setPagination(newPagination);
    onPaginationChange?.(newPagination);
  }, [onPaginationChange]);

  return {
    pagination: {
      ...pagination,
      currentPage: pagination.page + 1
    },
    handlePageChange,
    handlePageSizeChange
  };
};
