import { Trans, useTranslation } from 'react-i18next';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import {
  DebtPositionTypeOrgDTO,
  PagedDebtPositionTypeOrgDTO
} from '../../../../generated/apiClient';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import EmptyDetailContainer from '../../../components/DebtPositionsInstallmentDetail/EmptyDetailContainer';
import { GridActionMenu } from './ActionMenu';
import utils from '../../../utils';

type OperatorDetailDataGridProps = {
  data?: PagedDebtPositionTypeOrgDTO;
  onDelete: (row: DebtPositionTypeOrgDTO) => void;
  operatorName: string;
};

const OperatorDetailDataGrid = ({
  data,
  onDelete: propsOnDelete,
  operatorName
}: OperatorDetailDataGridProps) => {
  const { t } = useTranslation();

  const onDelete = (row: DebtPositionTypeOrgDTO) => {
    utils.dialog.open({
      ['data-testid']: 'delete-dialog',
      title: t('OperatorDetail.deleteDialog.title'),
      message: (
        <Trans
          i18nKey="OperatorDetail.deleteDialog.message"
          values={{ operatorName }}
        />
      ),
      confirmLabel: t('commons.onlyRemove'),
      cancelLabel: t('commons.close'),
      onConfirm: () => {
        propsOnDelete(row);
        utils.dialog.close();
      },
      onClose: () => utils.dialog.close()
    });
  };

  const columns: Array<GridColDef<DebtPositionTypeOrgDTO>> = [
    {
      field: 'code',
      headerName: t('OperatorDetail.code'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'debtPositionTypeDescription',
      headerName: t('OperatorDetail.debtPositionTypeDescription'),
      flex: 0.8,
      type: 'string'
    },
    {
      field: 'description',
      headerName: t('commons.description'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<DebtPositionTypeOrgDTO>) => (
        <GridActionMenu row={params.row} onDelete={onDelete} />
      )
    }
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
      getRowId={(row: DebtPositionTypeOrgDTO) =>
        row.debtPositionTypeOrgId ||
        `${row.organizationId}-${row.debtPositionTypeId}`
      }
      disableColumnMenu
      disableColumnResize
      totalPages={data?.totalPages || 1}
    />
  );
};

export default OperatorDetailDataGrid;
