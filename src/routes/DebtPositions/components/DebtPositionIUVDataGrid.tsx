import {
  GridColDef,
  GridRenderCellParams,
  GridSortModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { ReadMore } from '@mui/icons-material';
import { Chip, ChipProps, Typography } from '@mui/material';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import { PageRoutes } from '../../../App';
import { generatePath, useNavigate } from 'react-router';
import {
  InstallmentStatus,
  InstallmentView,
  PagedInstallmentView
} from '../../../../generated/data-contracts';
import { format } from 'date-fns/format';
import { moneyFormat } from '../../../utils/formatters';

export type DataGridProps = {
  data?: PagedInstallmentView;
  onSortChange: (model: GridSortModel) => void;
  sortModel: GridSortModel;
  onPaginationChange?: (pagination: { page: number; size: number }) => void;
};

export const IUVDataGrid = ({
  data,
  onSortChange,
  sortModel,
  onPaginationChange
}: DataGridProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const safeRows =
    data?.content?.filter((row) => row.installmentId != null) || [];

  const stateColors: Record<InstallmentStatus, ChipProps['color']> = {
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
        format(params.value, 'dd/MM/yyyy')
    },
    {
      field: 'status',
      headerName: t('debtPositionSearchResults.status'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams<InstallmentView>) => (
        <Chip
          label={t(`commons.status.${params.value}`)}
          title={t(params.value)}
          color={stateColors[params.value as InstallmentStatus]}
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
