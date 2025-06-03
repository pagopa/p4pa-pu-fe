import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export type PaginationParams = {
  page: number;
  size: number;
};

export type UsePaginationStateProps = {
  initialPage?: number;
  initialSize?: number;
  onPaginationChange?: (newPagination: PaginationParams) => void;
};

export type UsePaginationStateReturn = {
  paginationParams: PaginationParams;
  handlePaginationChange: (newPagination: PaginationParams) => void;
  setPaginationParams: React.Dispatch<React.SetStateAction<PaginationParams>>;
};

/**
 * Hook for managing local pagination state with URL sync
 *
 * Eliminates code duplication in specific search hooks
 * providing a standardized pagination management with URL synchronization.
 *
 * FEATURES:
 * - Local state for page and size
 * - Standardized callback for handlePaginationChange
 * - Bidirectional URL synchronization
 * - Intelligent size change logic
 *
 * USAGE:
 * ```typescript
 * const { paginationParams, handlePaginationChange } = usePaginationState({
 *   initialPage: 0,
 *   initialSize: 10
 * });
 * ```
 */
export const usePaginationState = ({
  initialPage = 0,
  initialSize = 10,
  onPaginationChange
}: UsePaginationStateProps = {}): UsePaginationStateReturn => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [pagination, setPagination] = useState<PaginationParams>({
    page: initialPage,
    size: initialSize
  });

  // Sync local state with URL on mount
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1');
    const urlSize = parseInt(searchParams.get('size') || String(initialSize));

    if (pagination.page !== urlPage - 1 || pagination.size !== urlSize) {
      setPagination({
        page: urlPage - 1, // Convert to 0-based
        size: urlSize
      });
    }
  }, [searchParams, initialSize]);

  const handlePaginationChange = useCallback(
    (newPagination: PaginationParams) => {
      setPagination(newPagination);

      // Sync URL
      const params = new URLSearchParams(searchParams);
      params.set('page', String(newPagination.page + 1)); // Convert to 1-based for URL
      params.set('size', String(newPagination.size));
      setSearchParams(params, { replace: true });

      if (onPaginationChange) {
        onPaginationChange(newPagination);
      }
    },
    [searchParams, setSearchParams, onPaginationChange]
  );

  return {
    paginationParams: pagination,
    handlePaginationChange,
    setPaginationParams: setPagination
  };
};
