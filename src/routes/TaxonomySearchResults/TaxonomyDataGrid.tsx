import { useTranslation } from 'react-i18next';
import {
  GridColDef,
  GridRenderCellParams,
  GridSortModel
} from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { generatePath, useNavigate } from 'react-router';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';
import { PagedTaxonomy, Taxonomy } from '../../../generated/apiClient';
import { PageRoutes } from '..';

export type TaxonomyDataGridProps = {
  data: PagedTaxonomy;
  onFiltersApplied?: () => void;
  onSortChange: (model: Array<string>) => void;
  onPaginationChange?: (pagination: { page: number; size: number }) => void;
  isLoading?: boolean;
};

const TaxonomyDataGrid = ({
  data,
  onSortChange,
  onPaginationChange,
  isLoading = false
}: TaxonomyDataGridProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      field: 'taxonomyCode',
      headerName: t('taxonomyPage.fields.taxonomyCode'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'organizationTypeDescription',
      headerName: t('taxonomyPage.fields.organizationTypeDescription'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'macroAreaName',
      headerName: t('taxonomyPage.fields.macroAreaName'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'serviceType',
      headerName: t('taxonomyPage.fields.serviceType'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'collectionReason',
      headerName: t('taxonomyPage.fields.collectionReason'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'detail',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<Taxonomy>) => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => {
            navigate(
              generatePath(PageRoutes.BACKOFFICE_TAXONOMY_DETAIL, {
                taxonomyId: params.row.taxonomyId
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
      getRowId={(row) => row.taxonomyId}
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
      localeText={{ noRowsLabel: t('flowDataGrid.noDataRows') }}
      loading={isLoading}
    />
  );
};

export default TaxonomyDataGrid;
