import {
  GridColDef,
  GridRenderCellParams,
  GridSortModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { ReadMore } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { PagedTreasuredClassification } from '../../../generated/apiClient';
import { formatDate, moneyFormat } from '../../utils/formatters';
import { generatePath, Link } from 'react-router-dom';
import { PageRoutes } from '../../routes';

export type DataGridProps = {
  data: PagedTreasuredClassification;
  onSortChange: (model: Array<string>) => void;
  onPaginationChange?: (pagination: { page: number; size: number }) => void;
};

const SearchResultsDataGrid = ({
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
      field: 'debtPositionTypeOrgCode',
      headerName: t('commons.debtType'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'iuv',
      headerName: t('commons.iuv'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'receiptPaymentAmount',
      headerName: t('commons.filters.amount.label'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams) =>
        moneyFormat(params.value as number)
    },
    {
      field: 'receiptPaymentDateTime',
      headerName: t('commons.paymentdate'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams) =>
        formatDate(params.value as string)
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
          to={generatePath(PageRoutes.CLASSIFICATION_DETAIL, {
            classificationId: params.row.classificationId
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
    <>
      <CustomDataGrid
        rows={data?.content ?? []}
        getRowId={(row) => row.classificationId}
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
    </>
  );
};

export default SearchResultsDataGrid;
