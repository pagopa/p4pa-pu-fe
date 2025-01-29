import { GridColDef, GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import ActionMenu from '../ActionMenu/ActionMenu';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { FileDownload, Visibility } from '@mui/icons-material';

interface SearchResultDataRow extends GridValidRowModel {
  id: number;
  idReporting: string;
  idRegulation: string;
  regulationDate: string;
  flowDate: string;
  payments: string;
  totalAmount: string;
}

const SearchResultsDataGrid = () => {
  const { t } = useTranslation();

  const rows: SearchResultDataRow[] = [
    {
      id: 1,
      idReporting: '2024-11-10123531',
      idRegulation: '49445-2454456456',
      regulationDate: '05/11/2021',
      flowDate: '05/11/2021 04:06:44',
      payments: '100',
      totalAmount: '100,00 €'
    },
    {
      id: 2,
      idReporting: '2024-11-10123531',
      idRegulation: '50445-2454456456',
      regulationDate: '06/11/2021',
      flowDate: '06/11/2021 05:06:44',
      payments: '200',
      totalAmount: '200,00 €'
    },
    {
      id: 3,
      idReporting: '2024-12-10123531',
      idRegulation: '514453-2454456456',
      regulationDate: '07/11/2021',
      flowDate: '07/11/2021 06:06:44',
      payments: '300',
      totalAmount: '300,00 €'
    },
  ];

  const columns: GridColDef[] = [
    { field: 'idReporting', headerName: t('reportingSearchResults.searchReportingId'), flex: 1, type: 'string' },
    { field: 'idRegulation', headerName: t('reportingSearchResults.searchRegulationId'), flex: 1, type: 'string' },
    { field: 'regulationDate', headerName: t('reportingSearchResults.regulationDate'), flex: 1, type: 'string' },
    { field: 'flowDate', headerName: t('reportingSearchResults.flowDate'), flex: 1, type: 'string' },
    { field: 'payments', headerName: t('reportingSearchResults.payments'), flex: 1, type: 'string' },
    { field: 'totalAmount', headerName: t('reportingSearchResults.totalAmount'), flex: 1, type: 'string' },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<SearchResultDataRow>) => 
        <ActionMenu 
          rowId={params.row.id}
          menuItems={[
            {
              icon: <Visibility fontSize="small" />,
              label: t('actionMenu.viewDetail'),
              action: () => console.log('Visualizza')
            },
            {
              icon: <FileDownload fontSize="small" />,
              label: t('actionMenu.download'),
              action: () => console.log('Scarica file per ID: ', params.row.id),
            }
          ]}
        />,
    },
  ];

  return (
    <>
      <CustomDataGrid
        rows={rows}
        columns={columns}
        disableColumnMenu
        disableColumnResize
        customPagination={{
          totalPages: 10
        }}
      />
    </>
  );
};

export default SearchResultsDataGrid;
