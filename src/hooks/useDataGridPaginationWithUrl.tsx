import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

type PaginationData = {
  number: number; // Current page (0-based)
  size: number;
  totalElements?: number;
  totalPages?: number;
};

export type PaginationState = {
  page: number; // Current page (0-based)
  size: number;
};

type UseDataGridPaginationWithUrlProps = {
  initialPage?: number;
  initialSize?: number;
  onPaginationChange?: (newPagination: PaginationState) => void;
  totalElements?: number;
};

type UseDataGridPaginationWithUrlReturn = {
  pagination: {
    page: number; // 0-based for backend compatibility
    size: number;
    currentPage: number;
  };
  handlePageChange: (newPage: number) => void;
  handlePageSizeChange: (newSize: number) => void;
  setTotalElements: (total: number) => void;
  // Method to synchronize with backend data (if URL sync enabled)
  syncWithBackendData: (data: PaginationData | undefined) => void;
};

/**
 * Centralized hook for DataGrid pagination management with URL synchronization
 *
 * Features:
 * - URL synchronization with page and size parameters
 * - Backend data synchronization
 * - Automatic URL parameter initialization
 * - Tab-change support with pagination reset
 */
export const useDataGridPaginationWithUrl = ({
  initialPage = 0,
  initialSize = 10,
  onPaginationChange,
  totalElements = 0
}: UseDataGridPaginationWithUrlProps = {}): UseDataGridPaginationWithUrlReturn => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [internalTotalElements, setInternalTotalElements] =
    useState<number>(totalElements);

  useEffect(() => {
    setInternalTotalElements(totalElements);
  }, [totalElements]);

  // Determine initial values: URL if sync enabled, otherwise passed parameters
  const getInitialValues = useCallback((): PaginationState => {
    const pageParam = searchParams.get('page');
    const sizeParam = searchParams.get('size');

    const pageFromUrl = parseInt(pageParam || '1'); // 1-based in URL
    const sizeFromUrl = parseInt(sizeParam || String(initialSize));

    const validPage = isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;
    const validSize =
      isNaN(sizeFromUrl) || sizeFromUrl < 1 ? initialSize : sizeFromUrl;

    return {
      page: validPage - 1, // Convert to 0-based for internal state
      size: validSize
    };
  }, [searchParams, initialPage, initialSize]);

  const [pagination, setPagination] =
    useState<PaginationState>(getInitialValues);

  // Initialize URL with default parameters on first load (if URL sync enabled)
  useEffect(() => {
    const currentPage = searchParams.get('page');
    const currentSize = searchParams.get('size');

    // If there are no parameters in URL, initialize them with current pagination values
    if (!currentPage || !currentSize) {
      const params = new URLSearchParams(searchParams);

      // Preserve all existing parameters and add only missing ones
      if (!currentPage) params.set('page', String(pagination.page + 1)); // 1-based in URL
      if (!currentSize) params.set('size', String(pagination.size));

      setSearchParams(params, { replace: true });
    }
  }, [pagination.page, pagination.size, searchParams.get('tab')]);

  // Update pagination when URL changes (important for tab changes)
  useEffect(() => {
    const newValues = getInitialValues();

    // Only update if values actually changed to avoid loops
    if (
      pagination.page !== newValues.page ||
      pagination.size !== newValues.size
    ) {
      setPagination(newValues);
    }
  }, [searchParams.get('page'), searchParams.get('size')]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      const newPagination = {
        ...pagination,
        page: newPage - 1
      };

      setPagination(newPagination);
      onPaginationChange?.(newPagination);

      // If URL sync enabled, update URL immediately
      const params = new URLSearchParams(searchParams);
      // Preserve all existing parameters
      params.set('page', String(newPage)); // Keep 1-based in URL
      params.set('size', String(newPagination.size));
      setSearchParams(params, { replace: true });
    },
    [pagination, onPaginationChange, searchParams, setSearchParams]
  );

  // Handler for page size change
  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      const maxPage = Math.ceil(internalTotalElements / newSize);
      const currentOneBasedPage = pagination.page + 1; // Current page in 1-based format

      // If with the new size the current page exceeds available pages,
      // reset to last valid page or first if maxPage is 0
      const newOneBasedPage =
        currentOneBasedPage > maxPage
          ? Math.max(1, maxPage)
          : currentOneBasedPage;

      const newPagination = {
        size: newSize,
        page: newOneBasedPage - 1 // Convert to 0-based
      };

      setPagination(newPagination);
      onPaginationChange?.(newPagination);

      // If URL sync enabled, update URL
      const params = new URLSearchParams(searchParams);
      // Preserve all existing parameters
      params.set('page', String(newOneBasedPage)); // 1-based in URL
      params.set('size', String(newSize));
      setSearchParams(params, { replace: true });

      return newOneBasedPage;
    },
    [
      pagination.page,
      internalTotalElements,
      onPaginationChange,
      searchParams,
      setSearchParams
    ]
  );

  // Method to synchronize with backend data
  const syncWithBackendData = useCallback(
    (data: PaginationData | undefined) => {
      if (!data) {
        return;
      }

      // Validate backend data before syncing
      if (typeof data.size !== 'number' || data.size < 1) {
        return;
      }

      // Update total elements if provided by backend
      if (data.totalElements !== undefined) {
        setInternalTotalElements(data.totalElements);
      }

      // Handle edge case: current page > total available pages
      const currentUrlPage = parseInt(searchParams.get('page') || '1');
      if (data.totalPages !== undefined && currentUrlPage > data.totalPages) {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        params.set('size', String(data.size));
        setSearchParams(params, { replace: true });
        return;
      }

      // Synchronize internal state with backend data
      const backendPagination = {
        page: data.number, // Backend is 0-based
        size: data.size
      };

      // Update internal state only if different
      setPagination((prevPagination) => {
        if (
          prevPagination.page !== backendPagination.page ||
          prevPagination.size !== backendPagination.size
        ) {
          return backendPagination;
        }
        return prevPagination;
      });

      // Synchronize URL with backend data
      const params = new URLSearchParams(searchParams);
      // Preserve all existing parameters
      params.set('page', String(data.number + 1)); // Convert to 1-based for URL
      params.set('size', String(data.size));
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams, pagination]
  );

  // Setter for total elements
  const setTotalElements = useCallback((total: number) => {
    setInternalTotalElements(total);
  }, []);

  return {
    pagination: {
      ...pagination,
      currentPage: pagination.page + 1 // Expose 1-based version for UI
    },
    handlePageChange,
    handlePageSizeChange,
    setTotalElements,
    syncWithBackendData
  };
};
