import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import { OpenInNew, RemoveCircleOutline } from '@mui/icons-material';
import {
  DebtPositionTypeOrgDTO,
  PagedDebtPositionTypeOrgDTO
} from '../../../../generated/apiClient';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import ActionMenu from '../../../components/ActionMenu/ActionMenu';
import EmptyDetailContainer from '../../../components/DebtPositionsInstallmentDetail/EmptyDetailContainer';

type OperatorDetailDataGridProps = {
  data?: PagedDebtPositionTypeOrgDTO;
};

const OperatorDetailDataGrid = ({ data }: OperatorDetailDataGridProps) => {
  const { t } = useTranslation();

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
        <ActionMenu
          rowId={params.row.debtPositionTypeId}
          menuItems={[
            {
              icon: (
                <RemoveCircleOutline
                  color="error"
                  aria-label="remove operator detail item"
                  data-testid={`remove-detail-${params.row.debtPositionTypeId}`}
                />
              ),
              label: t('commons.onlyRemove'),
              // TODO: add remove logic
              action: () => null
            },
            {
              icon: (
                <OpenInNew
                  color="primary"
                  aria-label="go to operator detail item"
                  data-testid={`navigate-to-detail-${params.row.debtPositionTypeId}`}
                />
              ),
              label: t('commons.goToDetail'),
              // TODO: add go to detail
              action: () => null
            }
          ]}
        />
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
