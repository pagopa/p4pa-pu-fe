import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import type {
  OrgSubUnit,
  PagedOrgSubUnit
} from '../../../../generated/core/client';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { OrgSubUnitStatus } from '@generated/core/data-contracts';
import EmptyDetailContainer from '../../../components/DebtPositionsInstallmentDetail/EmptyDetailContainer';
import utils from '@core/utils';
import Chip from '@mui/material/Chip';
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '@core/routes';

type PagedOrgSubUnitDataGridProps = {
  data?: PagedOrgSubUnit;
  onDelete: (row: OrgSubUnit) => void;
  id: string;
};

const SubUnitDataGrid = ({
  data,
  onDelete,
  id
}: PagedOrgSubUnitDataGridProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const colorMap: Record<OrgSubUnitStatus, 'success' | 'error'> = {
    [OrgSubUnitStatus.ACTIVE]: 'success',
    [OrgSubUnitStatus.CANCELLED]: 'error'
  };

  const toDetail = (row: OrgSubUnit) =>
    navigate(
      generatePath(PageRoutes.SUB_UNIT_DETAIL, {
        organizationId: row.organizationId,
        subUnitCode: row.subUnitCode
      })
    );

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
          color={colorMap[params.value as OrgSubUnitStatus]}
          size="small"
          label={t(`OperatorDetail.subUnitStatus.${params.value}`)}
        />
      )
    },
    {
      field: 'action',
      type: 'actions',
      headerName: '',
      flex: 0.4,
      getActions: (params: GridRowParams<OrgSubUnit>) => [
        <GridActionsCellItem
          key="detail"
          icon={<ChevronRight />}
          label={t('commons.toDetail')}
          onClick={() => toDetail(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<RemoveCircleOutline />}
          label={t('commons.remove')}
          onClick={() => onDelete(params.row)}
        />
      ]
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
