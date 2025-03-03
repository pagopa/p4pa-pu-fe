import { GridColDef, GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { ReadMore } from '@mui/icons-material';
import { Chip, ChipProps, Typography } from '@mui/material';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';

interface SearchResultDataRow extends GridValidRowModel {
  iuv: string;
  subject: string;
  amount: number;
  expirationDate: string;
  status: string;
}

const DebtPositionDataGrid = () => {

  const { t } = useTranslation();

  const stateColors: Record<string, ChipProps['color']> = {
    TO_PAY: 'info',
    PAYED: 'success',
    ERROR: 'error'
  };

  const rows: SearchResultDataRow[] = [
    {
      iuv: '03003300033300003333',
      subject: '2024-11-10123531',
      amount: 100,
      expirationDate: '05/11/2021',
      status: 'TO_PAY'
    },
    {
      iuv: '02002200022200002222',
      subject: '2024-12-11123531',
      amount: 200,
      expirationDate: '05/12/2021',
      status: 'PAYED'
    },
    {
      iuv: '01001100011100001111',
      subject: '2024-11-10123531',
      amount: 100,
      expirationDate: '05/11/2021',
      status: 'TO_PAY'
    },
  ];

  const columns: GridColDef[] = [
    { field: 'iuv', headerName: t('debtPositionSearchResults.iuv'), flex: 1, type: 'string', renderCell: (params) => (
      <Typography variant='monospaced'>
        {params.value}
      </Typography>
    ) },
    { field: 'subject', headerName: t('debtPositionSearchResults.subject'), flex: 1, type: 'string' },
    { field: 'amount', headerName: t('debtPositionSearchResults.amount'), flex: 1, type: 'number', 
      headerAlign: 'left', 
      align: 'left' 
    },
    { field: 'expirationDate', headerName: t('debtPositionSearchResults.expirationDate'), flex: 1, type: 'string' },
    { field: 'status', headerName: t('debtPositionSearchResults.status'), flex: 1, type: 'string', 
      renderCell: (params: GridRenderCellParams<SearchResultDataRow>) => (
        <Chip
          label={t(`DebtPositions.Results.status.${params.value}`)}
          title={t(params.value)}
          color={stateColors[params.value]}
          size="small"
        />
      )
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<SearchResultDataRow>) => (
        <ReadMore 
          fontSize="small"
          color='primary'
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            console.log('Dettaglio per ID: ', params.row.iuv);
          }}
        />
      ),
    }
  ];

  return (
    <>
      <CustomDataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.iuv}
        disableColumnMenu
        disableColumnResize
        customPagination={{
          defaultPageOption: 5,
          sizePageOptions: [5, 10, 20]
        }}
      />
    </>
  );
};

export default DebtPositionDataGrid;
