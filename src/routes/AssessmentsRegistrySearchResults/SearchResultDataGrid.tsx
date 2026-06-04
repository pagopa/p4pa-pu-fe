import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from '@mui/icons-material';
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
  data: PagedAssessmentsRegistry | undefined;
};

const stateColors: Record<AssessmentsRegistryStatus, ChipProps['color']> = {
  ACTIVE: 'success',
  INACTIVE: 'default'
};

export const SearchResultsDataGrid = ({ data }: DataGridProps) => {
  const { t } = useTranslation();

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
      flex: 0.5,
      type: 'string'
    },
    {
      field: 'debtPositionTypeOrgDescription',
      headerName: t(
        'assessmentsRegistrySearchResults.debtPositionTypeOrgDescription'
      ),
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
          aria-label={t('commons.goToDetail')}
        >
          <IconButton color="primary" size="small">
            <ChevronRight />
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
      totalPages={data?.totalPages || 1}
    />
  );
};
