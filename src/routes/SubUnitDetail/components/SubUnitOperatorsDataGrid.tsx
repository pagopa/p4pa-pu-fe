import { GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

import {
  OrgSubUnitOperator,
  PagedOrgSubUnitOperators
} from '@generated/core/data-contracts';

import ActionMenu from '@core/components/ActionMenu/ActionMenu';
import CustomDataGrid from '@core/components/DataGrid/CustomDataGrid';

type SubUnitsDataGridProps = {
  data: PagedOrgSubUnitOperators;
};

export const SubUnitOperatorsDataGrid = ({ data }: SubUnitsDataGridProps) => {
  const { t } = useTranslation();

  const columns: Array<GridColDef<OrgSubUnitOperator>> = [
    {
      field: 'mappedExternalUserId',
      headerName: t('commons.id').toUpperCase(),
      flex: 1
    },
    {
      field: 'operatorName',
      headerName: t('commons.name'),
      flex: 1,
      renderCell: ({ row }) => {
        const name = `${row.firstName ?? ''} ${row.lastName ?? ''}`;
        const missingName = name.trim() === '';
        return missingName ? ' _ ' : name;
      }
    },
    {
      field: 'fiscalCode',
      headerName: t('commons.fiscalCode'),
      flex: 1,
      renderCell: ({ value }) => value || ' _ '
    },
    {
      field: 'action',
      headerName: '',
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <ActionMenu rowId={row.mappedExternalUserId} menuItems={[]} />
      )
    }
  ];

  return (
    <CustomDataGrid
      rows={data?.content || []}
      getRowId={(row: OrgSubUnitOperator) => row.mappedExternalUserId}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      totalPages={data?.totalPages || 0}
    />
  );
};
