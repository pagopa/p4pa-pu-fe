import { styled } from '@mui/material';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { theme } from '@pagopa/mui-italia';

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

const CustomDataGrid: React.FC<DataGridProps> = (props) => <StyledDataGrid {...props} />;

export default CustomDataGrid;