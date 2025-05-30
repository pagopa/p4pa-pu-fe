import { GridSortModel } from '@mui/x-data-grid';
import { useState, useCallback } from 'react';
import { ExportFileTypeEnum } from '../../generated/apiClient';
import { ExportFileFilters } from '../models/Filters';
import { usePaginationState } from './usePaginationState';

type UseExportFlowFiltersProps = {
  initialFilters?: Partial<ExportFileFilters>;
  exportFileType: ExportFileTypeEnum;
  onFiltersChange?: (filters: ExportFileFilters) => void;
  initialPage?: number;
  initialSize?: number;
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

export const useExportFlowFilters = ({
  exportFileType,
  initialFilters,
  onFiltersChange,
  initialPage = 0,
  initialSize = DEFAULT_PAGE_SIZE
}: UseExportFlowFiltersProps) => {
  const defaultDateRange = getDefaultDateRange();

  const {
    paginationParams,
    handlePaginationChange: updatePaginationState,
    setPaginationParams
  } = usePaginationState({
    initialPage: initialFilters?.page ?? initialPage,
    initialSize: initialFilters?.size ?? initialSize
  });

  const [appliedFilters, setAppliedFilters] = useState<
    Omit<ExportFileFilters, 'page' | 'size'>
  >(() => ({
    exportFileType,
    creationDateFrom:
      initialFilters?.creationDateFrom || defaultDateRange.creationDateFrom,
    creationDateTo:
      initialFilters?.creationDateTo || defaultDateRange.creationDateTo,
    fileName: initialFilters?.fileName,
    status: initialFilters?.status
  }));

  const [draftFilters, setDraftFilters] =
    useState<Omit<ExportFileFilters, 'page' | 'size'>>(appliedFilters);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const getCompleteFilters = useCallback(
    (): ExportFileFilters => ({
      ...appliedFilters,
      page: paginationParams.page,
      size: paginationParams.size,
      ...(sortModel.length > 0 && {
        sort: [`${sortModel[0].field},${sortModel[0].sort}`]
      })
    }),
    [appliedFilters, paginationParams, sortModel]
  );

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
    (updates: Partial<Omit<ExportFileFilters, 'page' | 'size'>>) => {
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

    setPaginationParams((prev) => ({ ...prev, page: 0 }));

    const completeFilters = {
      ...filtersToApply,
      page: 0,
      size: paginationParams.size
    };
    onFiltersChange?.(completeFilters);
  }, [
    draftFilters,
    paginationParams.size,
    setPaginationParams,
    onFiltersChange
  ]);

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

      setPaginationParams((prev) => ({ ...prev, page: 0 }));

      const completeFilters = getCompleteFilters();
      onFiltersChange?.({
        ...completeFilters,
        page: 0,
        ...(newModel.length > 0 && {
          sort: [`${newModel[0].field},${newModel[0].sort}`]
        })
      });
    },
    [getCompleteFilters, setPaginationParams, onFiltersChange]
  );

  const handlePaginationChange = useCallback(
    (pagination: { page: number; size: number }) => {
      updatePaginationState(pagination);

      const completeFilters = {
        ...appliedFilters,
        ...pagination,
        ...(sortModel.length > 0 && {
          sort: [`${sortModel[0].field},${sortModel[0].sort}`]
        })
      };
      onFiltersChange?.(completeFilters);
    },
    [appliedFilters, sortModel, onFiltersChange, updatePaginationState]
  );

  return {
    appliedFilters: getCompleteFilters(),
    draftFilters,
    updateDraftFilters,
    applyFilters,
    handleDateFromChange,
    handleDateToChange,
    hasActiveFilters,
    sortModel,
    handleSortModelChange,
    paginationParams,
    handlePaginationChange,
    getCompleteFilters
  };
};
