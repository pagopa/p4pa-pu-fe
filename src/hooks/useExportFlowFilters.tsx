import { GridSortModel } from '@mui/x-data-grid';
import { useState, useCallback } from 'react';
import { ExportFileTypeEnum } from '../../generated/apiClient';
import { ExportFileFilters } from '../models/Filters';
import { endOfDay, startOfDay, subYears } from 'date-fns';

type UseExportFlowFiltersProps = {
  initialFilters?: Partial<ExportFileFilters>;
  exportFileType: ExportFileTypeEnum;
  onFiltersChange?: (filters: ExportFileFilters) => void;
  initialPage?: number;
  initialSize?: number;
};

const getDefaultDateRange = () => {
  const today = new Date();
  const oneYearAgo = subYears(today, 1);

  return {
    creationDateFrom: startOfDay(oneYearAgo),
    creationDateTo: endOfDay(today)
  };
};

export const useExportFlowFilters = ({
  exportFileType,
  initialFilters,
  onFiltersChange
}: UseExportFlowFiltersProps) => {
  const defaultDateRange = getDefaultDateRange();

  const { pagination, handlePageChange } = {
    pagination: { page: 0, size: 10 },
    handlePageChange: () => null
  };

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
      page: pagination.page,
      size: pagination.size,
      ...(sortModel.length > 0 && {
        sort: [`${sortModel[0].field},${sortModel[0].sort}`]
      })
    }),
    [appliedFilters, pagination, sortModel]
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

    const completeFilters = {
      ...filtersToApply,
      page: 0,
      size: pagination.size
    };
    onFiltersChange?.(completeFilters);
  }, [draftFilters, pagination.size, handlePageChange, onFiltersChange]);

  const handleDateFromChange = useCallback(
    (date: Date | null) => {
      updateDraftFilters({
        creationDateFrom: date ? startOfDay(date) : undefined
      });
    },
    [updateDraftFilters]
  );

  const handleDateToChange = useCallback(
    (date: Date | null) => {
      updateDraftFilters({
        creationDateTo: date ? endOfDay(date) : undefined
      });
    },
    [updateDraftFilters]
  );

  const handleSortModelChange = useCallback(
    (newModel: GridSortModel) => {
      setSortModel(newModel);

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

  // const handlePaginationChange = useCallback(
  //   (pagination: { page: number; size: number }) => {
  //     updatePaginationState(pagination);
  //
  //     const completeFilters = {
  //       ...appliedFilters,
  //       ...pagination,
  //       ...(sortModel.length > 0 && {
  //         sort: [`${sortModel[0].field},${sortModel[0].sort}`]
  //       })
  //     };
  //     onFiltersChange?.(completeFilters);
  //   },
  //   [appliedFilters, sortModel, onFiltersChange, updatePaginationState]
  // );

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
    pagination,
    handlePageChange,
    getCompleteFilters
  };
};
