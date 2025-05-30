import {
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
  GridValidRowModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import ActionMenu from '../ActionMenu/ActionMenu';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { FileDownload, Visibility } from '@mui/icons-material';
import { generatePath, useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../routes';
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
  onSortChange: (model: Array<string>) => void;
  onPaginationChange?: (pagination: { page: number; size: number }) => void;
};

const SearchResultsDataGrid = ({
  data,
  onSortChange,
  onPaginationChange
}: DataGridProps) => {
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
    <>
      <CustomDataGrid
        rows={data?.content ?? []}
        getRowId={(row) => row.iuf}
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
