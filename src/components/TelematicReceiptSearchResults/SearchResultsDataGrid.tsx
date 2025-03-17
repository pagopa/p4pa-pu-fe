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
import { PageRoutes } from '../../App';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { getReceipts } from '../../api/receipts';
import { useFlowFilters } from '../../hooks/useFlowFilters';
import { FlowFileType } from '../../models/Filters';
import { moneyFormat } from '../../utils/formatters';
import { PagedReceiptView } from '../../../generated/data-contracts';

type SearchResultDataRow = {
  id: number;
  iuv: string;
  amount: string;
  dueType: string;
  paymentDate: string;
} & GridValidRowModel;

export type DataGridProps = {
  data: PagedReceiptView;
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
              action: () => console.log('Scarica file per ID: ', params.row.id)
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
