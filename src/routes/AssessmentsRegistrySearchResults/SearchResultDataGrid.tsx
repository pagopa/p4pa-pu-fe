import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';
import type {
  AssessmentsRegistry,
  AssessmentsRegistryStatus,
  PagedAssessmentsRegistry
} from '../../../generated/core/data-contracts';
import { PageRoutes } from '..';

import type { ChipProps } from '@mui/material/Chip';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ChevronRight from '@mui/icons-material/ChevronRight';

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
          <IconButton size="small">
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
