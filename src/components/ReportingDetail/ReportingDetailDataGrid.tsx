import { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { ReadMore } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { PageRoutes } from '../../App';
import { Link } from 'react-router-dom';
import { generatePath } from 'react-router-dom';

interface ReportingDetailDataRow extends GridValidRowModel {
  id: number;
  iuv: string;
  iur: string;
  totalAmount: string;
  paymentDate: string;
}

const ReportingDetailDataGrid = () => {

  const { t } = useTranslation();

  const rows: ReportingDetailDataRow[] = [
    {
      id: 1,
      iuv: '03003300003',
      iur: 'ceae4bca84desdf3',
      totalAmount: '100,00 €',
      paymentDate: '10/10/2024'
    },
    {
      id: 2,
      iuv: '130036540003',
      iur: 'iR3sT2uG888KkKK',
      totalAmount: '200,00 €',
      paymentDate: '11/10/2024'
    },
    {
      id: 3,
      iuv: '330112200003',
      iur: 'yuR3sT2uG888KkKK',
      totalAmount: '150,00 €',
      paymentDate: '12/10/2024'
    },
   
  ];

  const columns: GridColDef[] = [
    { field: 'iuv', headerName: t('commons.iuv'), flex: 1, type: 'string' },
    { field: 'iur', headerName: t('commons.iur'), flex: 1, type: 'string' },
    { field: 'totalAmount', headerName: t('commons.amount'), flex: 1, type: 'string' },
    { field: 'paymentDate', headerName: t('commons.paymentdate'), flex: 1, type: 'string' },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: () => (
        <Link
          to={generatePath(PageRoutes.DETAIL_FLOWS, {category: 'reporting'})}
          aria-label='go to reporting payment detail'
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
        disableColumnMenu
        disableColumnResize
        customPagination={{
          totalPages: 10
        }}
      />
    </>
  );
};

export default ReportingDetailDataGrid;
