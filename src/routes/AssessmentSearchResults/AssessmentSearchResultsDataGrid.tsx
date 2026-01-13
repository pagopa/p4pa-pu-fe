import {
  GridColDef,
  GridRenderCellParams,
  GridValidRowModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { IconButton, Chip } from '@mui/material';
import { ReadMore } from '@mui/icons-material';
import { useNavigate, generatePath } from 'react-router';
import { PageRoutes } from '../../routes';
import {
  PagedAssessmentsExtendedDTO,
  AssessmentsExtendedDTO
} from '../../../generated/data-contracts';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';
import { formatDate } from '../../utils/formatters';
import { getAssessmentStatusChipProps } from '../../utils/assessmentHelpers';

type AssessmentSearchResultsDataGridProps = {
  data?: PagedAssessmentsExtendedDTO;
  isLoading?: boolean;
};

type AssessmentDataRow = AssessmentsExtendedDTO & GridValidRowModel;

const AssessmentSearchResultsDataGrid = ({
  data
}: AssessmentSearchResultsDataGridProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleDetailClick = (assessmentId: number | undefined) => {
    if (assessmentId) {
      const detailPath = generatePath(PageRoutes.ASSESSMENT_DETAIL, {
        id: assessmentId.toString()
      });
      navigate(detailPath);
    }
  };

  const columns: Array<GridColDef> = [
    {
      field: 'assessmentName',
      headerName: t('assessment.searchResults.columns.assessmentName'),
      flex: 2,
      type: 'string',
      minWidth: 200
    },
    {
      field: 'debtPositionTypeOrgCode',
      headerName: t('assessment.searchResults.columns.debtType'),
      flex: 2,
      type: 'string',
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<AssessmentDataRow>) =>
        params.row.descriptionDebtPositionTypeOrgCode ||
        params.row.debtPositionTypeOrgCode ||
        '-'
    },
    {
      field: 'familyName',
      headerName: t('assessment.searchResults.columns.createdBy'),
      flex: 1.5,
      type: 'string',
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<AssessmentDataRow>) =>
        params.value || params.row.updateOperatorExternalId || '-'
    },
    {
      field: 'updateDate',
      headerName: t('assessment.searchResults.columns.updatedAt'),
      flex: 1.5,
      type: 'string',
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<AssessmentDataRow>) =>
        params.value ? formatDate(params.value) : '-'
    },
    {
      field: 'status',
      headerName: t('assessment.searchResults.columns.status'),
      flex: 1.2,
      type: 'string',
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<AssessmentDataRow>) => {
        if (!params.value) {
          return <span>-</span>;
        }

        const chipProps = getAssessmentStatusChipProps(params.value, t);
        return (
          <Chip
            label={chipProps.label}
            color={chipProps.color}
            size="small"
            variant="filled"
          />
        );
      }
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      minWidth: 80,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<AssessmentDataRow>) => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => handleDetailClick(params.row.assessmentId)}
          aria-label={t('commons.detail')}
          data-testid="assessment-detail-button"
        >
          <ReadMore />
        </IconButton>
      )
    }
  ];

  return (
    <CustomDataGrid
      rows={data?.content ?? []}
      getRowId={(row: AssessmentDataRow) => row.assessmentId || 0}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      totalPages={data?.totalPages || 1}
    />
  );
};

export default AssessmentSearchResultsDataGrid;
