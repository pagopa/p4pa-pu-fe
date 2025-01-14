import { styled } from '@mui/material';
import { DataGrid, DataGridProps, GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { theme } from '@pagopa/mui-italia';

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
}

const CustomDataGrid = <T extends GridValidRowModel>({
  rows,
  columns,
  ...restProps
}: CustomDataGridProps<T>) => (
    <StyledDataGrid
      rows={rows}
      columns={columns}
      {...restProps}
    />
  );

export default CustomDataGrid;
