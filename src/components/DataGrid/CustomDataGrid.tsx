import { Grid, styled, useTheme, Box, Typography } from '@mui/material';
import {
  DataGrid,
  DataGridProps,
  GridColDef,
  GridValidRowModel,
  GridSortModel
} from '@mui/x-data-grid';
import { theme } from '@pagopa/mui-italia';
import {
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useMemo
} from 'react';
import CustomPagination from './CustomPagination';
import { useDataGridPaginationWithUrl } from '../../hooks/useDataGridPaginationWithUrl';

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

export type SmartPaginationConfig = {
  initialPage?: number;
  initialSize?: number;
  sizeOptions?: Array<number>;
  backendData?: {
    totalElements?: number;
    totalPages?: number;
    number?: number; // Current page (0-based)
    size?: number;
  };
  onFiltersApplied?: () => void;
  onPaginationChange?: (pagination: { page: number; size: number }) => void;
};

export type CustomDataGridRef = {
  resetPagination: () => void;
  getCurrentPage: () => number;
  getCurrentSize: () => number;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
};

export type CustomDataGridProps<T extends GridValidRowModel> = {
  rows: Array<T>;
  columns: Array<GridColDef>;
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;

  // Legacy support for backward compatibility
  customPagination?: {
    sizePageOptions?: Array<number>;
    defaultPageOption?: number;
    totalPages?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };

  // Smart pagination configuration with URL sync
  smartPagination?: SmartPaginationConfig;
} & Omit<DataGridProps, 'rows' | 'columns'>;

const CustomDataGrid = forwardRef<
  CustomDataGridRef,
  CustomDataGridProps<GridValidRowModel>
>(
  (
    {
      rows,
      columns,
      sortModel,
      onSortModelChange,
      customPagination,
      smartPagination,
      ...restProps
    },
    ref
  ) => {
    const isLegacyMode = !smartPagination || customPagination;

    if (isLegacyMode) {
      return (
        <StyledDataGrid
          rows={rows}
          columns={columns}
          pagination
          disableRowSelectionOnClick
          sortModel={sortModel}
          onSortModelChange={onSortModelChange}
          slots={{
            pagination: () => (
              <CustomPagination
                sizePageOptions={customPagination?.sizePageOptions}
                defaultPageOption={customPagination?.defaultPageOption}
                totalPages={customPagination?.totalPages}
                currentPage={customPagination?.currentPage}
                onPageChange={customPagination?.onPageChange}
                onPageSizeChange={customPagination?.onPageSizeChange}
              />
            )
          }}
          {...restProps}
        />
      );
    }

    const memoizedBackendData = useMemo(() => {
      if (!smartPagination?.backendData) {
        return null;
      }

      const { backendData } = smartPagination;

      if (
        typeof backendData.number !== 'number' ||
        typeof backendData.size !== 'number'
      ) {
        return null;
      }

      const result = {
        totalElements: backendData.totalElements || 0,
        totalPages: backendData.totalPages || 0,
        number: backendData.number,
        size: backendData.size
      };

      return result;
    }, [
      // Create a stable reference by stringifying the values
      JSON.stringify({
        totalElements: smartPagination?.backendData?.totalElements,
        totalPages: smartPagination?.backendData?.totalPages,
        number: smartPagination?.backendData?.number,
        size: smartPagination?.backendData?.size
      })
    ]);

    // Hook per URL sync
    const urlPagination = useDataGridPaginationWithUrl({
      initialPage: smartPagination.initialPage || 0,
      initialSize: smartPagination.initialSize || 10,
      totalElements: memoizedBackendData?.totalElements || 0,
      onPaginationChange: smartPagination.onPaginationChange
    });

    // Auto-sync with backend data when available (URL sync only)
    useEffect(() => {
      // Skip sync if backend data is empty/invalid (loading state)
      if (
        !memoizedBackendData ||
        !urlPagination ||
        memoizedBackendData.totalElements === 0 ||
        memoizedBackendData.totalPages === 0
      ) {
        return;
      }

      if (!smartPagination?.onPaginationChange) {
        // No callback - full auto-sync
        urlPagination.syncWithBackendData(memoizedBackendData);
      } else {
        // With callback - validate invalid pages only
        const currentUrlPage = parseInt(
          new URLSearchParams(window.location.search).get('page') || '1'
        );

        if (
          currentUrlPage > memoizedBackendData.totalPages &&
          memoizedBackendData.totalPages > 0
        ) {
          urlPagination.syncWithBackendData(memoizedBackendData);
        }
      }
    }, [
      memoizedBackendData,
      smartPagination?.onPaginationChange,
      urlPagination?.syncWithBackendData
    ]);

    // Handler for reset pagination on filters
    const handleFiltersApplied = useCallback(() => {
      if (urlPagination) {
        urlPagination.handlePageChange(1);
      }
      smartPagination?.onFiltersApplied?.();
    }, [urlPagination, smartPagination?.onFiltersApplied]);

    // Expose API through ref for programmatic control
    useImperativeHandle(
      ref,
      () => ({
        resetPagination: handleFiltersApplied,
        getCurrentPage: () => urlPagination?.pagination.currentPage || 1,
        getCurrentSize: () => urlPagination?.pagination.size || 10,
        goToPage: (page: number) => {
          urlPagination?.handlePageChange(page);
        },
        setPageSize: (size: number) => {
          urlPagination?.handlePageSizeChange(size);
        }
      }),
      [urlPagination, handleFiltersApplied]
    );

    return (
      <StyledDataGrid
        rows={rows}
        columns={columns}
        pagination
        disableRowSelectionOnClick
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        slots={{
          pagination: () => (
            <CustomPagination
              sizePageOptions={smartPagination.sizeOptions || [5, 10, 20]}
              defaultPageOption={urlPagination.pagination.size}
              totalPages={smartPagination.backendData?.totalPages || 1}
              currentPage={urlPagination.pagination.currentPage}
              onPageChange={urlPagination.handlePageChange}
              onPageSizeChange={urlPagination.handlePageSizeChange}
            />
          )
        }}
        {...restProps}
      />
    );
  }
);

CustomDataGrid.displayName = 'CustomDataGrid';

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
      aria-label="results-table"
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
      >
        <Typography textAlign="center" fontWeight={600} mb={1}>
          {props.title}
        </Typography>
        <Typography textAlign="center">{props.description}</Typography>
      </Box>
    </Box>
  );
};
