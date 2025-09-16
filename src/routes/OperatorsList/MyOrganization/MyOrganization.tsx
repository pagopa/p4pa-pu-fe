import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useState } from 'react';
import { ArrowForwardIos } from '@mui/icons-material';
import CustomDataGrid, {
  DataGridContainer
} from '../../../components/DataGrid/CustomDataGrid';
import { useStore } from '../../../store/GlobalStore';
import { useParams } from 'react-router';
import FilterContainer, {
  COMPONENT_TYPE,
  FilterItem
} from '../../../components/FilterContainer/FilterContainer';
import utils from '../../../utils';
import Search from '@mui/icons-material/Search';
import { BaseFilterValues } from '../../../models/Filters';
import { useSearch } from '../../../hooks/useSearch';
import { OrganizationOperator } from '../../../../generated/data-contracts';
import { useOrganizationOperatorsSearch } from '../../../api/organizationOperators/organizationOperators';

type OperatorFilters = {
  firstName?: string;
  lastName?: string;
  fiscalCode?: string;
} & BaseFilterValues;

type Operator = {
  id: string;
  nameAndLastName: string;
  fiscalCode: string;
  enabledDebtTypes: number;
};

export const MyOrganization = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { organizationId: organizationIdByURL } = useParams<{
    organizationId: string;
  }>();

  const initialFilters: OperatorFilters = utils.URI.decode(
    window.location.hash
  );
  const [filters, setFilters] = useState<OperatorFilters>(initialFilters);

  const {
    state: { organizationId }
  } = useStore();

  const query = useOrganizationOperatorsSearch(
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

  // Map datas from api to the data grid
  const mappedData =
    data?.content?.map((operator: OrganizationOperator) => ({
      id: operator.mappedExternalUserId || '-',
      nameAndLastName:
        `${operator.firstName || '-'} ${operator.lastName || '-'}`.trim() ||
        '-',
      fiscalCode: operator.fiscalCode || '-',
      enabledDebtTypes: operator.debtPositionTypeOrgCount || '-'
    })) || [];

  const columns: Array<GridColDef> = [
    {
      field: 'id',
      headerName: t('operatorsList.myOrganizationDataGrid.id'),
      flex: 1,
      minWidth: 100
    },
    {
      field: 'nameAndLastName',
      headerName: t('operatorsList.myOrganizationDataGrid.nameAndLastName'),
      flex: 2,
      minWidth: 200
    },
    {
      field: 'fiscalCode',
      headerName: t('operatorsList.myOrganizationDataGrid.fiscalCode'),
      flex: 2,
      minWidth: 200
    },
    {
      field: 'enabledDebtTypes',
      headerName: t('operatorsList.myOrganizationDataGrid.enabledDebtTypes'),
      flex: 1,
      minWidth: 180,
      sortable: true
    },
    {
      field: 'actions',
      headerName: '',
      width: 50,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<Operator>) => (
        <ArrowForwardIos
          fontSize="small"
          sx={{ color: theme.palette.primary.main, cursor: 'pointer' }}
          onClick={() => handleRowClick(params.row)}
        />
      )
    }
  ];

  const handleRowClick = (row: Operator | undefined) => {
    if (!row) return;
    // TODO: Add navigation to operator detail
    console.log('Navigate to operator detail:', row.id);
  };

  const items: Array<FilterItem> = [
    {
      type: COMPONENT_TYPE.textField,
      id: 'firstName',
      label: t('operatorsList.searchByName'),
      adornment: <Search />,
      gridWidth: 3
    },
    {
      type: COMPONENT_TYPE.textField,
      id: 'lastName',
      label: t('operatorsList.searchByLastName'),
      adornment: <Search />,
      gridWidth: 3
    },
    {
      type: COMPONENT_TYPE.textField,
      id: 'fiscalCode',
      label: t('operatorsList.searchByFiscalCode'),
      adornment: <Search />,
      gridWidth: 4
    },
    {
      type: COMPONENT_TYPE.button,
      label: t('commons.search'),
      onClick: () => applyFilters(filters),
      gridWidth: 2
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
          rows={mappedData}
          columns={columns}
          getRowId={(row: Operator) => row.id}
          disableColumnMenu
          disableColumnResize
          totalPages={data?.totalPages || 1}
        />
      </DataGridContainer>
    </>
  );
};

export default MyOrganization;
