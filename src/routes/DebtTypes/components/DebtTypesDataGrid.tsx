import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import {
  PagedDebtPositionTypeWithCount,
  DebtPositionTypeWithCount
} from '../../../../generated/data-contracts';
import { formatDateTime } from '../../../utils/formatters';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../../../routes';

export type DebtTypesDataGridProps = {
  data: PagedDebtPositionTypeWithCount;
  isLoading?: boolean;
};

const DebtTypesDataGrid = ({
  data,
  isLoading = false
}: DebtTypesDataGridProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const columns: Array<GridColDef> = [
    {
      field: 'code',
      headerName: t('flowDataGrid.code'),
      flex: 1.3,
      type: 'string'
    },
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
        params.value ? formatDateTime(params.value as string, true) : ''
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
          aria-label={t('debtTypeCatalogDetail.accessibleTitle', {
            description: params.row.description
          })}
          size="small"
          onClick={() => {
            navigate(
              generatePath(PageRoutes.DEBT_TYPE_CATALOG_DETAIL, {
                debtPositionTypeId: params.row.debtPositionTypeId
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
      getRowId={(row) => row.debtPositionTypeId}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      localeText={{ noRowsLabel: t('flowDataGrid.noDataRows') }}
      loading={isLoading}
      totalPages={data?.totalPages || 1}
    />
  );
};

export default DebtTypesDataGrid;
