import { GridColDef, GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
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

interface SearchResultDataRow extends GridValidRowModel {
  id: number;
  iuv: string;
  amount: string;
  dueType: string;
  paymentDate: string;
}

const SearchResultsDataGrid = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);
  const flowFileTypes = [FlowFileType.RECEIPT_PAGOPA];
  const {
    appliedFilters,
    handleSortModelChange,
    sortModel,
    updatePagination,
  } = useFlowFilters({
    flowFileTypes: flowFileTypes,
  });
  

  const { data } = getReceipts(organizationId, {...appliedFilters, receiptOrigin: 'RECEIPT_PAGOPA'});
  

  const columns: GridColDef[] = [
    { field: 'iuv', headerName: t('commons.iuv'), flex: 1, type: 'string' },
    { field: 'paymentAmountCents', headerName: t('commons.amount'), flex: 1, type: 'number', align: 'left', headerAlign: 'left',
      // TO REFACT AS UTILITY
      renderCell: (params: GridRenderCellParams) => {
        const euro = params.value / 100;
        return new Intl.NumberFormat('it-IT', {
          style: 'currency',
          currency: 'EUR'
        }).format(euro);
      }
    },
    { field: 'debtPositionTypeOrgDescription', headerName: t('commons.duetype'), flex: 1, type: 'string' },
    { field: 'paymentDateTime', headerName: t('commons.paymentdate'), flex: 1, type: 'string', 
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
      renderCell: (params: GridRenderCellParams<SearchResultDataRow>) => 
        <ActionMenu 
          rowId={params.row.id}
          menuItems={[
            {
              icon: <ReadMore fontSize="small" />,
              label: t('commons.detail'),
              action: () => navigate(generatePath(PageRoutes.DETAIL_FLOWS, {category: 'receipt'}))
            },
            {
              icon: <FileDownload fontSize="small" />,
              label: t('commons.files.download'),
              action: () => console.log('Scarica file per ID: ', params.row.id),
            }
          ]}
        />,
    },
  ];

  return (
    <>
      <CustomDataGrid
        columns={columns}
        customPagination={{
          totalPages: data?.totalPages,
          defaultPageOption: appliedFilters.size,
          sizePageOptions: [5, 10, 15, 20],
          onPageChange: (page) => updatePagination({ page: page - 1, size: appliedFilters.size }),
          onPageSizeChange: (size) => updatePagination({ size, page: 0 }),
          currentPage: appliedFilters.page + 1
        }}
        disableColumnMenu
        disableColumnResize
        getRowId={(row) => row.receiptId}
        onSortModelChange={handleSortModelChange}
        rows={data?.content || []}
        sortModel={sortModel}
      />
    </>
  );
};

export default SearchResultsDataGrid;
