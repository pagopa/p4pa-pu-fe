import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GridSortModel } from '@mui/x-data-grid';
import utils from '../utils';
import { useHashParamsListener } from './useHashParamsListener';

export type UsePaginationProps = {
  initialPage?: number;
  initialPageSize?: number;
  initialSortModel?: GridSortModel;
  totalPages: number;
  totalItems?: number;
};

export const usePagination = ({
  initialPage = 1,
  initialPageSize = 10,
  initialSortModel = [],
  totalPages = 1,
  totalItems = 0
}: UsePaginationProps) => {
  const {
    page: hashPage,
    size: hashSize,
    sortField: hashSort,
    sortDirection: hashSortDirection,
    ...hashParams
  } = useHashParamsListener<Record<string, unknown>>();

  const [announcement, setAnnouncement] = useState('');
  const { t } = useTranslation();

  const announce = (message: string) => {
    setAnnouncement('');
    setTimeout(() => setAnnouncement(message), 1000);
  };

  useEffect(() => {
    if (totalPages && totalItems > 0) {
      announce(t('a11y.grid.filtersApplied', { count: totalPages }));
    }
  }, [totalPages, totalItems]);

  const getPageFromHash = () => {
    const page = hashPage ? Number(hashPage) : initialPage;
    return isNaN(page) || page < 1 ? initialPage : page;
  };

  const getSizeFromHash = () => {
    const size = hashSize ? Number(hashSize) : initialPageSize;
    return isNaN(size) || size < 1 ? initialPageSize : size;
  };

  const getSortModelFromHash = (): GridSortModel => {
    const sortField = typeof hashSort === 'string' ? hashSort : undefined;
    const sortDirection =
      typeof hashSortDirection === 'string' &&
      (hashSortDirection === 'asc' || hashSortDirection === 'desc')
        ? (hashSortDirection as 'asc' | 'desc')
        : undefined;
    return sortField && sortDirection
      ? [{ field: sortField, sort: sortDirection }]
      : initialSortModel;
  };

  const page = getPageFromHash();
  const pageSize = getSizeFromHash();
  const sortModel = getSortModelFromHash();

  const updateHashParams = useCallback(
    (newPage: number, newSize: number, newSortModel: GridSortModel) => {
      const sort =
        newSortModel.length > 0
          ? {
              sortField: newSortModel[0].field,
              sortDirection: newSortModel[0].sort
            }
          : {};

      const paramsObj = {
        ...hashParams,
        page: newPage,
        size: newSize,
        ...sort
      };
      utils.URI.set(utils.URI.encode(paramsObj));
    },
    [hashParams]
  );

  const handlePageChange = (newPage: number) => {
    announce(t('a11y.grid.pageChanged', { newPage, totalPages }));
    updateHashParams(newPage, pageSize, sortModel);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    announce(t('a11y.grid.pageSizeChanged', { pageSize: newPageSize }));
    updateHashParams(page, newPageSize, sortModel);
  };

  return {
    page,
    pageSize,
    sortModel,
    announcement,
    handlePageChange,
    handlePageSizeChange
  };
};
