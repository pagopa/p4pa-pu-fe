import {
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
  GridValidRowModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { FileDownload, Visibility } from '@mui/icons-material';
import { generatePath, useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../../App';
import ActionMenu from '../../../components/ActionMenu/ActionMenu';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import Chip, { ChipProps } from '@mui/material/Chip';
import { PagedDebtPositionView } from '../../../../generated/data-contracts';
import { format } from 'date-fns';

interface ResultDataRow extends GridValidRowModel {
  id: number;
  description: string;
  debtType: string;
  creationDate: string;
  status: string;
}

export type DataGridProps = {
  data?: PagedDebtPositionView;
  onPageChange: (page: number) => void;
  onPageSizeChange: (page: number) => void;
  onSortChange: (model: string[]) => void;
  pagination: {
    currentPage: number;
    page: number;
    size: number;
  };
};

export const DataGrid = ({
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

  const columns: GridColDef[] = [
    {
      field: 'description',
      headerName: t('DebtPositions.Results.table.description'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'debtPositionOrigin',
      headerName: t('DebtPositions.Results.table.debtType'),
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
      renderCell: (params: GridRenderCellParams<ResultDataRow>) => (
        <ActionMenu
          rowId={params.row.id}
          menuItems={[
            {
              icon: <Visibility fontSize="small" />,
              label: t('commons.view'),
              action: () =>
                navigate(generatePath(PageRoutes.REPORTING_DETAIL, { id: params.row.idReporting }))
            },
            {
              icon: <FileDownload fontSize="small" />,
              label: t('commons.files.download'),
              action: () => console.log('Scarica file per ID: ', params.row.id)
            }
          ]}
        />
      )
    }
  ];

  const onSort = (model: GridSortModel) => {
    if (model?.length) {
      const sort = model.map((item) => `${item.field},${item.sort!.toUpperCase()}`);
      onPageChange(1);
      onSortChange(sort);
    }
  };

  return (
    <CustomDataGrid
      rows={data?.content ?? []}
      getRowId={(row) => row.debtPositionId}
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
