import {
  GridColDef,
  GridRenderCellParams,
  GridSortModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { ReadMore } from '@mui/icons-material';
import { Chip, ChipProps, IconButton } from '@mui/material';
import { generatePath, Link } from 'react-router';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';
import {
  AssessmentsRegistry,
  AssessmentsRegistryStatus,
  PagedAssessmentsRegistry
} from '../../../generated/data-contracts';
import { PageRoutes } from '..';

export type DataGridProps = {
  data: PagedAssessmentsRegistry;
  onSortChange: (model: Array<string>) => void;
  onPaginationChange?: (pagination: { page: number; size: number }) => void;
};

const stateColors: Record<AssessmentsRegistryStatus, ChipProps['color']> = {
  ACTIVE: 'success',
  INACTIVE: 'error'
};

export const SearchResultsDataGrid = ({
  data,
  onSortChange,
  onPaginationChange
}: DataGridProps) => {
  const { t } = useTranslation();

  const onSort = (model: GridSortModel) => {
    if (model?.length) {
      const sort = model.map((item) =>
        item?.sort ? `${item.field},${item.sort.toUpperCase()}` : ''
      );
      onSortChange(sort);
    }
  };

  const columns: Array<GridColDef> = [
    {
      field: 'sectionCode',
      headerName: t('assessmentsRegistrySearchResults.sectionCode'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'operatingYear',
      headerName: t('assessmentsRegistrySearchResults.operatingYear'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'debtPositionTypeOrgCode',
      headerName: t('assessmentsRegistrySearchResults.debtPositionTypeOrgCode'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'assessmentCode',
      headerName: t('assessmentsRegistrySearchResults.assessmentCode'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'officeCode',
      headerName: t('assessmentsRegistrySearchResults.officeCode'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'status',
      headerName: t('assessmentsRegistrySearchResults.status'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams<AssessmentsRegistry>) => (
        <Chip
          label={t(`commons.status.${params.value}`)}
          title={t(params.value)}
          color={stateColors[params.value as AssessmentsRegistryStatus]}
          size="small"
        />
      )
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => (
        <Link
          to={generatePath(PageRoutes.ASSESSMENT_REGISTRY_DETAIL, {
            assessmentRegistryId: params.row.assessmentRegistryId
          })}
          aria-label={t('commons.detail')}
        >
          <IconButton color="primary" size="small">
            <ReadMore />
          </IconButton>
        </Link>
      )
    }
  ];

  return (
    <CustomDataGrid
      rows={data?.content ?? []}
      getRowId={(row) => row.assessmentRegistryId}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      onSortModelChange={onSort}
      smartPagination={{
        initialPage: 0,
        initialSize: 10,
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
