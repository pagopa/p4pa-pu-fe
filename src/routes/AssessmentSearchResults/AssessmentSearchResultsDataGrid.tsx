import {
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
  GridValidRowModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { IconButton, Chip } from '@mui/material';
import { ReadMore } from '@mui/icons-material';
import {
  PagedAssessmentsExtendedDTO,
  AssessmentsExtendedDTO
} from '../../../generated/data-contracts';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';
import { formatDate } from '../../utils/formatters';
import { getAssessmentStatusChipProps } from '../../utils/assessmentHelpers';

type AssessmentSearchResultsDataGridProps = {
  data?: PagedAssessmentsExtendedDTO;
  onSortChange: (sort: Array<string>) => void;
  onPaginationChange: (paginationParams: {
    page: number;
    size: number;
  }) => void;
  isLoading?: boolean;
};

type AssessmentDataRow = AssessmentsExtendedDTO & GridValidRowModel;

/**
 * Component DataGrid for assessment search results.
 * Shows a table with columns: assessment name, debt type, created by,
 * updated at, status (with colored chips) and action for detail.
 */
const AssessmentSearchResultsDataGrid = ({
  data,
  onSortChange,
  onPaginationChange
}: AssessmentSearchResultsDataGridProps) => {
  const { t } = useTranslation();

  const onSort = (model: GridSortModel) => {
    if (model?.length) {
      const sort = model.map((item) =>
        item?.sort ? `${item.field},${item.sort.toUpperCase()}` : ''
      );
      onSortChange(sort);
    }
  };

  const handleDetailClick = (assessmentId: number | undefined) => {
    if (assessmentId) {
      // TODO: Add navigation to assessment detail page
      console.log('Navigating to assessment detail:', assessmentId);
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
      field: 'descriptionDebtPositionTypeOrgCode',
      headerName: t('assessment.searchResults.columns.debtType'),
      flex: 2,
      type: 'string',
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<AssessmentDataRow>) =>
        params.value || params.row.debtPositionTypeOrgCode || '-'
    },
    {
      field: 'updateOperatorExternalId',
      headerName: t('assessment.searchResults.columns.createdBy'),
      flex: 1.5,
      type: 'string',
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<AssessmentDataRow>) =>
        params.value || '-'
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
      onSortModelChange={onSort}
      smartPagination={{
        sizeOptions: [5, 10, 20],
        backendData: {
          totalElements: data?.totalElements,
          totalPages: data?.totalPages,
          number: data?.number,
          size: data?.size
        },
        onPaginationChange: onPaginationChange
      }}
    />
  );
};

export default AssessmentSearchResultsDataGrid;
