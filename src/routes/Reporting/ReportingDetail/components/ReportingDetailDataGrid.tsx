import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { ReadMore } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { Link } from 'react-router';
import CustomDataGrid from '../../../../components/DataGrid/CustomDataGrid';
import { moneyFormat } from '../../../../utils/formatters';
import {
  PagedPaymentsReportingRow,
  PaymentsReportingWithReceiptView
} from '../../../../../generated/core/client';
import { buildTelematicReceiptDetailPath } from '../../../../utils/receiptNavigation';

type ReportingDetailDataGridProps = {
  data?: PagedPaymentsReportingRow;
  isLoading?: boolean;
};

const ReportingDetailDataGrid = ({
  data,
  isLoading = false
}: ReportingDetailDataGridProps) => {
  const { t } = useTranslation();

  const columns: Array<GridColDef<PaymentsReportingWithReceiptView>> = [
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
      renderCell: (
        params: GridRenderCellParams<PaymentsReportingWithReceiptView>
      ) => moneyFormat(params.value as number)
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
      renderCell: (params) => {
        if (!params.row?.receiptId || !params.row?.iud) {
          return null;
        }
        const detailPath = buildTelematicReceiptDetailPath(
          params.row.receiptId,
          params.row.iud
        );
        return (
          <Link to={detailPath}>
            <IconButton
              aria-label={t('commons.routes.TELEMATIC_RECEIPT_DETAIL')}
              size="small"
            >
              <ReadMore />
            </IconButton>
          </Link>
        );
      }
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
