import {
  GridColDef,
  GridRenderCellParams,
  GridSortModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { ReadMore } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { PageRoutes } from '../../App';
import { Link } from 'react-router-dom';
import { generatePath } from 'react-router-dom';
import { moneyFormat } from '../../utils/formatters';
import { PaymentsReporting } from '../../../generated/apiClient';

type CustomPaginationProps = {
  totalPages?: number;
  totalElements?: number;
  defaultPageOption?: number;
  sizePageOptions?: Array<number>;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  currentPage?: number;
};

type ReportingDetailDataGridProps = {
  rows: Array<PaymentsReporting>;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  customPagination: CustomPaginationProps;
};

const ReportingDetailDataGrid = ({
  rows,
  sortModel,
  onSortModelChange,
  customPagination
}: ReportingDetailDataGridProps) => {
  const { t } = useTranslation();

  const columns: Array<GridColDef> = [
    { field: 'iuv', headerName: t('commons.iuv'), flex: 1, type: 'string' },
    { field: 'iur', headerName: t('commons.iur'), flex: 1, type: 'string' },
    {
      field: 'amountPaidCents',
      headerName: t('commons.amount'),
      flex: 1,
      type: 'string',
      valueFormatter: ({ value }) => moneyFormat(value || 0)
    },
    {
      field: 'payDate',
      headerName: t('commons.paymentdate'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams) =>
        params.value ? new Date(params.value).toLocaleDateString('it-IT') : ''
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Link
          to={generatePath(PageRoutes.DETAIL_FLOWS, {
            category: 'reporting',
            id: params.row.paymentsReportingId
          })}
          aria-label="go to reporting payment detail"
        >
          <IconButton color="primary" size="small">
            <ReadMore />
          </IconButton>
        </Link>
      )
    }
  ];

  return (
    <>
      <CustomDataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.paymentsReportingId}
        disableColumnMenu
        disableColumnResize
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        customPagination={customPagination}
      />
    </>
  );
};

export default ReportingDetailDataGrid;
