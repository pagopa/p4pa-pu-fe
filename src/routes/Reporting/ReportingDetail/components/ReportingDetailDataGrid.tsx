import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { ReadMore } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { Link, generatePath } from 'react-router';

import CustomDataGrid from '../../../../components/DataGrid/CustomDataGrid';
import { PageRoutes } from '../../../../routes';
import { moneyFormat } from '../../../../utils/formatters';
import {
  PagedPaymentsReportingRow,
  PaymentsReporting
} from '../../../../../generated/apiClient';

type ReportingDetailDataGridProps = {
  data?: PagedPaymentsReportingRow;
  isLoading?: boolean;
};

const ReportingDetailDataGrid = ({
  data,
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
    <CustomDataGrid
      rows={data?.content || []}
      columns={columns}
      getRowId={(row) => row.paymentsReportingId}
      disableColumnMenu
      disableColumnResize
      loading={isLoading}
      totalPages={data?.totalPages || 1}
    />
  );
};

export default ReportingDetailDataGrid;
