import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import { OrgSubUnit, PagedOrgSubUnit } from '../../../../generated/core/client';
import { GridColDef } from '@mui/x-data-grid';
import EmptyDetailContainer from '../../../components/DebtPositionsInstallmentDetail/EmptyDetailContainer';
import { RemoveCircleOutline } from '@mui/icons-material';
import utils from '@core/utils';
import { Button, Chip } from '@mui/material';

type PagedOrgSubUnitDataGridProps = {
  data?: PagedOrgSubUnit;
  onDelete: (row: OrgSubUnit) => void;
  id: string;
};

const SubUnitDataGrid = ({ data, onDelete, id }: PagedOrgSubUnitDataGridProps) => {
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
      type: 'string',
      renderCell: (params) => utils.formatters.formatDate(params.value)
    },
    {
      field: 'status',
      headerName: t('OperatorDetail.subStatus'),
      flex: 1,
      type: 'string',
      renderCell: (params) => (
        <Chip
          color="info"
          size="small"
          label={t(`OperatorDetail.subUnitStatus.${params.value}`)}
        />
      )
    },
    {
      field: 'action',
      headerName: '',
      flex: 1,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Button
          endIcon={<RemoveCircleOutline />}
          onClick={() => onDelete(params.row)}
          color="error"
        >
          {t('commons.remove')}
        </Button>
      )
    }
  ];

  if (data?.content?.length === 0) {
    return (
      <EmptyDetailContainer
        description={t('OperatorDetail.subUnitEmptyData')}
        sx={{ width: '100%' }}
      />
    );
  }

  return (
    <CustomDataGrid
      rows={data?.content || []}
      columns={columns}
      getRowId={(row: OrgSubUnit) => row.subUnitCode}
      disableColumnMenu
      disableColumnResize
      totalPages={data?.totalPages || 1}
      id={id}
    />
  );
};

export default SubUnitDataGrid;
