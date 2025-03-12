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
import { useNavigate } from 'react-router';
import {
  InstallmentView,
  PagedInstallmentView
} from '../../../../generated/data-contracts';
import { format } from 'date-fns/format';
import { moneyFormat } from '../../../utils/formatters';

export type DataGridProps = {
  data?: PagedInstallmentView;
  onPageChange: (page: number) => void;
  onPageSizeChange: (page: number) => void;
  onSortChange: (model: Array<string>) => void;
  pagination: {
    currentPage: number;
    page: number;
    size: number;
  };
};

export const IUVDataGrid = ({
  data,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  pagination
}: DataGridProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const stateColors: Record<string, ChipProps['color']> = {
    CANCELLED: 'error',
    DRAFT: 'default',
    EXPIRED: 'error',
    PAID: 'success',
    PARTIALLY_PAID: 'info',
    REPORTED: 'success',
    TO_SYNC: 'default',
    UNPAID: 'info'
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
          label={t(`DebtPositions.Results.status.${params.value}`)}
          title={t(params.value)}
          color={stateColors[params.value]}
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
      renderCell: () => (
        <ReadMore
          fontSize="small"
          color="primary"
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            navigate(PageRoutes.DEBT_POSITION_INSTALLMENT_DETAIL);
          }}
        />
      )
    }
  ];

  const onSort = (model: GridSortModel) => {
    if (model?.length) {
      const sort = model.map((item) =>
        item?.sort ? `${item.field},${item.sort.toUpperCase()}` : ''
      );
      onPageChange(1);
      onSortChange(sort);
    }
  };

  return (
    <CustomDataGrid
      rows={data?.content ?? []}
      getRowId={(row) => row.installmentId}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      onSortModelChange={onSort}
      customPagination={{
        defaultPageOption: pagination.size,
        sizePageOptions: [5, 10, 20],
        totalPages: data?.totalPages,
        currentPage: pagination.currentPage,
        onPageChange,
        onPageSizeChange
      }}
    />
  );
};
