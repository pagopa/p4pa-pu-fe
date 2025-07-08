import {
  GridColDef,
  GridRenderCellParams,
  GridSortModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import CustomDataGrid, {
  SmartPaginationConfig
} from '../../../components/DataGrid/CustomDataGrid';
import { ReadMore } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { moneyFormat, formatDateTime } from '../../../utils/formatters';
import { AssessmentsDetail } from '../../../../generated/apiClient';

type AssessmentDetailDataGridProps = {
  rows: Array<AssessmentsDetail>;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  smartPagination?: SmartPaginationConfig;
  isLoading?: boolean;
};

/**
 * DataGrid per la visualizzazione dei dettagli di un assessment.
 * Mostra le colonne: IUV, Importo, Data esito, Ultimo aggiornamento.
 */
const AssessmentDetailDataGrid = ({
  rows,
  sortModel,
  onSortModelChange,
  smartPagination,
  isLoading = false
}: AssessmentDetailDataGridProps) => {
  const { t } = useTranslation();

  const columns: Array<GridColDef> = [
    {
      field: 'iuv',
      headerName: t('commons.iuv'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'amountCents',
      headerName: t('commons.amount'),
      flex: 0.8,
      type: 'string',
      renderCell: (params: GridRenderCellParams<AssessmentsDetail>) =>
        moneyFormat(params.value as number)
    },
    {
      field: 'paymentDateTime',
      headerName: t('commons.paymentdate'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams) =>
        params.value ? formatDateTime(params.value) : ''
    },
    {
      field: 'updateDate',
      headerName: t('commons.lastUpdate'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams) =>
        params.value ? formatDateTime(params.value) : ''
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: () => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => console.log('Navigate to assessment detail item')}
          aria-label="go to assessment detail item"
        >
          <ReadMore />
        </IconButton>
      )
    }
  ];

  return (
    <>
      <CustomDataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) =>
          row.assessmentDetailId || `${row.assessmentId}-${row.iuv}`
        }
        disableColumnMenu
        disableColumnResize
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        smartPagination={smartPagination}
        loading={isLoading}
      />
    </>
  );
};

export default AssessmentDetailDataGrid;
