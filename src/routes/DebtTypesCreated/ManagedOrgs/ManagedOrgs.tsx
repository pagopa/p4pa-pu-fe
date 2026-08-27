import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useState } from 'react';
import { ArrowForwardIos } from '@mui/icons-material';
import CustomDataGrid, {
  DataGridContainer
} from '../../../components/DataGrid/CustomDataGrid';
import {
  OrganizationsWithDebtPositionTypeOrgCountFilters,
  useManagedOrgsSearch
} from '../../../api/debtTypesCreated';
import { OrganizationWithDebtPositionTypeOrgCount } from '../../../../generated/core/data-contracts';
import { useStore } from '../../../store/GlobalStore';
import utils from '../../../utils';
import { useSearch } from '../../../hooks/useSearch';
import FilterContainer, {
  COMPONENT_TYPE,
  FilterItem
} from '../../../components/FilterContainer/FilterContainer';
import Search from '@mui/icons-material/Search';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../..';

export const ManagedOrgs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    state: { organizationId }
  } = useStore();

  const initialFilters: OrganizationsWithDebtPositionTypeOrgCountFilters =
    utils.URI.decode(window.location.hash);
  const [filters, setFilters] =
    useState<OrganizationsWithDebtPositionTypeOrgCountFilters>(initialFilters);

  const query = useManagedOrgsSearch(organizationId);

  const {
    query: { data },
    applyFilters
  } = useSearch({
    query,
    filters
  });

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
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (
        params: GridRenderCellParams<OrganizationWithDebtPositionTypeOrgCount>
      ) => (
        <IconButton
          aria-label={t('commons.detail')}
          onClick={() => handleRowClick(params.row)}
        >
          <ArrowForwardIos fontSize="small" color="primary" />
        </IconButton>
      )
    }
  ];

  const handleRowClick = (
    row: OrganizationWithDebtPositionTypeOrgCount | undefined
  ) => {
    if (!row) return;
    navigate(
      generatePath(PageRoutes.DEBT_TYPES_DASHBOARD_BYORG, {
        organizationId: row.organizationId
      })
    );
  };

  const items: Array<FilterItem> = [
    {
      type: COMPONENT_TYPE.textField,
      id: 'organizationName',
      label: t('commons.searchForOrganizationName'),
      adornment: <Search />,
      gridWidth: 10.5
    },
    {
      type: COMPONENT_TYPE.button,
      label: t('commons.search'),
      gridWidth: 1.5
    }
  ];

  return (
    <>
      <FilterContainer
        items={items}
        values={filters}
        onChange={(field, value) => setFilters({ ...filters, [field]: value })}
        onSubmit={() => applyFilters(filters)}
        sx={{ py: 3 }}
      />
      <DataGridContainer>
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
      </DataGridContainer>
    </>
  );
};

export default ManagedOrgs;
