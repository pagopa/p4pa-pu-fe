import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { ChevronRight } from '@mui/icons-material';
import CustomDataGrid, {
  DataGridContainer
} from '../../../components/DataGrid/CustomDataGrid';
import { useStore } from '../../../store/GlobalStore';
import { generatePath, useNavigate, useParams } from 'react-router';
import FilterContainer, {
  COMPONENT_TYPE,
  FilterItem
} from '../../../components/FilterContainer/FilterContainer';
import utils from '../../../utils';
import Search from '@mui/icons-material/Search';
import { BaseFilterValues } from '../../../models/Filters';
import { useSearch } from '../../../hooks/useSearch';
import { OrganizationOperator } from '../../../../generated/data-contracts';
import { useOrganizationOperatorsSearch } from '../../../api/organizationOperators';
import { PageRoutes } from '../..';
import { setCustomBreadcrumbsItems } from '../../../store/AppStateStore';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';

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

export const MyOrganization = ({ omitOrgName }: { omitOrgName?: boolean }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { organizationId: urlOrganizationId } = useParams<{
    organizationId: string;
  }>();
  const [orgName, setOrgName] = useState<string>('');

  const {
    state: { organizationId: storeOrganizationId }
  } = useStore();

  const organizationId =
    Number(urlOrganizationId) || Number(storeOrganizationId);

  if (isNaN(organizationId)) {
    navigate(PageRoutes.RESPONSES_ERROR);
  }

  const initialFilters: OperatorFilters = utils.URI.decode(
    window.location.hash
  );
  const [filters, setFilters] = useState<OperatorFilters>(initialFilters);

  const query = useOrganizationOperatorsSearch(organizationId);

  const {
    query: { data },
    applyFilters
  } = useSearch({
    query,
    filters
  });

  useEffect(() => {
    if (data && data.content[0] && data.content[0].orgName && orgName === '') {
      setOrgName(data.content[0].orgName);
      setCustomBreadcrumbsItems([
        {
          pathname: PageRoutes.OPERATORS_LIST,
          id: 'OPERATORS_LIST'
        },
        {
          pathname: '',
          label: data.content[0].orgName,
          id: 'BROKER_OPERATORS'
        }
      ]);
    }
  }, [data]);

  // Map datas from api to the data grid
  const mappedData =
    data?.content?.map((operator: OrganizationOperator) => ({
      id: operator.mappedExternalUserId || '-',
      nameAndLastName:
        `${operator.firstName || '-'} ${operator.lastName || '-'}`.trim() ||
        '-',
      fiscalCode: operator.fiscalCode || '-',
      enabledDebtTypes: operator.debtPositionTypeOrgCount ?? '-'
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
        <ChevronRight
          fontSize="small"
          color="primary"
          sx={{ cursor: 'pointer' }}
          onClick={() => handleRowClick(params.row)}
        />
      )
    }
  ];

  const handleRowClick = (row: Operator | undefined) => {
    if (row) {
      const detailPath = generatePath(PageRoutes.OPERATORS_DETAIL, {
        organizationId,
        mappedExternalUserId: row?.id
      });
      navigate(detailPath);
    } else {
      navigate(PageRoutes.RESPONSES_ERROR);
    }
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
      gridWidth: 2
    }
  ];

  return (
    <>
      {orgName && !omitOrgName && (
        <TitleComponent
          title={orgName}
          accessibleTitle={`${t('commons.routes.OPERATORS_LIST')} - ${orgName}`}
          description={t('operatorsList.brokerDescription')}
        />
      )}
      <FilterContainer
        items={items}
        values={filters}
        onChange={(field, value) => setFilters({ ...filters, [field]: value })}
        onSubmit={() => applyFilters(filters)}
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
