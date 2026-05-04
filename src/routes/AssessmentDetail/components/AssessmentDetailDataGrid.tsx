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
import { generatePath, useNavigate, useParams } from 'react-router';
import { PageRoutes } from '../..';
import { appendReceiptIudQuery } from '../../../utils/receiptNavigation';

type AssessmentDetailDataGridProps = {
  data?: AssessmentsRowsDetail;
  isLoading?: boolean;
};

const AssessmentDetailDataGrid = ({
  data,
  isLoading = false
}: AssessmentDetailDataGridProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: assessmentId } = useParams<{ id: string }>();

  const navigateToDetail = (receiptId?: number, iud?: string) => {
    if (!receiptId || !iud) {
      return;
    }

    const detailPath = generatePath(PageRoutes.ASSESSMENT_RECEIPT_DETAIL, {
      receiptId,
      assessmentId
    });
    const detailUrl = appendReceiptIudQuery(detailPath, iud);

    navigate(detailUrl, {
      state: {
        assessmentName: data?.assessmentsName
      }
    });
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
          onClick={() => navigateToDetail(params.row.receiptId, params.row.iud)}
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
