import { Box, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
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

  const { updateDraftFilters, applyFilters } = useDebtTypesCreatedFilters({
    initialFilters: {
      organizationName: IPACodeFilter,
      page: 0,
      size: 10
    }
  });

  useEffect(() => {
    updateDraftFilters({
      organizationName: IPACodeFilter
    });
  }, [IPACodeFilter, updateDraftFilters]);
  useEffect(() => {
    const filters: FilterParams = {
      page: 0,
      size: 10
    };

    if (IPACodeFilter) filters.organizationName = IPACodeFilter;

    mutate({ organizationId, filters });
  }, [organizationId, IPACodeFilter, mutate]);

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
        totalPages={data?.totalPages || 1}
      />
    </Box>
  );
};

export default ManagedOrgs;
