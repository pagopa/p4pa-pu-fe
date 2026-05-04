import {
  GridColDef,
  GridRenderCellParams,
  GridValidRowModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { FileDownload, ReadMore } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { moneyFormat } from '../../utils/formatters';
import {
  PagedReceiptView,
  ReceiptView
} from '../../../generated/data-contracts';
import { getReceiptPdf } from '../../api/receiptPdf';
import { downloadBlob } from '../../utils/download';
import utils from '../../utils';
import { buildTelematicReceiptDetailPath } from '../../utils/receiptNavigation';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import ActionMenu from '../../components/ActionMenu/ActionMenu';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';

type SearchResultDataRow = ReceiptView & GridValidRowModel;

export type DataGridProps = {
  data: PagedReceiptView;
};

const SearchResultsDataGrid = ({ data }: DataGridProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useStore();

  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const getReceiptPdfMutation = getReceiptPdf(organizationId);
  const handleDownloadReceiptPdf = async (id: number) => {
    try {
      const result = await getReceiptPdfMutation.mutateAsync(id);
      const { data, fileName } = result;
      downloadBlob(data, fileName);
    } catch (error) {
      console.error(error);
      utils.notify.emit(t('commons.files.downloadFailed'), 'error');
    }
  };

  const columns: Array<GridColDef> = [
    { field: 'iuv', headerName: t('commons.iuv'), flex: 1, type: 'string' },
    {
      field: 'paymentAmountCents',
      headerName: t('commons.amount'),
      flex: 1,
      type: 'number',
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams<SearchResultDataRow>) =>
        moneyFormat(params.value as number)
    },
    {
      field: 'debtPositionTypeOrgDescription',
      headerName: t('commons.duetype'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'paymentDateTime',
      headerName: t('commons.paymentdate'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams) =>
        params.value ? new Date(params.value).toLocaleDateString('it-IT') : ''
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }: GridRenderCellParams<SearchResultDataRow>) => (
        <ActionMenu
          rowId={row.id}
          menuItems={[
            {
              icon: <ReadMore fontSize="small" />,
              label: t('commons.detail'),
              action: () => {
                const { receiptId, iud } = row;
                if (receiptId === undefined) {
                  return;
                }
                navigate(buildTelematicReceiptDetailPath(receiptId, iud));
              }
            },
            {
              icon: <FileDownload fontSize="small" />,
              label: t('commons.files.download'),
              action: () => {
                if (row.receiptId === undefined) {
                  return;
                }
                handleDownloadReceiptPdf(row.receiptId);
              }
            }
          ]}
        />
      )
    }
  ];

  return (
    <CustomDataGrid
      rows={data?.content ?? []}
      getRowId={(row) => row.iud}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      totalPages={data?.totalPages || 1}
    />
  );
};

export default SearchResultsDataGrid;
