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
      const maxPage = Math.ceil(totalElements / newSize); // how many pages are available with the new size
      const currentOneBasedPage = pagination.page + 1; // current page, in 1-based format
      // If with the new size the current page (e.g. 5) exceeds the available pages (e.g. 3), we bring it back to the last valid page.

      const newOneBasedPage =
        currentOneBasedPage > maxPage ? maxPage : currentOneBasedPage;

      const newPagination = {
        size: newSize,
        page: newOneBasedPage - 1 // convert to zero-based
      };

      setPagination(newPagination);
      onPaginationChange?.(newPagination);

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
