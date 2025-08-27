import { Box, Chip, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useEffect } from 'react';
import { ArrowForwardIos } from '@mui/icons-material';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import useDebtTypesCreatedFilters, {
  FilterParams
} from '../../../hooks/useDebtTypesCreatedFilters';
import { useDebtPositionTypeOrgSearch } from '../../../api/debtTypesCreated';
import { DebtPositionTypeOrgWithCount } from '../../../../generated/data-contracts';
import { useStore } from '../../../store/GlobalStore';
import { STATE } from '../../../store/types';
import { formatDateTime } from '../../../utils/formatters';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../../../routes';

type MyOrgProps = {
  codeFilter: string;
  descriptionFilter: string;
  statusFilter: string;
  onSearch: (searchFn: () => void) => void;
};

export const MyOrg = ({
  codeFilter,
  descriptionFilter,
  statusFilter,
  onSearch
}: MyOrgProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const { mutate, data } = useDebtPositionTypeOrgSearch();

  const { updateDraftFilters, applyFilters } = useDebtTypesCreatedFilters({
    initialFilters: {
      code: codeFilter,
      description: descriptionFilter,
      flagActive: statusFilter === 'true' ? true : false,
      page: 0,
      size: 10
    }
  });

  useEffect(() => {
    updateDraftFilters({
      code: codeFilter,
      description: descriptionFilter,
      flagActive: statusFilter === 'true' ? true : false
    });
  }, [codeFilter, descriptionFilter, statusFilter, updateDraftFilters]);

  useEffect(() => {
    const filters: FilterParams = {
      page: 0,
      size: 10
    };

    if (codeFilter) filters.code = codeFilter;
    if (descriptionFilter) filters.description = descriptionFilter;
    if (statusFilter) filters.flagActive = statusFilter;

    mutate({ organizationId, filters });
  }, [organizationId, codeFilter, descriptionFilter, statusFilter, mutate]);

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
      field: 'flagActive',
      headerName: t('commons.state'),
      flex: 1,
      renderCell: (
        params: GridRenderCellParams<DebtPositionTypeOrgWithCount>
      ) => (
        <Chip
          label={
            params.value
              ? t('commons.status.ACTIVE')
              : t('commons.status.DISABLED')
          }
          title={
            params.value
              ? t('commons.status.ACTIVE')
              : t('commons.status.DISABLED')
          }
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      )
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
        totalPages={data?.totalPages || 1}
      />
    </Box>
  );
};

export default MyOrg;
