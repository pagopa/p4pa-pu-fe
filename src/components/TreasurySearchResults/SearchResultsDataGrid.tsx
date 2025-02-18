import { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { ReadMore } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { generatePath, Link } from 'react-router-dom';
import { PageRoutes } from '../../routes/routes';

interface SearchResultDataRow extends GridValidRowModel {
  id: number;
  billingYear: string;
  billingCode: string;
  valueDate: string;
  reportingId: string;
  amount: string;
}

const SearchResultsDataGrid = () => {
  const { t } = useTranslation();

  const rows: SearchResultDataRow[] = [
    {
      id: 1,
      billingYear: '2024',
      billingCode: '2000777',
      valueDate: '02/09/2024',
      accountingDate: '02/09/2024',
      reportingId: '2024-09-03424234234',
      amount: '50,00 €'
    },
    {
      id: 2,
      billingYear: '2024',
      billingCode: '2100777',
      valueDate: '09/09/2024',
      accountingDate: '09/09/2024',
      reportingId: '2024-09-13424234234',
      amount: '80,00 €'
    },
    {
      id: 3,
      billingYear: '2024',
      billingCode: '2200777',
      valueDate: '11/09/2024',
      accountingDate: '11/09/2024',
      reportingId: '2024-09-23424234234',
      amount: '100,00 €'
    },
  ];

  const columns: GridColDef[] = [
    { field: 'billingYear', headerName: t('treasurySearchResults.billingYear'), flex: 1, type: 'string' },
    { field: 'billingCode', headerName: t('treasurySearchResults.billingCode'), flex: 1, type: 'string' },
    { field: 'valueDate', headerName: t('treasurySearchResults.valueDate'), flex: 1, type: 'string' },
    { field: 'accountingDate', headerName: t('treasurySearchResults.accountingDate'), flex: 1, type: 'string' },
    { field: 'reportingId', headerName: t('treasurySearchResults.reportingId'), flex: 1, type: 'string' },
    { field: 'amount', headerName: t('commons.amount'), flex: 1, type: 'string' },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: () => (
        <Link
          to={generatePath(PageRoutes.DETAIL_FLOWS, {category: 'treasury'})}
          aria-label='go to treasury detail'
        >
          <IconButton
            color="primary"
            size="small"
          >
            <ReadMore />
          </IconButton>
        </Link>
      ),
    },
  ];

  return (
    <>
      <CustomDataGrid
        rows={rows}
        columns={columns}
        hideFooter
        disableColumnMenu
        disableColumnResize
      />
    </>
  );
};

export default SearchResultsDataGrid;
