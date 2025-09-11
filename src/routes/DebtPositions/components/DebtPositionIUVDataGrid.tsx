import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { ReadMore } from '@mui/icons-material';
import { ChipProps, Typography } from '@mui/material';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import { PageRoutes } from '../../../routes';
import { generatePath, useNavigate } from 'react-router';
import {
  InstallmentStatus,
  InstallmentView,
  PagedInstallmentView
} from '../../../../generated/data-contracts';
import { formatDate, moneyFormat } from '../../../utils/formatters';
import ChipTruncateTooltip from '../../../components/ChipTruncateTooltip';

export type DataGridProps = {
  data?: PagedInstallmentView;
};

export const stateColors: Record<InstallmentStatus, ChipProps['color']> = {
  CANCELLED: 'error',
  DRAFT: 'default',
  EXPIRED: 'error',
  PAID: 'success',
  REPORTED: 'success',
  TO_SYNC: 'default',
  UNPAID: 'info',
  INVALID: 'error',
  UNPAYABLE: 'error'
};

export const IUVDataGrid = ({ data }: DataGridProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const safeRows =
    data?.content?.filter((row) => row.installmentId != null) || [];

  const columns: Array<GridColDef<InstallmentView>> = [
    {
      field: 'iuv',
      headerName: t('debtPositionSearchResults.iuv'),
      flex: 1,
      type: 'string',
      renderCell: (params) => (
        <Typography variant="monospaced">{params.value}</Typography>
      )
    },
    {
      field: 'remittanceInformation',
      headerName: t('debtPositionSearchResults.subject'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'amountCents',
      headerName: t('debtPositionSearchResults.amount'),
      flex: 1,
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      renderCell: (params: GridRenderCellParams<InstallmentView>) =>
        moneyFormat(params.value as number)
    },
    {
      field: 'dueDate',
      headerName: t('debtPositionSearchResults.expirationDate'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams<InstallmentView>) =>
        formatDate(params.value)
    },
    {
      field: 'status',
      headerName: t('debtPositionSearchResults.status'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams<InstallmentView>) => (
        <ChipTruncateTooltip
          label={t(`commons.status.${params.value}`)}
          color={stateColors[params.value as InstallmentStatus]}
          variant="outlined"
        />
      )
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<InstallmentView>) => (
        <ReadMore
          fontSize="small"
          color="primary"
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            navigate(
              generatePath(PageRoutes.DEBT_POSITION_INSTALLMENT_DETAIL, {
                id: params.row.installmentId
              }),
              {
                state: {
                  remittanceInformation: params.row.remittanceInformation
                }
              }
            );
          }}
        />
      )
    }
  ];

  return (
    <CustomDataGrid
      rows={safeRows}
      getRowId={(row) => row.installmentId}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      totalPages={data?.totalPages || 1}
    />
  );
};
