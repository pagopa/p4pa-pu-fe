import {
  GridColDef,
  GridRenderCellParams,
  GridValidRowModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { FileDownload, Visibility } from '@mui/icons-material';
import { generatePath, useNavigate } from 'react-router';

import { PageRoutes } from '../../../routes';
import { PagedPaymentsReportingView } from '../../../../generated/data-contracts';
import { moneyFormat } from '../../../utils/formatters';
import ActionMenu from '../../../components/ActionMenu/ActionMenu';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';

type SearchResultDataRow = {
  id: number;
  idReporting: string;
  idRegulation: string;
  regulationDate: string;
  flowDateTime: string;
  totalPayments: string;
  totalAmountCents: string;
} & GridValidRowModel;

export type DataGridProps = {
  data: PagedPaymentsReportingView;
};

const SearchResultsDataGrid = ({ data }: DataGridProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const columns: Array<GridColDef> = [
    {
      field: 'iuf',
      headerName: t('reportingSearchResults.searchReportingId'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'regulationUniqueIdentifier',
      headerName: t('reportingSearchResults.searchRegulationId'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'regulationDate',
      headerName: t('reportingSearchResults.regulationDate'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams) =>
        params.value ? new Date(params.value).toLocaleDateString('it-IT') : ''
    },
    {
      field: 'flowDateTime',
      headerName: t('reportingSearchResults.flowDate'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams) =>
        params.value ? new Date(params.value).toLocaleDateString('it-IT') : ''
    },
    {
      field: 'totalPayments',
      headerName: t('reportingSearchResults.payments'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'totalAmountCents',
      headerName: t('reportingSearchResults.totalAmount'),
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
        <ActionMenu
          rowId={params.row.id}
          menuItems={[
            {
              icon: <Visibility fontSize="small" />,
              label: t('commons.view'),
              action: () =>
                navigate(
                  generatePath(PageRoutes.REPORTING_DETAIL, {
                    id: params.row.iuf
                  })
                )
            },
            {
              icon: <FileDownload fontSize="small" />,
              label: t('commons.files.download'),
              action: () => console.log('Scarica file per ID: ', params.row.iuf)
            }
          ]}
        />
      )
    }
  ];

  return (
    <CustomDataGrid
      rows={data?.content ?? []}
      getRowId={(row) => row.iuf}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      totalPages={data?.totalPages || 1}
    />
  );
};

export default SearchResultsDataGrid;
