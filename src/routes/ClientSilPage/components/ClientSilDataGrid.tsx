import {
  GridColDef,
  GridRenderCellParams,
  GridValidRowModel
} from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
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
  onRowClick?: (row: ClientNoSecretDTO) => void;
};

/**
 * DataGrid component for the visualization of Client SIL
 */
export const ClientSilDataGrid = ({
  data,
  loading = false,
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
        <IconButton
          aria-label={t('commons.detail')}
          onClick={() => handleRowClick(params.row)}
          data-testid={params.row.clientId}
        >
          <ChevronRight color="primary" />
        </IconButton>
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
      totalPages={data?.totalPages || 1}
    />
  );
};

export default ClientSilDataGrid;
