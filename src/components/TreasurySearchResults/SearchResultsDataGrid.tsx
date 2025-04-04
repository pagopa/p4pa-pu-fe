import {
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
  GridValidRowModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { ReadMore } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { generatePath, Link } from 'react-router-dom';
import { PageRoutes } from '../../App';
import { PagedTreasuryView } from '../../../generated/apiClient';
import { formatDate, moneyFormat } from '../../utils/formatters';

type SearchResultDataRow = {
  billAmountCents: number;
  billDate: string;
  regionValueDate: string;
} & GridValidRowModel;

export type DataGridProps = {
  data: PagedTreasuryView;
  onPageChange: (page: number) => void;
  onPageSizeChange: (page: number) => void;
  onSortChange: (model: Array<string>) => void;
  pagination: {
    currentPage: number;
    page: number;
    size: number;
  };
};

const SearchResultsDataGrid = ({
  data,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  pagination
}: DataGridProps) => {
  const { t } = useTranslation();

  const onSort = (model: GridSortModel) => {
    if (model?.length) {
      const sort = model.map((item) =>
        item?.sort ? `${item.field},${item.sort.toUpperCase()}` : ''
      );
      onPageChange(1);
      onSortChange(sort);
    }
  };

  const columns: Array<GridColDef> = [
    {
      field: 'billYear',
      headerName: t('treasurySearchResults.billingYear'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'billCode',
      headerName: t('treasurySearchResults.billingCode'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'regionValueDate',
      headerName: t('treasurySearchResults.valueDate'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams) =>
        params.value && formatDate(params.value)
    },
    {
      field: 'billDate',
      headerName: t('treasurySearchResults.accountingDate'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams) =>
        params.value && formatDate(params.value)
    },
    {
      field: 'iuf',
      headerName: t('treasurySearchResults.reportingId'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'billAmountCents',
      headerName: t('commons.amount'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams<SearchResultDataRow>) =>
        moneyFormat(params.value as number)
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<SearchResultDataRow>) => (
        <Link
          to={generatePath(PageRoutes.TREASURY_DETAIL, {
            id: params.row.treasuryId
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
        getRowId={(row) => row.treasuryId}
        columns={columns}
        disableColumnMenu
        disableColumnResize
        onSortModelChange={onSort}
        customPagination={{
          defaultPageOption: pagination.size,
          sizePageOptions: [5, 10, 20],
          totalPages: data?.totalPages,
          currentPage: pagination.currentPage,
          onPageChange,
          onPageSizeChange
        }}
      />
    </>
  );
};

export default SearchResultsDataGrid;
