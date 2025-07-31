import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import { ReadMore } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { moneyFormat, formatDate } from '../../../utils/formatters';
import {
  AssessmentsDetail,
  AssessmentsRowsDetail
} from '../../../../generated/apiClient';

type AssessmentDetailDataGridProps = {
  data?: AssessmentsRowsDetail;
  isLoading?: boolean;
  onNavigateToDetail?: (receiptId: number) => void;
};

const AssessmentDetailDataGrid = ({
  data,
  isLoading = false,
  onNavigateToDetail
}: AssessmentDetailDataGridProps) => {
  const { t } = useTranslation();

  // Handle the click on the navigation icon to the detail
  const handleNavigateToDetail = (receiptId: number | undefined) => {
    if (receiptId && onNavigateToDetail) {
      onNavigateToDetail(receiptId);
    }
  };

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
        params.value ? formatDate(params.value) : ''
    },
    {
      field: 'updateDate',
      headerName: t('commons.lastUpdate'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams) =>
        params.value ? formatDate(params.value) : ''
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<AssessmentsDetail>) => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => handleNavigateToDetail(params.row.receiptId)}
          aria-label="go to assessment detail item"
          data-testid={`navigate-to-detail-${params.row.receiptId}`}
        >
          <ReadMore />
        </IconButton>
      )
    }
  ];

  return (
    <CustomDataGrid
      rows={data?.pagedAssessmentsRowsDetail?.content || []}
      columns={columns}
      getRowId={(row) =>
        row.assessmentDetailId || `${row.assessmentId}-${row.iuv}`
      }
      disableColumnMenu
      disableColumnResize
      loading={isLoading}
      totalPages={data?.pagedAssessmentsRowsDetail?.totalPages || 1}
    />
  );
};

export default AssessmentDetailDataGrid;
