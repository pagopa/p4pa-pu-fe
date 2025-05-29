import { Box, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  GridColDef,
  GridRenderCellParams,
  GridSortModel
} from '@mui/x-data-grid';
import { useEffect } from 'react';
import { ArrowForwardIos } from '@mui/icons-material';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import useDebtTypesCreatedFilters, {
  FilterParams
} from '../../../hooks/useDebtTypesCreatedFilters';
import { useDataGridPaginationWithUrl } from '../../../hooks/useDataGridPaginationWithUrl';
import { useDebtPositionTypeOrgSearch } from '../../../api/debtTypesCreated';
import { DebtPositionTypeOrgWithCount } from '../../../../generated/data-contracts';
import { useStore } from '../../../store/GlobalStore';
import { STATE } from '../../../store/types';
import { formatDateTime } from '../../../utils/formatters';
import { generatePath, useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../../App';

type MyOrgProps = {
  codeFilter: string;
  descriptionFilter: string;
  onSearch: (searchFn: () => void) => void;
};

export const MyOrg = ({
  codeFilter,
  descriptionFilter,
  onSearch
}: MyOrgProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const { mutate, data } = useDebtPositionTypeOrgSearch();

  const {
    pagination,
    handlePageChange,
    handlePageSizeChange,
    syncWithBackendData
  } = useDataGridPaginationWithUrl({
    initialPage: 0,
    initialSize: 10,
    totalElements: data?.totalElements || 0
  });

  const { updateDraftFilters, applyFilters, sortModel, handleSortModelChange } =
    useDebtTypesCreatedFilters({
      initialFilters: {
        code: codeFilter,
        description: descriptionFilter,
        page: pagination.page,
        size: pagination.size
      }
    });

  useEffect(() => {
    updateDraftFilters({
      code: codeFilter,
      description: descriptionFilter
    });
  }, [codeFilter, descriptionFilter, updateDraftFilters]);

  // Synchronize pagination with backend when new data arrives
  useEffect(() => {
    if (
      data &&
      typeof data.number === 'number' &&
      typeof data.size === 'number'
    ) {
      const currentPage = pagination.page;
      const currentSize = pagination.size;
      const backendPage = data.number;
      const backendSize = data.size;

      // Only sync if backend data is actually different from current state
      if (currentPage !== backendPage || currentSize !== backendSize) {
        syncWithBackendData(data);
      }
    }
  }, [data?.number, data?.size, data?.totalElements, data?.totalPages]);

  // Make API call when filters or pagination change
  useEffect(() => {
    const filters: FilterParams = {
      page: pagination.page,
      size: pagination.size
    };

    if (codeFilter) filters.code = codeFilter;
    if (descriptionFilter) filters.description = descriptionFilter;

    mutate({ organizationId, filters });
  }, [organizationId, pagination.page, pagination.size, mutate]);

  useEffect(() => {
    const performSearch = () => {
      const filters = applyFilters();
      mutate({ organizationId, filters });
    };

    onSearch(performSearch);
  }, [onSearch, applyFilters, mutate, organizationId]);

  const columns: Array<GridColDef> = [
    {
      field: 'code',
      headerName: t('debtTypesCreated.myOrganizationDataGrid.code'),
      flex: 1,
      minWidth: 100
    },
    {
      field: 'description',
      headerName: t('debtTypesCreated.myOrganizationDataGrid.description'),
      flex: 1,
      minWidth: 200
    },
    {
      field: 'updateDate',
      headerName: t('debtTypesCreated.myOrganizationDataGrid.lastUpdateDate'),
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) =>
        formatDateTime(params.value as string)
    },
    {
      field: 'enabledOperators',
      headerName: t('debtTypesCreated.myOrganizationDataGrid.enabledOperators'),
      flex: 1,
      minWidth: 150
    },
    {
      field: 'actions',
      headerName: '',
      width: 50,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (
        params: GridRenderCellParams<DebtPositionTypeOrgWithCount>
      ) => (
        <ArrowForwardIos
          fontSize="small"
          sx={{ color: theme.palette.primary.main, cursor: 'pointer' }}
          onClick={() => handleRowClick(params.row)}
        />
      )
    }
  ];

  const handleRowClick = (row: DebtPositionTypeOrgWithCount | undefined) => {
    if (!row) return;
    navigate(
      generatePath(PageRoutes.DEBT_TYPE_ORG_DETAIL, {
        debtPositionTypeOrgId: row.debtPositionTypeOrgId
      })
    );
  };

  const handlePaginationChange = (page: number, size: number) => {
    // Use centralized hook to manage pagination
    if (size !== pagination.size) {
      handlePageSizeChange(size);
    } else {
      handlePageChange(page);
    }
  };

  const handleSortChange = (newSortModel: GridSortModel) => {
    const filters = handleSortModelChange(newSortModel);
    mutate({ organizationId, filters });
  };

  return (
    <Box sx={{ bgcolor: theme.palette.grey[200], padding: 2 }}>
      <CustomDataGrid
        rows={data?.content || []}
        columns={columns}
        getRowId={(row: DebtPositionTypeOrgWithCount) =>
          row.debtPositionTypeOrgId?.toString() || ''
        }
        disableColumnMenu
        disableColumnResize
        sortModel={sortModel}
        onSortModelChange={handleSortChange}
        customPagination={{
          totalPages: data?.totalPages || 0,
          defaultPageOption: pagination.size,
          sizePageOptions: [5, 10, 15, 20],
          onPageChange: (page) => handlePaginationChange(page, pagination.size),
          onPageSizeChange: (size) => {
            handlePageSizeChange(size);
          },
          currentPage: pagination.page + 1
        }}
      />
    </Box>
  );
};

export default MyOrg;
