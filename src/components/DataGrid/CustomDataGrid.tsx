import { styled } from '@mui/material';
import { DataGrid, DataGridProps, GridColDef, GridValidRowModel } from '@mui/x-data-grid';
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
  customPagination,
  ...restProps
}: CustomDataGridProps<T>) => (
    <StyledDataGrid
      rows={rows}
      columns={columns}
      pagination
      disableRowSelectionOnClick
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
