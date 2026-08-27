import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useState } from 'react';
import { ChevronRight } from '@mui/icons-material';
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
import { useBrokerOrganizationsSearch } from '../../../api/organizationOperators';
import { OrganizationWithDebtPositionTypeOrgAndOperatorsCount } from '../../../../generated/core/data-contracts';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../..';
import { IconButton } from '@mui/material';

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
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (
        params: GridRenderCellParams<OrganizationWithDebtPositionTypeOrgAndOperatorsCount>
      ) => (
        <IconButton
          aria-label={t('commons.goToDetail')}
          onClick={() => handleRowClick(params.row)}
        >
          <ChevronRight fontSize="small" color="primary" />
        </IconButton>
      )
    }
  ];

  const handleRowClick = (
    row: OrganizationWithDebtPositionTypeOrgAndOperatorsCount | undefined
  ) => {
    if (row) {
      const detailPath = generatePath(PageRoutes.BROKER_OPERATORS, {
        organizationId: row?.organizationId,
        orgName: row?.orgName
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
