import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { Box, useTheme, IconButton } from '@mui/material';
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
import {
  PagedPaidInstallmentsDTO,
  PaidInstallmentsFilteredRequest
} from '../../../api/classifications/paidInstallments/mappings';

// Tipi per i filtri dei pagamenti
type PaymentsFilters = {
  iuv?: string;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  amountFrom?: number;
  amountTo?: number;
};

// Tipi importati dall'API dei paid installments

export type PaymentsTableProps = {
  onSelectionChange?: (selectedPayments: Array<string>) => void;
  disabled?: boolean;
  paymentsData?: PagedPaidInstallmentsDTO;
  isLoading?: boolean;
  onDataRefresh?: (
    params?: Partial<PaidInstallmentsFilteredRequest>
  ) => Promise<PagedPaidInstallmentsDTO>;
};

export const PaymentsTable = ({
  onSelectionChange,
  disabled = false,
  paymentsData,
  isLoading = false
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

  // Use data from props or fallback to empty data
  const tableData = paymentsData || {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10
  };

  // Update draft filters
  const updateDraftFilters = useCallback(
    (updates: Partial<PaymentsFilters>) => {
      setDraftFilters((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  // Apply filters
  const applyFilters = useCallback(() => {
    setFilterValues(draftFilters);
    setPaginationParams((prev) => ({ ...prev, page: 0 }));
  }, [draftFilters]);

  // Handle pagination
  const handlePaginationChange = (pagination: {
    page: number;
    size: number;
  }) => {
    setPaginationParams(pagination);
  };

  // Handle sorting
  const handleSortModelChange = (model: GridSortModel) => {
    setSortModel(model);
  };

  // Handle row selection
  const handleRowSelectionChange = (newSelection: GridRowSelectionModel) => {
    setSelectedRows(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection as Array<string>);
    }
  };

  // Handle date range
  const handleDateFromChange = (date: Date | null) => {
    updateDraftFilters({ dateFrom: date });
  };

  const handleDateToChange = (date: Date | null) => {
    updateDraftFilters({ dateTo: date });
  };

  // Check if the filters have changed
  const hasFilterChanges =
    JSON.stringify(draftFilters) !== JSON.stringify(filterValues);

  // Handle detail view action
  const handleDetailClick = useCallback((row: any) => {
    console.log('Detail clicked for:', row);
    // TODO: Navigate to detail page when implemented
  }, []);

  // Table column configuration
  const columns: Array<GridColDef> = [
    {
      field: 'iuv',
      headerName: 'IUV',
      flex: 1,
      type: 'string'
    },
    {
      field: 'amount',
      headerName: 'Importo',
      flex: 1,
      type: 'number',
      renderCell: (params) => moneyFormat(params.value)
    },
    {
      field: 'paymentDateTime',
      headerName: 'Data esito',
      flex: 1,
      type: 'string',
      renderCell: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString('it-IT');
      }
    },
    {
      field: 'updateDate',
      headerName: 'Ultimo aggiornamento',
      flex: 1,
      type: 'string',
      renderCell: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString('it-IT');
      }
    },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <IconButton
          onClick={() => handleDetailClick(params.row)}
          size="small"
          sx={{ color: theme.palette.primary.main }}
        >
          <OpenInNewIcon fontSize="small" />
        </IconButton>
      )
    }
  ];

  return (
    <Box>
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

      <Box
        sx={{
          bgcolor: theme.palette.grey[200],
          padding: 2,
          mt: 2
        }}
      >
        <CustomDataGrid
          rows={tableData.content || []}
          columns={columns}
          getRowId={(row) => row.iud}
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
              totalElements: tableData.totalElements,
              totalPages: tableData.totalPages,
              number: tableData.number,
              size: tableData.size
            },
            onPaginationChange: handlePaginationChange
          }}
          localeText={{ noRowsLabel: t('flowDataGrid.noDataRows') }}
          loading={isLoading}
        />
      </Box>
    </Box>
  );
};
