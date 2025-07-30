import { useState, useCallback, useMemo } from 'react';
import { GridSortModel } from '@mui/x-data-grid';
import { FlowFileFilters, PaginationParams } from '../models/Filters';
import { IngestionFlowFileTypeEnum } from '../../generated/apiClient';

type UseFlowFiltersProps = {
  initialFilters?: Partial<FlowFileFilters>;
  ingestionFlowFileTypes?: Array<IngestionFlowFileTypeEnum>;
  onFiltersChange?: (filters: FlowFileFilters) => void;
};

const DEFAULT_PAGE_SIZE = 10;

const getDefaultDateRange = () => {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  return {
    creationDateFrom: new Date(oneYearAgo.setHours(0, 0, 0, 0)).toISOString(),
    creationDateTo: new Date(today.setHours(23, 59, 59, 999)).toISOString()
  };
};

export const useFlowFilters = ({
  ingestionFlowFileTypes,
  initialFilters,
  onFiltersChange
}: UseFlowFiltersProps) => {
  const flowTypes = ingestionFlowFileTypes || [];
  const defaultDateRange = getDefaultDateRange();

  const { pagination, handlePageChange, handlePageSizeChange } = {
    pagination: { page: 0, size: DEFAULT_PAGE_SIZE },
    handlePageChange: () => null,
    handlePageSizeChange: () => null
  };

  const [appliedFilters, setAppliedFilters] = useState<
    Omit<FlowFileFilters, 'page' | 'size'>
  >(() => ({
    ingestionFlowFileTypes: flowTypes,
    creationDateFrom:
      initialFilters?.creationDateFrom || defaultDateRange.creationDateFrom,
    creationDateTo:
      initialFilters?.creationDateTo || defaultDateRange.creationDateTo,
    fileName: initialFilters?.fileName,
    status: initialFilters?.status
  }));

  const [draftFilters, setDraftFilters] =
    useState<Omit<FlowFileFilters, 'page' | 'size'>>(appliedFilters);

  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const getCompleteFilters = useCallback((): FlowFileFilters => {
    const completeFilters = {
      ...appliedFilters,
      page: pagination.page,
      size: pagination.size,
      ...(sortModel.length > 0 && {
        sort: [`${sortModel[0].field},${sortModel[0].sort}`]
      })
    };

    return completeFilters;
  }, [
    appliedFilters.ingestionFlowFileTypes,
    appliedFilters.creationDateFrom,
    appliedFilters.creationDateTo,
    appliedFilters.fileName,
    appliedFilters.status,
    pagination.page,
    pagination.size,
    sortModel.length,
    sortModel[0]?.field,
    sortModel[0]?.sort
  ]);

  const hasActiveFilters = useCallback(() => {
    const isFileNameChanged =
      (draftFilters.fileName || '') !== (appliedFilters.fileName || '');
    const isDateFromChanged =
      draftFilters.creationDateFrom !== appliedFilters.creationDateFrom;
    const isDateToChanged =
      draftFilters.creationDateTo !== appliedFilters.creationDateTo;
    const isStatusChanged = draftFilters.status !== appliedFilters.status;

    return (
      isFileNameChanged ||
      isDateFromChanged ||
      isDateToChanged ||
      isStatusChanged
    );
  }, [
    draftFilters.fileName,
    draftFilters.creationDateFrom,
    draftFilters.creationDateTo,
    draftFilters.status,
    appliedFilters.fileName,
    appliedFilters.creationDateFrom,
    appliedFilters.creationDateTo,
    appliedFilters.status
  ]);

  const updateDraftFilters = useCallback(
    (updates: Partial<Omit<FlowFileFilters, 'page' | 'size'>>) => {
      setDraftFilters((prev) => ({
        ...prev,
        ...updates
      }));
    },
    []
  );

  const applyFilters = useCallback(() => {
    const filtersToApply = {
      ...draftFilters
    };
    setAppliedFilters(filtersToApply);

    handlePageChange(0);

    const completeFilters = {
      ...filtersToApply,
      page: 0,
      size: pagination.size
    };
    onFiltersChange?.(completeFilters);
  }, [draftFilters, pagination.size, handlePageChange, onFiltersChange]);

  const updatePagination = useCallback(
    (pagination: PaginationParams) => {
      handlePageChange(pagination.page);
      handlePageSizeChange(pagination.size);

      const completeFilters = {
        ...appliedFilters,
        ...pagination,
        ...(sortModel.length > 0 && {
          sort: [`${sortModel[0].field},${sortModel[0].sort}`]
        })
      };

      onFiltersChange?.(completeFilters);
    },
    [appliedFilters, sortModel, onFiltersChange, handlePageChange]
  );

  const handleDateFromChange = useCallback(
    (date: Date | null) => {
      updateDraftFilters({
        creationDateFrom: date
          ? new Date(date.setHours(0, 0, 0, 0)).toISOString()
          : undefined
      });
    },
    [updateDraftFilters]
  );

  const handleDateToChange = useCallback(
    (date: Date | null) => {
      updateDraftFilters({
        creationDateTo: date
          ? new Date(date.setHours(23, 59, 59, 999)).toISOString()
          : undefined
      });
    },
    [updateDraftFilters]
  );

  const handleSortModelChange = useCallback(
    (newModel: GridSortModel) => {
      setSortModel(newModel);

      handlePageChange(0);

      const completeFilters = getCompleteFilters();
      onFiltersChange?.({
        ...completeFilters,
        page: 0,
        ...(newModel.length > 0 && {
          sort: [`${newModel[0].field},${newModel[0].sort}`]
        })
      });
    },
    [getCompleteFilters, handlePageChange, onFiltersChange]
  );

  const memoizedCompleteFilters = useMemo(() => {
    return getCompleteFilters();
  }, [getCompleteFilters]);

  return {
    appliedFilters: memoizedCompleteFilters,
    draftFilters,
    updateDraftFilters,
    applyFilters,
    updatePagination,
    handleDateFromChange,
    handleDateToChange,
    hasActiveFilters,
    sortModel,
    handleSortModelChange
  };
};
