import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { IconButton } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

import CustomDataGrid from '@core/components/DataGrid/CustomDataGrid';
import {
  OrgSubUnit,
  OrgSubUnitStatus,
  PagedOrgSubUnit
} from '@generated/core/data-contracts';
import { formatDate } from '@core/utils/formatters';
import { MIChip, MIChipProps } from '@pagopa/mui-italia';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '@core/routes';

type SubUnitsDataGridProps = {
  data: PagedOrgSubUnit;
  organizationId: number;
};

export const SubUnitsDataGrid = ({
  data,
  organizationId
}: SubUnitsDataGridProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const colorMap: Record<OrgSubUnitStatus, MIChipProps['color']> = {
    [OrgSubUnitStatus.ACTIVE]: 'default',
    [OrgSubUnitStatus.CANCELLED]: 'neutral'
  };

  const toDetail = (subUnitCode: string) =>
    navigate(
      generatePath(PageRoutes.SUB_UNIT_DETAIL, {
        organizationId,
        subUnitCode
      })
    );

  const columns: Array<GridColDef<OrgSubUnit>> = [
    {
      field: 'subUnitCode',
      headerName: t('subunits.subUnitCode'),
      flex: 1
    },
    {
      field: 'subUnitType',
      headerName: t('subunits.subUnitType'),
      flex: 1
    },
    {
      field: 'subUnitName',
      headerName: t('subunits.subUnitName'),
      flex: 1
    },
    {
      field: 'creationDate',
      headerName: t('commons.creationDate'),
      flex: 1,
      renderCell: (params) =>
        formatDate(params.row.creationDate, 'dd MMMM yyyy')
    },
    {
      field: 'status',
      sortable: false,
      headerName: t('commons.state'),
      flex: 1,
      renderCell: ({ row: { status } }) =>
        status ? (
          <MIChip
            color={colorMap[status]}
            label={t(`subunits.status.${status}`)}
          />
        ) : null
    },
    {
      field: 'action',
      sortable: false,
      headerName: '',
      flex: 0.2,
      renderCell: ({ row: { subUnitCode } }) => (
        <IconButton
          size="small"
          aria-label={t('commons.toDetail')}
          onClick={() => toDetail(subUnitCode)}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      )
    }
  ];

  return (
    <CustomDataGrid
      rows={data?.content || []}
      getRowId={(row: OrgSubUnit) => row.organizationId + row.subUnitCode}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      totalPages={data?.totalPages || 0}
    />
  );
};
