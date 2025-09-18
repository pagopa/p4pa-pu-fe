import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import { OpenInNew, ReadMore, RemoveCircleOutline } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import {
  DebtPositionTypeOrgDTO,
  PagedDebtPositionTypeOrgDTO
} from '../../../../generated/apiClient';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import ActionMenu from '../../../components/ActionMenu/ActionMenu';

type OperatorDetailDataGridProps = {
  data?: PagedDebtPositionTypeOrgDTO;
  isLoading?: boolean;
};

const OperatorDetailDataGrid = ({
  data,
  isLoading = false
}: OperatorDetailDataGridProps) => {
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
      loading={isLoading}
      totalPages={data?.totalPages || 1}
    />
  );
};

export default OperatorDetailDataGrid;
