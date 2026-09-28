import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import {
  OrgSubUnit,
  PagedOrgSubUnit,
} from '../../../../generated/core/client';
import { GridColDef } from '@mui/x-data-grid';
import EmptyDetailContainer from '../../../components/DebtPositionsInstallmentDetail/EmptyDetailContainer';

type PagedOrgSubUnitDataGridProps = {
  data?: PagedOrgSubUnit;
};

const SubUnitDataGrid = ({
  data,
}: PagedOrgSubUnitDataGridProps) => {
  const { t } = useTranslation();

  const columns: Array<GridColDef<OrgSubUnit>> = [
    {
      field: 'subUnitCode',
      headerName: t('OperatorDetail.subCode'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'subUnitType',
      headerName: t('OperatorDetail.subType'),
      flex: 0.8,
      type: 'string'
    },
    {
      field: 'subUnitName',
      headerName: t('OperatorDetail.subName'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'creationDate',
      headerName: t('OperatorDetail.subCreationDate'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'status',
      headerName: t('OperatorDetail.subStatus'),
      flex: 1,
      type: 'string'
    },
  ];

  if (data?.content?.length === 0) {
    return (
      <EmptyDetailContainer
        description={t('OperatorDetail.emptyData')}
        sx={{ width: '100%' }}
      />
    );
  }

  return (
    <CustomDataGrid
      rows={data?.content || []}
      columns={columns}
      getRowId={(row: OrgSubUnit) =>
        row.subUnitCode
      }
      disableColumnMenu
      disableColumnResize
      totalPages={data?.totalPages || 1}
    />
  );
};

export default SubUnitDataGrid;
