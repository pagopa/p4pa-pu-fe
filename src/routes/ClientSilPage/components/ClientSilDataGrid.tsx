import {
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
  GridValidRowModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from '@mui/icons-material';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import type {
  ClientDTOPage,
  ClientNoSecretDTO
} from '../../../../generated/apiClient';

type ClientSilDataRow = ClientNoSecretDTO & GridValidRowModel;

export type ClientSilDataGridProps = {
  data: ClientDTOPage | undefined;
  loading?: boolean;
  onSortChange?: (model: GridSortModel) => void;
  sortModel?: GridSortModel;
  onPaginationChange?: (pagination: { page: number; size: number }) => void;
  onRowClick?: (row: ClientNoSecretDTO) => void;
};

/**
 * DataGrid component for the visualization of Client SIL
 */
export const ClientSilDataGrid = ({
  data,
  loading = false,
  onSortChange,
  sortModel = [],
  onPaginationChange,
  onRowClick
}: ClientSilDataGridProps) => {
  const { t } = useTranslation();

  const handleRowClick = (row: ClientNoSecretDTO) => {
    if (onRowClick) {
      onRowClick(row);
    } else {
      console.log(`Navigate to client detail: ${row.clientId}`);
    }
  };

  const columns: Array<GridColDef> = [
    {
      field: 'clientName',
      headerName: t('clientSil.table.clientName'),
      flex: 2,
      type: 'string',
      sortable: true
    },
    {
      field: 'clientId',
      headerName: t('clientSil.table.clientId'),
      flex: 2,
      type: 'string',
      sortable: true
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<ClientSilDataRow>) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            height: '100%',
            width: '100%'
          }}
        >
          <ChevronRight
            color="primary"
            style={{ cursor: 'pointer' }}
            onClick={() => handleRowClick(params.row)}
          />
        </div>
      )
    }
  ];

  return (
    <CustomDataGrid
      rows={data?.content ?? []}
      getRowId={(row) => row.clientId}
      columns={columns}
      loading={loading}
      disableColumnMenu
      disableColumnResize
      sortModel={sortModel}
      onSortModelChange={onSortChange}
      smartPagination={{
        initialPage: 0,
        initialSize: 10,
        sizeOptions: [5, 10, 20],
        backendData: {
          totalElements: data?.totalElements,
          totalPages: data?.totalPages,
          number: data?.pageNo,
          size: data?.pageSize
        },
        onPaginationChange: onPaginationChange
      }}
    />
  );
};

export default ClientSilDataGrid;
