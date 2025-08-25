import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { ReadMore } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { PagedTreasuredClassification } from '../../../generated/apiClient';
import { formatDate, moneyFormat } from '../../utils/formatters';
import { generatePath, Link } from 'react-router';
import { PageRoutes } from '../../routes';

export type DataGridProps = {
  data: PagedTreasuredClassification;
};

const SearchResultsDataGrid = ({ data }: DataGridProps) => {
  const { t } = useTranslation();

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
    <CustomDataGrid
      rows={data?.content ?? []}
      getRowId={(row) => row.classificationId}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      totalPages={data?.totalPages}
    />
  );
};

export default SearchResultsDataGrid;
