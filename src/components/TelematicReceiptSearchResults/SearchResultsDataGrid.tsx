import { useState } from 'react';
import { GridColDef, GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import ActionMenu from '../ActionMenu/ActionMenu';
import CustomDataGrid from './../DataGrid/CustomDataGrid';
import { FileDownload, ReadMore } from '@mui/icons-material';
import CustomDrawer from '../Drawer/CustomDrawer';
import { Download } from '@mui/icons-material';

interface SearchResultDataRow extends GridValidRowModel {
  id: number;
  iuv: string;
  amount: string;
  dueType: string;
  paymentDate: string;
}

const SearchResultsDataGrid = () => {
  const { t } = useTranslation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<SearchResultDataRow | null>(null);

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
      renderCell: (params: GridRenderCellParams<SearchResultDataRow>) => 
        <ActionMenu 
          rowId={params.row.id}
          menuItems={[
            {
              icon: <ReadMore fontSize="small" />,
              label: t('actionMenu.detail'),
              action: () => handleDetailClick(params.row),
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

  const handleDetailClick = (row: SearchResultDataRow) => {
    setSelectedRow(row);
    setDrawerOpen(true);
  };
  

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedRow(null);
  };

  const fieldConfigurations = [
    { id: 'iuv', labelKey: 'telematicreceiptSearchResults.drawer.iuv', variant: 'monospaced' },
    { id: 'amount', labelKey: 'telematicreceiptSearchResults.drawer.amount' },
    { id: 'reason', labelKey: 'telematicreceiptSearchResults.drawer.reason' },
    { id: 'dueType', labelKey: 'telematicreceiptSearchResults.drawer.dueType' },
    { id: 'payer', labelKey: 'telematicreceiptSearchResults.drawer.payer' },
    { id: 'fiscalCodeorVat', labelKey: 'telematicreceiptSearchResults.drawer.fiscalCodeorVat' },
    { id: 'paymentDate', labelKey: 'telematicreceiptSearchResults.drawer.paymentDate' },
    { id: 'paymentExecutor', labelKey: 'telematicreceiptSearchResults.drawer.paymentExecutor' },
    {
      id: 'fiscalCodeorVatExecutor',
      labelKey: 'telematicreceiptSearchResults.drawer.fiscalCodeorVatExecutor',
    },
    { id: 'auditor', labelKey: 'telematicreceiptSearchResults.drawer.auditor' },
    { id: 'iud', labelKey: 'telematicreceiptSearchResults.drawer.iud' },
    { id: 'iur', labelKey: 'telematicreceiptSearchResults.drawer.iur' },
  ];
  
  const drawerFields = selectedRow
    ? fieldConfigurations.map(({ id, labelKey, variant }) => ({
      id,
      label: t(labelKey),
      value: selectedRow[id as keyof SearchResultDataRow]?.toString() || '',
      variant: variant as 'monospaced',
    }))
    : [];


  return (
    <>
      <CustomDataGrid
        rows={rows}
        columns={columns}
        hideFooter
        disableColumnMenu
        disableColumnResize
      />
      <CustomDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        fields={drawerFields}
        title={t('telematicreceiptSearchResults.drawer.title')}
        buttonText={t('telematicreceiptSearchResults.drawer.actionButton')}
        onButtonClick={() => console.log('Download Button clicked!')}
        startIcon={<Download/>}
      />
    </>
  );
};

export default SearchResultsDataGrid;
