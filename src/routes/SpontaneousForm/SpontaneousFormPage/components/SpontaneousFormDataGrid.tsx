import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import {
  PagedSpontaneousForm,
  SpontaneousForm
} from '../../../../../generated/core/data-contracts';
import CustomDataGrid from '../../../../components/DataGrid/CustomDataGrid';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../../..';

export type SpontaneousFormDataGridProps = {
  data: PagedSpontaneousForm;
  isLoading?: boolean;
};

const SpontaneousFormDataGrid = ({
  data,
  isLoading = false
}: SpontaneousFormDataGridProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const columns: Array<GridColDef> = [
    {
      field: 'code',
      headerName: t('spontaneousForm.columns.code'),
      flex: 1.5,
      type: 'string'
    },
    {
      field: 'debtPositionTypeOrgCount',
      headerName: t('spontaneousForm.columns.debtPositionTypeOrgCount'),
      flex: 1,
      type: 'number',
      align: 'left',
      headerAlign: 'left'
    },
    {
      field: 'detail',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<SpontaneousForm>) => (
        <IconButton
          aria-label={t('commons.goToDetail')}
          size="small"
          onClick={() => {
            navigate(
              generatePath(PageRoutes.SPONTANEOUS_FORM_DETAIL, {
                spontaneousFormId: params.row.spontaneousFormId
              })
            );
          }}
        >
          <ChevronRight />
        </IconButton>
      )
    }
  ];

  return (
    <CustomDataGrid
      rows={data?.content ?? []}
      getRowId={(row) => row.spontaneousFormId}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      localeText={{ noRowsLabel: t('flowDataGrid.noDataRows') }}
      loading={isLoading}
      totalPages={data?.totalPages || 1}
    />
  );
};

export default SpontaneousFormDataGrid;
