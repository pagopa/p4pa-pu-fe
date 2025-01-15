import { GridColDef, GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import CustomDataGrid from './../DataGrid/CustomDataGrid';

interface FlowDataRow extends GridValidRowModel {
  id: number;
  name: string;
  date: string;
  operator: string;
  size: string;
}

const FlowDataGrid = () => {
  const { t } = useTranslation();

  const rows: FlowDataRow[] = [
    {
      id: 1,
      name: 'Esportazione 1',
      date: '05/11/2024 04:06:44',
      operator: 'Sistema Informativo 1',
      size: '800 bytes',
    },
    {
      id: 2,
      name: 'Esportazione 2',
      date: '06/11/2024 04:06:44',
      operator: 'Sistema Informativo 2',
      size: '422 bytes',
    },
    {
      id: 3,
      name: 'Esportazione 3',
      date: '06/11/2024 05:06:44',
      operator: 'Sistema Informativo 3',
      size: '345 bytes',
    },
  ];

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('flowDataGrid.name'), flex: 1, type: 'string' },
    { field: 'date', headerName: t('flowDataGrid.reservationDate'), flex: 1, type: 'string' },
    { field: 'operator', headerName: t('flowDataGrid.operator'), flex: 1, type: 'string' },
    { field: 'size', headerName: t('flowDataGrid.fileSize'), flex: 1, type: 'string' },
    {
      field: 'download',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<FlowDataRow>) => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => {
            console.log(`Download ID: ${params.row.id}`);
          }}
        >
          <DownloadIcon />
        </IconButton>
      ),
    },
  ];

  return <CustomDataGrid 
    rows={rows} 
    columns={columns} 
    hideFooter
    disableColumnMenu
    disableColumnResize
  />;
};

export default FlowDataGrid;
