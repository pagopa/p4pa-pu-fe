import {
  GridColDef,
  GridRenderCellParams,
  GridSortModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { ReadMore } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { Link, generatePath } from 'react-router';

import CustomDataGrid, {
  SmartPaginationConfig
} from '../../../../components/DataGrid/CustomDataGrid';
import { PageRoutes } from '../../../../routes';
import { moneyFormat } from '../../../../utils/formatters';
import { PaymentsReporting } from '../../../../../generated/apiClient';

type ReportingDetailDataGridProps = {
  rows: Array<PaymentsReporting>;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  smartPagination?: SmartPaginationConfig;
  isLoading?: boolean;
};

const ReportingDetailDataGrid = ({
  rows,
  sortModel,
  onSortModelChange,
  smartPagination,
  isLoading = false
}: ReportingDetailDataGridProps) => {
  const { t } = useTranslation();

  const columns: Array<GridColDef> = [
    {
      field: 'iuv',
      headerName: t('commons.iuv'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'iur',
      headerName: t('commons.iur'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'amountPaidCents',
      headerName: t('commons.amount'),
      flex: 0.7,
      type: 'string',
      renderCell: (params: GridRenderCellParams<PaymentsReporting>) =>
        moneyFormat(params.value as number)
    },
    {
      field: 'payDate',
      headerName: t('commons.paymentdate'),
      flex: 0.5,
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
          to={generatePath(PageRoutes.REPORTING_PAYMENT_DETAIL, {
            category: 'reporting',
            iuf: params.row.iuf,
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
        smartPagination={smartPagination}
        loading={isLoading}
      />
    </>
  );
};

export default ReportingDetailDataGrid;
