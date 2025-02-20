import { styled } from '@mui/material';
import { DataGrid, DataGridProps, GridColDef, GridValidRowModel, GridSortModel } from '@mui/x-data-grid';
import { theme } from '@pagopa/mui-italia';
import CustomPagination from './CustomPagination';

const StyledDataGrid = styled(DataGrid)({
  border: 'none !important',
  '& .MuiDataGrid-columnHeader': {
    backgroundColor: theme.palette.grey[200],
  },
  '& .MuiDataGrid-columnSeparator': {
    color: theme.palette.grey[200],
  },
  backgroundColor: theme.palette.background.paper,
});

interface CustomDataGridProps<T extends GridValidRowModel> extends Omit<DataGridProps, 'rows' | 'columns'> {
  rows: T[];
  columns: GridColDef[];
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  customPagination?: {
    sizePageOptions?: number[];
    defaultPageOption?: number;
    totalPages?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  }
}

const CustomDataGrid = <T extends GridValidRowModel>({
  rows,
  columns,
  sortModel,
  onSortModelChange,
  customPagination,
  ...restProps
}: CustomDataGridProps<T>) => (
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

export default CustomDataGrid;
