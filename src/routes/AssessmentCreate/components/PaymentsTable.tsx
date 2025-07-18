import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from '@mui/icons-material';
import { Box, useTheme } from '@mui/material';
import {
  GridColDef,
  GridSortModel,
  GridRowSelectionModel
} from '@mui/x-data-grid';
import FilterContainer, {
  COMPONENT_TYPE
} from '../../../components/FilterContainer/FilterContainer';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import { moneyFormat } from '../../../utils/formatters';

// Tipi per i filtri dei pagamenti
type PaymentsFilters = {
  iuv?: string;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  amountFrom?: number;
  amountTo?: number;
};

// Tipo temporaneo per i dati della tabella (da sostituire con i tipi API reali)
type PaymentData = {
  id: string;
  iuv: string;
  amount: number;
  date: string;
  status: string;
};

export type PaymentsTableProps = {
  onSelectionChange?: (selectedPayments: Array<string>) => void;
  disabled?: boolean;
};

export const PaymentsTable = ({
  onSelectionChange,
  disabled = false
}: PaymentsTableProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Stati per filtri e paginazione
  const [filterValues, setFilterValues] = useState<PaymentsFilters>({});
  const [draftFilters, setDraftFilters] = useState<PaymentsFilters>({});
  const [paginationParams, setPaginationParams] = useState({
    page: 0,
    size: 10
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);

  // Dati temporanei vuoti (da sostituire con chiamata API)
  const paymentsData = {
    content: [] as PaymentData[],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10
  };

  // Gestione aggiornamento filtri bozza
  const updateDraftFilters = useCallback(
    (updates: Partial<PaymentsFilters>) => {
      setDraftFilters((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  // Applicazione filtri
  const applyFilters = useCallback(() => {
    setFilterValues(draftFilters);
    setPaginationParams((prev) => ({ ...prev, page: 0 }));
  }, [draftFilters]);

  // Gestione paginazione
  const handlePaginationChange = (pagination: {
    page: number;
    size: number;
  }) => {
    setPaginationParams(pagination);
  };

  // Gestione ordinamento
  const handleSortModelChange = (model: GridSortModel) => {
    setSortModel(model);
  };

  // Gestione selezione righe
  const handleRowSelectionChange = (newSelection: GridRowSelectionModel) => {
    setSelectedRows(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection as Array<string>);
    }
  };

  // Gestione date range
  const handleDateFromChange = (date: Date | null) => {
    updateDraftFilters({ dateFrom: date });
  };

  const handleDateToChange = (date: Date | null) => {
    updateDraftFilters({ dateTo: date });
  };

  // Verifica se i filtri sono cambiati
  const hasFilterChanges =
    JSON.stringify(draftFilters) !== JSON.stringify(filterValues);

  // Configurazione colonne tabella
  const columns: Array<GridColDef> = [
    {
      field: 'iuv',
      headerName: t('commons.iuv'),
      flex: 1.5,
      type: 'string'
    },
    {
      field: 'amount',
      headerName: t('commons.amount'),
      flex: 1,
      type: 'number',
      renderCell: (params) => moneyFormat(params.value)
    },
    {
      field: 'date',
      headerName: t('commons.paymentdate'),
      flex: 1,
      type: 'string',
      renderCell: (params) => new Date(params.value).toLocaleDateString('it-IT')
    },
    {
      field: 'status',
      headerName: t('commons.status'),
      flex: 1,
      type: 'string'
    }
  ];

  return (
    <Box>
      {/* Filtri */}
      <FilterContainer
        items={[
          {
            type: COMPONENT_TYPE.textField,
            label: t('commons.search') + ' IUV',
            value: draftFilters.iuv || '',
            onChange: (e) => updateDraftFilters({ iuv: e.target.value }),
            adornment: <Search />,
            gridWidth: 2
          },
          {
            type: COMPONENT_TYPE.dateRange,
            label: 'dateRange',
            gridWidth: 4,
            from: {
              label: t('commons.outcomeFrom'),
              value: draftFilters.dateFrom,
              onChange: handleDateFromChange
            },
            to: {
              label: t('commons.dateTo'),
              value: draftFilters.dateTo,
              onChange: handleDateToChange
            }
          },
          {
            type: COMPONENT_TYPE.dateRange,
            label: 'dateRange2',
            gridWidth: 5,
            from: {
              label: t('commons.updatedFrom'),
              value: draftFilters.dateFrom,
              onChange: handleDateFromChange
            },
            to: {
              label: t('commons.dateTo'),
              value: draftFilters.dateTo,
              onChange: handleDateToChange
            }
          },
          {
            type: COMPONENT_TYPE.button,
            label: t('commons.search'),
            onClick: applyFilters,
            disabled: !hasFilterChanges || disabled,
            gridWidth: 1
          }
        ]}
      />

      {/* Tabella */}
      <Box
        sx={{
          bgcolor: theme.palette.grey[200],
          padding: 2,
          mt: 2
        }}
      >
        <CustomDataGrid
          rows={paymentsData.content}
          columns={columns}
          getRowId={(row) => row.id}
          disableColumnMenu
          disableColumnResize
          checkboxSelection
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={handleRowSelectionChange}
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          smartPagination={{
            initialPage: 0,
            initialSize: 10,
            sizeOptions: [5, 10, 20],
            backendData: {
              totalElements: paymentsData.totalElements,
              totalPages: paymentsData.totalPages,
              number: paymentsData.number,
              size: paymentsData.size
            },
            onPaginationChange: handlePaginationChange
          }}
          localeText={{ noRowsLabel: t('flowDataGrid.noDataRows') }}
          loading={false}
        />
      </Box>
    </Box>
  );
};
