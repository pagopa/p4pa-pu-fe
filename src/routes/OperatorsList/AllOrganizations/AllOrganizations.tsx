import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useState } from 'react';
import { OpenInNew, RemoveCircleOutline } from '@mui/icons-material';
import CustomDataGrid, {
  DataGridContainer
} from '../../../components/DataGrid/CustomDataGrid';
import utils from '../../../utils';
import { useSearch } from '../../../hooks/useSearch';
import FilterContainer, {
  COMPONENT_TYPE,
  FilterItem
} from '../../../components/FilterContainer/FilterContainer';
import { BaseFilterValues } from '../../../models/Filters';
import Search from '@mui/icons-material/Search';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../..';
import { OrganizationWithDebtPositionTypeOrgAndOperatorsCount } from '../../../../generated/data-contracts';
import { useBrokerOrganizationsSearch } from '../../../api/organizationOperators';
import ActionMenu from '../../../components/ActionMenu/ActionMenu';
import { useStore } from '../../../store/GlobalStore';

type BrokerOrganizationFilters = BaseFilterValues & {
  ipaCode?: string;
};

export const AllOrganizations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const initialFilters: BrokerOrganizationFilters = utils.URI.decode(
    window.location.hash
  );
  const [filters, setFilters] =
    useState<BrokerOrganizationFilters>(initialFilters);

  const query = useBrokerOrganizationsSearch();

  const {
    state: { userInfo }
  } = useStore();

  const {
    query: { data },
    applyFilters
  } = useSearch({
    query,
    filters
  });

  const columns: Array<
    GridColDef<OrganizationWithDebtPositionTypeOrgAndOperatorsCount>
  > = [
    {
      field: 'ipaCode',
      headerName: t('debtTypesCreated.managedOrganizationsDataGrid.IPACode'),
      flex: 1,
      minWidth: 100
    },
    {
      field: 'orgName',
      headerName: t('debtTypesCreated.managedOrganizationsDataGrid.managedOrg'),
      flex: 2,
      minWidth: 200
    },
    {
      field: 'operatorsCount',
      headerName: t('operatorsList.allOrganizationsDataGrid.operators'),
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
        params: GridRenderCellParams<OrganizationWithDebtPositionTypeOrgAndOperatorsCount>
      ) => (
        <ActionMenu
          // TODO: this cast should be removed
          // once an unique id is available
          rowId={params.row.organizationId as number}
          menuItems={[
            {
              icon: <RemoveCircleOutline color="error" />,
              label: t('commons.onlyRemove'),
              // TODO: Add remove operation
              action: () => null
            },
            {
              icon: <OpenInNew color="primary" />,
              label: t('commons.goToDetail'),
              action: () => handleRowClick(params.row)
            }
          ]}
        />
      )
    }
  ];

  const handleRowClick = (
    row: OrganizationWithDebtPositionTypeOrgAndOperatorsCount | undefined
  ) => {
    if (row) {
      const detailPath = generatePath(PageRoutes.OPERATORS_DETAIL, {
        organizationId: row?.organizationId,
        mappedExternalUserId: userInfo?.mappedExternalUserId
      });
      navigate(detailPath);
    } else {
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  };

  const items: Array<FilterItem> = [
    {
      type: COMPONENT_TYPE.textField,
      id: 'ipaCode',
      label: t('operatorsList.searchByIPACode'),
      adornment: <Search />,
      gridWidth: 10.5
    },
    {
      type: COMPONENT_TYPE.button,
      label: t('commons.search'),
      onClick: () => applyFilters(filters),
      gridWidth: 1.5
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
          rows={data?.content || []}
          columns={columns}
          getRowId={(
            row: OrganizationWithDebtPositionTypeOrgAndOperatorsCount
          ) => row.organizationId?.toString() || ''}
          disableColumnMenu
          disableColumnResize
          totalPages={data?.totalPages || 1}
        />
      </DataGridContainer>
    </>
  );
};

export default AllOrganizations;
