import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { ReadMore } from '@mui/icons-material';
import { ChipProps, IconButton } from '@mui/material';
import { PagedTreasuredClassificationExtendedDTO } from '../../../generated/apiClient';
import { formatDate, moneyFormat } from '../../utils/formatters';
import { generatePath, Link } from 'react-router';
import { PageRoutes } from '../../routes';
import ChipTruncateTooltip from '../ChipTruncateTooltip';

export type DataGridProps = {
  data: PagedTreasuredClassificationExtendedDTO;
};

type ChipColor = ChipProps['color'];

const SearchResultsDataGrid = ({ data }: DataGridProps) => {
  const { t } = useTranslation();

  const mapStatus: Record<string, ChipColor> = {
    INFO: 'success',
    WARNING: 'warning',
    ERROR: 'error'
  };

  const columns: Array<GridColDef> = [
    {
      field: 'debtPositionTypeOrgDescription',
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
      field: 'iuf',
      headerName: t('commons.iuf'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'calculatedAmount',
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
      field: 'status',
      headerName: t('commons.state'),
      flex: 1,
      type: 'string',
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <ChipTruncateTooltip
          label={t([
            `classifications.statusChip.${params.value}`,
            params.value
          ])}
          color={mapStatus[params.value] || 'default'}
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
          to={generatePath(PageRoutes.CLASSIFICATION_DETAIL, {
            classificationId: params.row.classificationId
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
      getRowId={(row) => row.classificationId}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      totalPages={data?.totalPages}
    />
  );
};

export default SearchResultsDataGrid;
