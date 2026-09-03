import {
  GridColDef,
  GridRenderCellParams,
  GridValidRowModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { FileDownload, Visibility } from '@mui/icons-material';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../../../routes';
import { PagedPaymentsReportingView } from '../../../../generated/core/data-contracts';
import { moneyFormat } from '../../../utils/formatters';
import ActionMenu from '../../../components/ActionMenu/ActionMenu';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import utils from '../../../utils';
import { useStore } from '../../../store/GlobalStore';
import { getIngestionFlowFile } from '../../../api/ingestionFlowFiles';
import { downloadBlob } from '../../../utils/download';

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
  const {
    state: { organizationId }
  } = useStore();

  const mutation = getIngestionFlowFile(organizationId);

  const downloadIngestionFlowFile = async (ingestionFlowFileId: number) => {
    try {
      const { fileName, data } =
        await mutation.mutateAsync(ingestionFlowFileId);
      downloadBlob(data, fileName);
    } catch (error) {
      console.error('Error downloading file:', error);
      utils.notify.emit(t('commons.files.downloadFailed'));
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
      type: 'string',
      sortable: false
    },
    {
      field: 'regulationDate',
      headerName: t('reportingSearchResults.regulationDate'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams) =>
        params.value ? new Date(params.value).toLocaleDateString('it-IT') : '',
      sortable: false
    },
    {
      field: 'flowDateTime',
      headerName: t('reportingSearchResults.flowDate'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams) =>
        params.value ? new Date(params.value).toLocaleDateString('it-IT') : '',
      sortable: false
    },
    {
      field: 'totalPayments',
      headerName: t('reportingSearchResults.payments'),
      flex: 1,
      type: 'string',
      sortable: false
    },
    {
      field: 'totalAmountCents',
      headerName: t('reportingSearchResults.totalAmount'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams<SearchResultDataRow>) =>
        moneyFormat(params.value as number),
      sortable: false
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.3,
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
                  }),
                  {
                    state: {
                      ingestionFlowFileId: params.row.ingestionFlowFileId
                    }
                  }
                )
            },
            {
              icon: <FileDownload fontSize="small" />,
              label: t('commons.files.download'),
              action: () =>
                downloadIngestionFlowFile(params.row.ingestionFlowFileId)
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
