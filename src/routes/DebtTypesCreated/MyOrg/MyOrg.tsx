import { Chip, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useState } from 'react';
import { ArrowForwardIos } from '@mui/icons-material';
import CustomDataGrid, {
  DataGridContainer
} from '../../../components/DataGrid/CustomDataGrid';
import {
  DebtPositionTypeOrgWithCountFilters,
  useDebtPositionTypeOrgSearch
} from '../../../api/debtTypesCreated';
import { DebtPositionTypeOrgWithCount } from '../../../../generated/data-contracts';
import { useStore } from '../../../store/GlobalStore';
import { formatDateTime } from '../../../utils/formatters';
import { generatePath, useNavigate, useParams } from 'react-router';
import { PageRoutes } from '../../../routes';
import { useSearch } from '../../../hooks/useSearch';
import FilterContainer, {
  COMPONENT_TYPE,
  FilterItem
} from '../../../components/FilterContainer/FilterContainer';
import utils from '../../../utils';
import Search from '@mui/icons-material/Search';

export const MyOrg = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { organizationId: organizationIdByURL } = useParams<{
    organizationId: string;
  }>();

  const initialFilters: DebtPositionTypeOrgWithCountFilters = utils.URI.decode(
    window.location.hash
  );
  const [filters, setFilters] =
    useState<DebtPositionTypeOrgWithCountFilters>(initialFilters);

  const {
    state: { organizationId }
  } = useStore();

  // switch if list types using organizationID in URL or setted in the storage
  const query = useDebtPositionTypeOrgSearch(
    organizationIdByURL && !isNaN(Number(organizationIdByURL))
      ? Number(organizationIdByURL)
      : organizationId
  );

  const {
    query: { data },
    applyFilters
  } = useSearch({
    query,
    filters
  });

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
          data-testid={`navigate-icon-${params.row.debtPositionTypeOrgId}`}
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

  const stateFilterSearch = [
    { label: t('commons.status.ACTIVE'), value: 'true' },
    { label: t('commons.status.DISABLED'), value: 'false' }
  ];

  const items: Array<FilterItem> = [
    {
      type: COMPONENT_TYPE.textField,
      id: 'code',
      label: t('commons.searchForCode'),
      adornment: <Search />,
      gridWidth: 4
    },
    {
      type: COMPONENT_TYPE.textField,
      id: 'description',
      label: t('commons.searchForDescription'),
      adornment: <Search />,
      gridWidth: 5
    },
    {
      type: COMPONENT_TYPE.select,
      defaultValue: '',
      id: 'flagActive',
      name: 'flagActive',
      label: t('commons.state'),
      options: stateFilterSearch,
      gridWidth: 2
    },
    {
      type: COMPONENT_TYPE.button,
      label: t('commons.search'),
      onClick: () => applyFilters(filters),
      gridWidth: 1
    }
  ];

  return (
    <>
      <FilterContainer
        items={items}
        values={filters}
        onChange={(field, value) => setFilters({ ...filters, [field]: value })}
        sx={{ py: 3 }}
      />
      <DataGridContainer>
        <CustomDataGrid
          rows={data?.content ?? []}
          columns={columns}
          getRowId={(row: DebtPositionTypeOrgWithCount) =>
            row.debtPositionTypeOrgId?.toString() || ''
          }
          disableColumnMenu
          disableColumnResize
          totalPages={data?.totalPages || 1}
        />
      </DataGridContainer>
    </>
  );
};

export default MyOrg;
