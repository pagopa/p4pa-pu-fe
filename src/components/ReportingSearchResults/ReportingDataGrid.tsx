import {
  GridColDef,
  GridRenderCellParams,
  GridValidRowModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import ActionMenu from '../ActionMenu/ActionMenu';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { FileDownload, Visibility } from '@mui/icons-material';
import { generatePath, useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../App';
import { PagedPaymentsReportingView } from '../../../generated/data-contracts';
import { moneyFormat } from '../../utils/formatters';

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
  const navigate = useNavigate();

  console.log('data', data);

  // const rows: Array<SearchResultDataRow> = [
  //   {
  //     id: 1,
  //     idReporting: '2024-11-10123531',
  //     idRegulation: '49445-2454456456',
  //     regulationDate: '05/11/2021',
  //     flowDateTime: '05/11/2021 04:06:44',
  //     totalPayments: '100',
  //     totalAmountCents: '100,00 €'
  //   },
  //   {
  //     id: 2,
  //     idReporting: '2024-11-10123531',
  //     idRegulation: '50445-2454456456',
  //     regulationDate: '06/11/2021',
  //     flowDateTime: '06/11/2021 05:06:44',
  //     totalPayments: '200',
  //     totalAmountCents: '200,00 €'
  //   },
  //   {
  //     id: 3,
  //     idReporting: '2024-12-10123531',
  //     idRegulation: '514453-2454456456',
  //     regulationDate: '07/11/2021',
  //     flowDateTime: '07/11/2021 06:06:44',
  //     totalPayments: '300',
  //     totalAmountCents: '300,00 €'
  //   }
  // ];

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
                    id: params.row.ingestionFlowFileId
                  })
                )
            },
            {
              icon: <FileDownload fontSize="small" />,
              label: t('commons.files.download'),
              action: () =>
                console.log(
                  'Scarica file per ID: ',
                  params.row.ingestionFlowFileId
                )
            }
          ]}
        />
      )
    }
  ];

  return (
    <>
      <CustomDataGrid
        rows={data?.content ?? []}
        getRowId={(row) => row.ingestionFlowFileId}
        columns={columns}
        disableColumnMenu
        disableColumnResize
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
