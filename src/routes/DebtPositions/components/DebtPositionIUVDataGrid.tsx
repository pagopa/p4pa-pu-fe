import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import { PageRoutes } from '../../../routes';
import { generatePath, useNavigate } from 'react-router';
import type {
  InstallmentStatus,
  InstallmentViewDTO,
  PagedInstallmentView
} from '../../../../generated/core/data-contracts';
import { formatDate, moneyFormat } from '../../../utils/formatters';
import ChipTruncateTooltip from '../../../components/ChipTruncateTooltip';

import type ChipProps from '@mui/material/ChipProps';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ReadMore from '@mui/icons-material/ReadMore';

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

  const columns: Array<GridColDef<InstallmentViewDTO>> = [
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
      field: 'originalRemittanceInformation',
      headerName: t('debtPositionSearchResults.subject'),
      flex: 1,
      type: 'string',
      valueGetter: (_value, row) =>
        row.originalRemittanceInformation || row.remittanceInformation || ''
    },
    {
      field: 'amountCents',
      headerName: t('debtPositionSearchResults.amount'),
      flex: 1,
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      renderCell: (params: GridRenderCellParams<InstallmentViewDTO>) =>
        moneyFormat(params.value as number)
    },
    {
      field: 'dueDate',
      headerName: t('debtPositionSearchResults.expirationDate'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams<InstallmentViewDTO>) =>
        formatDate(params.value)
    },
    {
      field: 'status',
      headerName: t('debtPositionSearchResults.status'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams<InstallmentViewDTO>) => (
        <ChipTruncateTooltip
          label={t(`commons.status.${params.value}`)}
          tooltipLabel={t(`DebtPositions.installment.tooltip.${params.value}`)}
          color={stateColors[params.value as InstallmentStatus]}
          variant="outlined"
        />
      )
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.2,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<InstallmentViewDTO>) => (
        <IconButton
          size="small"
          aria-label={t('commons.goToDetail')}
          onClick={() => {
            navigate(
              generatePath(PageRoutes.DEBT_POSITION_INSTALLMENT_DETAIL, {
                id: params.row.installmentId
              })
            );
          }}
        >
          <ReadMore />
        </IconButton>
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
