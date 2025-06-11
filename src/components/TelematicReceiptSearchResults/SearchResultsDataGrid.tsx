import {
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
  GridValidRowModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import ActionMenu from '../ActionMenu/ActionMenu';
import CustomDataGrid from './../DataGrid/CustomDataGrid';
import { FileDownload, ReadMore } from '@mui/icons-material';
import { generatePath, useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../routes';
import { moneyFormat } from '../../utils/formatters';
import { PagedReceiptView } from '../../../generated/data-contracts';
import { getReceiptPdf } from '../../api/receiptPdf';
import { downloadBlob } from '../../utils/download';
import utils from '../../utils';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';

type SearchResultDataRow = {
  id: number;
  iuv: string;
  amount: string;
  dueType: string;
  paymentDate: string;
} & GridValidRowModel;

export type DataGridProps = {
  data: PagedReceiptView;
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
  const { state } = useStore();

  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const onSort = (model: GridSortModel) => {
    if (model?.length) {
      const sort = model.map((item) =>
        item?.sort ? `${item.field},${item.sort.toUpperCase()}` : ''
      );
      onSortChange(sort);
    }
  };

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
      renderCell: (params: GridRenderCellParams<SearchResultDataRow>) => (
        <ActionMenu
          rowId={params.row.id}
          menuItems={[
            {
              icon: <ReadMore fontSize="small" />,
              label: t('commons.detail'),
              action: () =>
                navigate(
                  generatePath(PageRoutes.TELEMATIC_RECEIPT_DETAIL, {
                    id: params.row.receiptId
                  })
                )
            },
            {
              icon: <FileDownload fontSize="small" />,
              label: t('commons.files.download'),
              action: () => handleDownloadReceiptPdf(params.row.receiptId)
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
        getRowId={(row) => row.receiptId}
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
