import { GridColDef, GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import ActionMenu from '../ActionMenu/ActionMenu';
import CustomDataGrid from './../DataGrid/CustomDataGrid';

interface SearchResultDataRow extends GridValidRowModel {
  id: number;
  iuv: string;
  amount: string;
  dueType: string;
  paymentDate: string;
}

const SearchResultsDataGrid = () => {
  const { t } = useTranslation();

  const rows: SearchResultDataRow[] = [
    {
      id: 1,
      iuv: '03003300003',
      amount: '50,00€',
      dueType: 'TARI',
      paymentDate: '13/01/2025',
    },
    {
      id: 2,
      iuv: '02002200002',
      amount: '100,00€',
      dueType: 'Dovuto 2',
      paymentDate: '11/01/2025',
    },
    {
      id: 3,
      iuv: '01001100001',
      amount: '200,00€',
      dueType: 'Dovuto 3',
      paymentDate: '09/01/2025',
    },
  ];

  const columns: GridColDef[] = [
    { field: 'iuv', headerName: t('telematicReceiptSearchResultsDataGrid.iuv'), flex: 1, type: 'string' },
    { field: 'amount', headerName: t('telematicReceiptSearchResultsDataGrid.amount'), flex: 1, type: 'string' },
    { field: 'dueType', headerName: t('telematicReceiptSearchResultsDataGrid.duetype'), flex: 1, type: 'string' },
    { field: 'paymentDate', headerName: t('telematicReceiptSearchResultsDataGrid.paymentdate'), flex: 1, type: 'string' },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<SearchResultDataRow>) => <ActionMenu rowId={params.row.id} />,
    },
  ];

  return <CustomDataGrid rows={rows} columns={columns} 
    hideFooter
    disableColumnMenu
    disableColumnResize
  />;
};

export default SearchResultsDataGrid;
