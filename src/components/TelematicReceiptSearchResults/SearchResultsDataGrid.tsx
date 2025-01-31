import { GridColDef, GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import ActionMenu from '../ActionMenu/ActionMenu';
import CustomDataGrid from './../DataGrid/CustomDataGrid';
import { FileDownload, ReadMore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../routes/routes';

interface SearchResultDataRow extends GridValidRowModel {
  id: number;
  iuv: string;
  amount: string;
  dueType: string;
  paymentDate: string;
}

const SearchResultsDataGrid = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const rows: SearchResultDataRow[] = [
    {
      id: 1,
      iuv: '03003300003',
      amount: '50,00€',
      reason: 'TARI 2024',
      dueType: 'TARI',
      payer: 'Maria Bianchi',
      fiscalCodeorVat: 'BNCMRA82B42C933X (Persona fisica)',
      paymentDate: '13/01/2025',
      paymentExecutor: 'Paolo Rossi',
      fiscalCodeorVatExecutor: 'PLRSRA82B42C933X (Persona fisica)',
      auditor: 'POSTMAN_TEST',
      iud: '000a99aa114e6b142268f27abb8b347c37d',
      iur: 'hR3sT2uG888KkKK'
    },
    {
      id: 2,
      iuv: '02002200002',
      amount: '100,00€',
      reason: 'DOVUTO',
      dueType: 'DOVUTO 1',
      payer: 'Mario Rossi',
      fiscalCodeorVat: 'MRORSI82B42C933X (Persona fisica)',
      paymentDate: '18/03/2025',
      paymentExecutor: 'Giuseppe Verdi',
      fiscalCodeorVatExecutor: 'GSUVRD82B42C933X (Persona fisica)',
      auditor: 'POSTMAN_TEST_1',
      iud: 'iud_test_1',
      iur: 'iur_test_1'
    },
    {
      id: 3,
      iuv: '01001100001',
      amount: '200,00€',
      reason: 'DOVUTO',
      dueType: 'DOVUTO 2',
      payer: 'Valerio Verdi',
      fiscalCodeorVat: 'VLRVRD82B42C933X (Persona fisica)',
      paymentDate: '18/12/2024',
      paymentExecutor: 'Barbara Gialli',
      fiscalCodeorVatExecutor: 'BRBGLL82B42C933X (Persona fisica)',
      auditor: 'POSTMAN_TEST_2',
      iud: 'iud_test_2',
      iur: 'iur_test_2'
    },
  ];

  const columns: GridColDef[] = [
    { field: 'iuv', headerName: t('commons.iuv'), flex: 1, type: 'string' },
    { field: 'amount', headerName: t('commons.amount'), flex: 1, type: 'string' },
    { field: 'dueType', headerName: t('commons.duetype'), flex: 1, type: 'string' },
    { field: 'paymentDate', headerName: t('commons.paymentdate'), flex: 1, type: 'string' },
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
              icon: <ReadMore fontSize="small" />,
              label: t('commons.detail'),
              action: () => navigate(PageRoutes.TELEMATIC_RECEIPT_DETAIL)
            },
            {
              icon: <FileDownload fontSize="small" />,
              label: t('commons.files.download'),
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
        hideFooter
        disableColumnMenu
        disableColumnResize
      />
    </>
  );
};

export default SearchResultsDataGrid;
