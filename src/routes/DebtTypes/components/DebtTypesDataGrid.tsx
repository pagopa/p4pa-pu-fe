import { useTranslation } from 'react-i18next';
import {
  GridColDef,
  GridRenderCellParams,
  GridSortModel
} from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import {
  PagedDebtPositionTypeWithCount,
  DebtPositionTypeWithCount
} from '../../../../generated/data-contracts';
import { formatDate } from '../../../utils/formatters';

export type DebtTypesDataGridProps = {
  data: PagedDebtPositionTypeWithCount;
  onPageChange: (page: number) => void;
  onPageSizeChange: (page: number) => void;
  onSortChange: (model: GridSortModel) => void;
  sortModel: GridSortModel;
  pagination: {
    currentPage: number;
    totalPages: number;
    size: number;
  };
  isLoading?: boolean;
};

const DebtTypesDataGrid = ({
  data,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  sortModel,
  pagination,
  isLoading = false
}: DebtTypesDataGridProps) => {
  const { t } = useTranslation();

  const columns: Array<GridColDef> = [
    {
      field: 'description',
      headerName: t('flowDataGrid.name'),
      flex: 1.3,
      type: 'string'
    },
    {
      field: 'updateDate',
      headerName: t('flowDataGrid.lastUpdate'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams<DebtPositionTypeWithCount>) =>
        params.value ? formatDate(params.value as string) : ''
    },
    {
      field: 'activeOrganizations',
      headerName: t('flowDataGrid.authorizedOrganizations'),
      flex: 1,
      type: 'number',
      align: 'left',
      headerAlign: 'left'
    },
    {
      field: 'detail',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<DebtPositionTypeWithCount>) => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => {
            console.log(`click on id ${params.row.debtPositionTypeId}`);
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
      getRowId={(row) => row.debtPositionTypeId}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      sortModel={sortModel}
      onSortModelChange={onSortChange}
      customPagination={{
        defaultPageOption: pagination.size,
        sizePageOptions: [5, 10, 20],
        totalPages: pagination.totalPages,
        currentPage: pagination.currentPage,
        onPageChange,
        onPageSizeChange
      }}
      localeText={{ noRowsLabel: t('flowDataGrid.noDataRows') }}
      loading={isLoading}
    />
  );
};

export default DebtTypesDataGrid;
