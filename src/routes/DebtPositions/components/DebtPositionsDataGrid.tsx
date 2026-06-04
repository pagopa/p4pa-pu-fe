import {
  GridColDef,
  GridRenderCellParams,
  GridValidRowModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from '@mui/icons-material';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../../../routes';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import { ChipProps } from '@mui/material/Chip';
import {
  DebtPositionStatus,
  PagedDebtPositionView
} from '../../../../generated/data-contracts';
import { format } from 'date-fns';
import ChipTruncateTooltip from '../../../components/ChipTruncateTooltip';
import { IconButton } from '@mui/material';

type ResultDataRow = {
  id: number;
  description: string;
  debtType: string;
  creationDate: string;
  status: string;
} & GridValidRowModel;

export type DataGridProps = {
  data: PagedDebtPositionView;
};

export const DebtPositionsDataGrid = ({ data }: DataGridProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const stateColors: Record<DebtPositionStatus, ChipProps['color']> = {
    CANCELLED: 'error',
    DRAFT: 'default',
    EXPIRED: 'error',
    PAID: 'success',
    PARTIALLY_PAID: 'info',
    REPORTED: 'success',
    TO_SYNC: 'default',
    UNPAID: 'info'
  };

  const columns: Array<GridColDef> = [
    {
      field: 'description',
      headerName: t('DebtPositions.Results.table.description'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'debtPositionTypeOrgDescription',
      headerName: t('commons.debtType'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'creationDate',
      headerName: t('DebtPositions.Results.table.creationDate'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams<ResultDataRow>) =>
        format(params.value, 'dd/MM/yyyy')
    },
    {
      field: 'status',
      headerName: t('DebtPositions.Results.table.status'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams<ResultDataRow>) => (
        <ChipTruncateTooltip
          label={t(`commons.status.${params.value}`)}
          tooltipLabel={t(`DebtPositions.status.tooltip.${params.value}`)}
          color={stateColors[params.value as DebtPositionStatus]}
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
      renderCell: (params: GridRenderCellParams<ResultDataRow>) => (
        <IconButton
          size="small"
          color="primary"
          aria-label={t('commons.goToDetail')}
          onClick={() => {
            navigate(
              generatePath(PageRoutes.DEBT_POSITION_DETAIL, {
                id: params.row.debtPositionId
              })
            );
          }}
        >
          <ChevronRight />
        </IconButton>
      )
    }
  ];

  return (
    <CustomDataGrid
      rows={data?.content ?? []}
      getRowId={(row) => row.debtPositionId}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      totalPages={data?.totalPages ?? 1}
    />
  );
};
