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

type SubUnitsDataGridProps = {
  data: PagedOrgSubUnit;
};

export const SubUnitsDataGrid = ({ data }: SubUnitsDataGridProps) => {
  const { t } = useTranslation();

  const colorMap: Record<OrgSubUnitStatus, MIChipProps['color']> = {
    [OrgSubUnitStatus.ACTIVE]: 'default',
    [OrgSubUnitStatus.CANCELLED]: 'neutral'
  };

  const columns: Array<GridColDef<OrgSubUnit>> = [
    {
      field: 'subUnitCode',
      headerName: t('subunits.list.subUnitCode'),
      flex: 1
    },
    {
      field: 'subUnitType',
      headerName: t('subunits.list.subUnitType'),
      flex: 1
    },
    {
      field: 'subUnitName',
      headerName: t('subunits.list.subUnitName'),
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
      renderCell: () => (
        <IconButton size="small" aria-label={t('commons.toDetail')}>
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
