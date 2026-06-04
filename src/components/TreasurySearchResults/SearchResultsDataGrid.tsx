import {
  GridColDef,
  GridRenderCellParams,
  GridValidRowModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { ReadMore } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { generatePath, Link } from 'react-router';
import { PageRoutes } from '../../routes';
import { PagedTreasuryView } from '../../../generated/apiClient';
import { formatDate, moneyFormat } from '../../utils/formatters';

type SearchResultDataRow = {
  billAmountCents: number;
  billDate: string;
  regionValueDate: string;
} & GridValidRowModel;

export type DataGridProps = {
  data: PagedTreasuryView;
  onPaginationChange?: (pagination: { page: number; size: number }) => void;
};

const SearchResultsDataGrid = ({ data }: DataGridProps) => {
  const { t } = useTranslation();

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
        >
          <IconButton
            aria-label={t('commons.detail')}
            color="primary"
            size="small"
          >
            <ReadMore />
          </IconButton>
        </Link>
      )
    }
  ];

  return (
    <CustomDataGrid
      rows={data?.content ?? []}
      getRowId={(row) => row.treasuryId}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      totalPages={data?.totalPages || 1}
    />
  );
};

export default SearchResultsDataGrid;
