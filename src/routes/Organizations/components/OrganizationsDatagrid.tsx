import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Chip, IconButton } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import {
  PagedOrganizationWithDebtPositionTypeOrgAndOperatorsCount,
  OrganizationWithDebtPositionTypeOrgAndOperatorsCount,
  StatusEnum
} from '../../../../generated/data-contracts';
import { PageRoutes } from '../..';
import { generatePath, useNavigate } from 'react-router';

export type OrganizationsDataGridProps = {
  data: PagedOrganizationWithDebtPositionTypeOrgAndOperatorsCount;
  isLoading?: boolean;
};

const OrganizationsDatagrid = ({
  data,
  isLoading = false
}: OrganizationsDataGridProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const columns: Array<GridColDef> = [
    {
      field: 'orgName',
      headerName: t('organizations.name'),
      flex: 2,
      type: 'string'
    },
    {
      field: 'orgFiscalCode',
      headerName: t('organizations.fiscalCode'),
      flex: 1.5,
      type: 'string'
    },
    {
      field: 'operatorsCount',
      headerName: t('organizations.activeOperators'),
      flex: 1,
      type: 'number',
      align: 'left',
      headerAlign: 'left'
    },
    {
      field: 'debtPositionTypeOrgCount',
      headerName: t('organizations.activeDebtTypes'),
      flex: 1,
      type: 'number',
      align: 'left',
      headerAlign: 'left'
    },
    {
      field: 'status',
      headerName: t('commons.state'),
      flex: 1,
      renderCell: (
        params: GridRenderCellParams<OrganizationWithDebtPositionTypeOrgAndOperatorsCount>
      ) => {
        const status = params.value as StatusEnum;
        const getStatusColor = (status: StatusEnum) => {
          switch (status) {
            case StatusEnum.ACTIVE:
              return 'success';
            case StatusEnum.DRAFT:
              return 'default';
            default:
              return 'default';
          }
        };

        return (
          <Chip
            label={t(`commons.status.${status}`)}
            title={t(`commons.status.${status}`)}
            color={getStatusColor(status)}
            size="small"
          />
        );
      }
    },
    {
      field: 'detail',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (
        params: GridRenderCellParams<OrganizationWithDebtPositionTypeOrgAndOperatorsCount>
      ) => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => {
            navigate(
              generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
                organizationId: params.id
              })
            );
          }}
        >
          <ChevronRight />
        </IconButton>
      )
    }
  ];

  return (
    <CustomDataGrid
      rows={data?.content ?? []}
      getRowId={(row) => row.organizationId}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      localeText={{ noRowsLabel: t('flowDataGrid.noDataRows') }}
      loading={isLoading}
      totalPages={data?.totalPages || 1}
    />
  );
};

export default OrganizationsDatagrid;
