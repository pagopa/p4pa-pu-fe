import { useTranslation } from 'react-i18next';
import type { GridRowParams } from '@mui/x-data-grid';
import {
  GridActionsCellItem,
  type GridColDef,
  type GridRenderCellParams
} from '@mui/x-data-grid';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import type {
  PagedOrganizationWithDebtPositionTypeOrgAndOperatorsCount,
  OrganizationWithDebtPositionTypeOrgAndOperatorsCount
} from '../../../../generated/core/data-contracts';
import { StatusEnum } from '../../../../generated/core/data-contracts';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../..';

import Chip from '@mui/material/Chip';
import ChevronRight from '@mui/icons-material/ChevronRight';

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

  const handleRowClick = (
    org: OrganizationWithDebtPositionTypeOrgAndOperatorsCount
  ) => {
    navigate(
      generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
        organizationId: org.organizationId
      })
    );
  };

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
      type: 'actions',
      field: 'detail',
      flex: 0.2,
      getActions: (
        params: GridRowParams<OrganizationWithDebtPositionTypeOrgAndOperatorsCount>
      ) => [
        <GridActionsCellItem
          key={params.id}
          icon={<ChevronRight />}
          label={t('organizations.detail', {
            orgName: params.row.orgName
          })}
          onClick={() => handleRowClick(params.row)}
        />
      ]
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
