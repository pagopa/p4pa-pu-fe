import {
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
  GridValidRowModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from '@mui/icons-material';
import { generatePath, useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../../App';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import Chip, { ChipProps } from '@mui/material/Chip';
import {
  DebtPositionStatus,
  PagedDebtPositionView
} from '../../../../generated/data-contracts';
import { format } from 'date-fns';

type ResultDataRow = {
  id: number;
  description: string;
  debtType: string;
  creationDate: string;
  status: string;
} & GridValidRowModel;

export type DataGridProps = {
  data: PagedDebtPositionView;
  onSortChange: (model: GridSortModel) => void;
  sortModel: GridSortModel;
  onPaginationChange?: (pagination: { page: number; size: number }) => void;
};

export const DebtPositionsDataGrid = ({
  data,
  onSortChange,
  sortModel,
  onPaginationChange
}: DataGridProps) => {
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
        <Chip
          label={t(`commons.status.${params.value}`)}
          title={t(params.value)}
          color={stateColors[params.value as DebtPositionStatus]}
          size="small"
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
      renderCell: (params: GridRenderCellParams<ResultDataRow>) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            height: '100%',
            width: '100%'
          }}
        >
          <ChevronRight
            color="primary"
            onClick={() => {
              navigate(
                generatePath(PageRoutes.DEBT_POSITION_DETAIL, {
                  id: params.row.debtPositionId
                })
              );
            }}
          />
        </div>
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
      sortModel={sortModel}
      onSortModelChange={onSortChange}
      smartPagination={{
        initialPage: 0,
        initialSize: 10,
        sizeOptions: [5, 10, 20],
        backendData: {
          totalElements: data?.totalElements,
          totalPages: data?.totalPages,
          number: data?.number,
          size: data?.size
        },
        onPaginationChange: onPaginationChange
      }}
    />
  );
};
