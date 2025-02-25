import { GridColDef, GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { FileDownload, Visibility } from '@mui/icons-material';
import { generatePath, useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../../App';
import ActionMenu from '../../../components/ActionMenu/ActionMenu';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import Chip, { ChipProps } from '@mui/material/Chip';

interface ResultDataRow extends GridValidRowModel {
  id: number;
  description: string;
  debtType: string;
  creationDate: string;
  status: string;
}

export const DataGrid = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const rows: ResultDataRow[] = [
    {
      id: 1,
      description: 'Pagamento Tari 2025',
      debtType: 'TARI',
      creationDate: '12/02/2025',
      status: 'TO_PAY'
    }
  ];

  const stateColors: Record<string, ChipProps['color']> = {
    TO_PAY: 'info',
    ERROR: 'error'
  };

  const columns: GridColDef[] = [
    {
      field: 'description',
      headerName: t('DebtPositions.Results.table.description'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'debtType',
      headerName: t('DebtPositions.Results.table.debtType'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'creationDate',
      headerName: t('DebtPositions.Results.table.creationDate'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'status',
      headerName: t('DebtPositions.Results.table.status'),
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams<ResultDataRow>) => (
        <Chip
          label={t(`DebtPositions.Results.status.${params.value}`)}
          title={t(params.value)}
          color={stateColors[params.value]}
          size="small"
        />
      )
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<ResultDataRow>) => (
        <ActionMenu
          rowId={params.row.id}
          menuItems={[
            {
              icon: <Visibility fontSize="small" />,
              label: t('commons.view'),
              action: () =>
                navigate(generatePath(PageRoutes.REPORTING_DETAIL, { id: params.row.idReporting }))
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
    <CustomDataGrid
      rows={rows}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      customPagination={{
        totalPages: 10
      }}
    />
  );
};
