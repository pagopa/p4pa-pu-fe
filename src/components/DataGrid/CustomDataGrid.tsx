import { useCallback, useEffect } from 'react';
import { Grid, styled, useTheme, Box, Typography } from '@mui/material';
import {
  DataGrid,
  DataGridProps,
  GridColDef,
  GridValidRowModel,
  GridSortModel
} from '@mui/x-data-grid';
import { theme } from '@pagopa/mui-italia';
import CustomPagination from './CustomPagination';
import utils from '../../utils';
import { useHashParamsListener } from '../../hooks/useHashParamsListener';
import { useTranslation } from 'react-i18next';
import { useScreenReaderAnnouncement } from '../../hooks/useScreenReaderAnnouncement';

const StyledDataGrid = styled(DataGrid)({
  border: 'none !important',
  '& .MuiDataGrid-columnHeader': {
    backgroundColor: theme.palette.grey[200]
  },
  '& .MuiDataGrid-columnSeparator': {
    color: theme.palette.grey[200]
  },
  backgroundColor: theme.palette.background.paper
});

export type CustomDataGridProps<T extends GridValidRowModel> = {
  rows: Array<T>;
  columns: Array<GridColDef>;
  initialPage?: number; // 1-based indexing as fallback
  initialPageSize?: number;
  pageSizeOptions?: Array<number>;
  initialSortModel?: GridSortModel;
  totalPages: number;
} & Omit<
  DataGridProps,
  | 'pagination'
  | 'paginationModel'
  | 'onPaginationModelChange'
  | 'sortModel'
  | 'onSortModelChange'
>;

const CustomDataGrid = <T extends GridValidRowModel>({
  rows,
  columns,
  initialPage = 1,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20],
  initialSortModel = [],
  totalPages = 1,
  ...restProps
}: CustomDataGridProps<T>) => {
  // Read from URL hash params directly
  const {
    page: hashPage,
    size: hashSize,
    sortField: hashSort,
    sortDirection: hashSortDirection,
    ...hashParams
  } = useHashParamsListener<Record<string, unknown>>();

  const { t } = useTranslation();
  const { announce } = useScreenReaderAnnouncement();

  const getPageFromHash = () => {
    const page = hashPage ? Number(hashPage) : initialPage;
    return isNaN(page) || page < 1 ? initialPage : page;
  };

  useEffect(() => {
    if (totalPages > 1 || rows.length > 0) {
      announce(t('a11y.grid.filtersApplied', { count: totalPages }));
    } else {
      announce(t('a11y.grid.noResults'));
    }
  }, [totalPages, rows.length]);

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

  // Write updated params into URL hash
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

      const encoded = utils.URI.encode(paramsObj);
      utils.URI.set(encoded);
    },
    [hashParams]
  );

  const handlePageChange = (newPage: number) => {
    announce(
      t('a11y.grid.pageChanged', {
        newPage,
        totalPages
      })
    );
    updateHashParams(newPage, pageSize, sortModel);
  };

  const handlePageSizeChange = (pageSize: number) => {
    announce(t('a11y.grid.pageSizeChanged', { pageSize }));
    updateHashParams(page, pageSize, sortModel);
  };

  const handleSortModelChange = (newSortModel: GridSortModel) => {
    if (newSortModel.length > 0) {
      const column =
        columns.find((col) => col.field === newSortModel[0].field)
          ?.headerName || newSortModel[0].field;
      announce(
        t('a11y.grid.sortedBy', {
          column,
          order: t(`a11y.grid.${newSortModel[0].sort}`)
        })
      );
    } else {
      announce(t('a11y.grid.sortCleared'));
    }
    updateHashParams(page, pageSize, newSortModel);
  };

  return (
    <StyledDataGrid
      rows={rows}
      columns={columns}
      pagination
      paginationMode="client"
      sortingMode="client"
      sortModel={sortModel}
      onSortModelChange={handleSortModelChange}
      hideFooterSelectedRowCount
      aria-label={t('commons.tableResults')}
      slotProps={{
        root: {
          id: 'data-results-table'
        }
      }}
      slots={{
        pagination: () => (
          <CustomPagination
            sizePageOptions={pageSizeOptions}
            defaultPageOption={pageSize}
            totalPages={totalPages}
            currentPage={page}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )
      }}
      localeText={{
        noRowsLabel: t('commons.noRows')
      }}
      {...restProps}
    />
  );
};

export default CustomDataGrid;

export const DataGridContainer = (props: { children: React.ReactNode }) => {
  const theme = useTheme();
  return (
    <Grid
      container
      p={2}
      height="100%"
      sx={{
        bgcolor: theme.palette.grey[200],
        overflow: 'auto'
      }}
      role="region"
    >
      {props.children}
    </Grid>
  );
};

export const EmptyData = (props: { title: string; description: string }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        bgcolor: theme.palette.grey[200],
        padding: 2
      }}
    >
      <Box
        sx={{
          bgcolor: theme.palette.background.paper,
          padding: 2
        }}
        role="region"
      >
        <Typography textAlign="center" fontWeight={600} mb={1} component="h2">
          {props.title}
        </Typography>
        <Typography textAlign="center">{props.description}</Typography>
      </Box>
    </Box>
  );
};
