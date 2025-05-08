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
import { useManagedOrgsSearch } from '../../../api/debtTypesCreated';
import { OrganizationWithDebtPositionTypeOrgCount } from '../../../../generated/data-contracts';
import { useStore } from '../../../store/GlobalStore';
import { STATE } from '../../../store/types';

type ManagedOrgsProps = {
  IPACodeFilter: string;
  onSearch: (searchFn: () => void) => void;
};

export const ManagedOrgs = ({ IPACodeFilter, onSearch }: ManagedOrgsProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const { mutate, data } = useManagedOrgsSearch();

  const {
    appliedFilters,
    updateDraftFilters,
    applyFilters,
    updatePagination,
    sortModel,
    handleSortModelChange
  } = useDebtTypesCreatedFilters({
    initialFilters: {
      organizationName: IPACodeFilter
    }
  });

  useEffect(() => {
    updateDraftFilters({
      organizationName: IPACodeFilter
    });
  }, [IPACodeFilter, updateDraftFilters]);

  useEffect(() => {
    const initialFilters: FilterParams = {
      page: 0,
      size: 10
    };

    if (IPACodeFilter) initialFilters.organizationName = IPACodeFilter;

    mutate({ organizationId, filters: initialFilters });
  }, []);

  useEffect(() => {
    const performSearch = () => {
      const filters = applyFilters();
      mutate({ organizationId, filters });
    };

    onSearch(performSearch);
  }, [onSearch, applyFilters, mutate, organizationId]);

  const columns: Array<GridColDef> = [
    {
      field: 'ipaCode',
      headerName: t('debtTypesCreated.managedOrganizationsDataGrid.IPACode'),
      flex: 1,
      minWidth: 100
    },
    {
      field: 'organizationName',
      headerName: t('debtTypesCreated.managedOrganizationsDataGrid.managedOrg'),
      flex: 2,
      minWidth: 200
    },
    {
      field: 'debtPositionTypeOrgCount',
      headerName: t(
        'debtTypesCreated.managedOrganizationsDataGrid.debtTypesSet'
      ),
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
        params: GridRenderCellParams<OrganizationWithDebtPositionTypeOrgCount>
      ) => (
        <ArrowForwardIos
          fontSize="small"
          sx={{ color: theme.palette.primary.main, cursor: 'pointer' }}
          onClick={() => handleRowClick(params.row)}
        />
      )
    }
  ];

  const handleRowClick = (
    row: OrganizationWithDebtPositionTypeOrgCount | undefined
  ) => {
    if (!row) return;
    //TODO: redirect to organization detail
    console.log('Organization:', row);
  };

  const handlePaginationChange = (page: number, size: number) => {
    const filters = updatePagination({ page: page - 1, size });
    mutate({ organizationId, filters });
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
        getRowId={(row: OrganizationWithDebtPositionTypeOrgCount) =>
          row.organizationId?.toString() || ''
        }
        disableColumnMenu
        disableColumnResize
        sortModel={sortModel}
        onSortModelChange={handleSortChange}
        customPagination={{
          totalPages: data?.totalPages || 0,
          defaultPageOption: appliedFilters.size as number,
          sizePageOptions: [5, 10, 15, 20],
          onPageChange: (page) =>
            handlePaginationChange(page, appliedFilters.size as number),
          onPageSizeChange: (size) => handlePaginationChange(1, size),
          currentPage: ((appliedFilters.page as number) || 0) + 1
        }}
      />
    </Box>
  );
};

export default ManagedOrgs;
