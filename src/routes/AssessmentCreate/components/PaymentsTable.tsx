import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { Box, useTheme, IconButton } from '@mui/material';
import { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import FilterContainer, {
  COMPONENT_TYPE
} from '../../../components/FilterContainer/FilterContainer';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import { moneyFormat } from '../../../utils/formatters';
import {
  PagedPaidInstallmentsDTO,
  PaymentsUIFilters,
  PaidInstallmentDTO
} from '../../../api/classifications/paidInstallments/mappings';
import { usePaymentsTableFilters } from '../../../hooks/usePaymentsTableFilters';

// TEMPORARY: Type for row with added uniqueId until backend fixes duplicate IUDs
type PaymentRowWithUniqueId = PaidInstallmentDTO & {
  uniqueId: string;
};

export type PaymentsTableProps = {
  data?: PagedPaidInstallmentsDTO;
  // TEMPORARY: When IUDs are unique, it will become:
  // onSelectionChange?: (selectedIuds: Array<string>) => void;
  onSelectionChange?: (selectedUniqueIds: Array<string>) => void;
  onFiltersApplied?: (
    filters: PaymentsUIFilters,
    pagination: { page: number; size: number },
    sortParams?: Array<string>
  ) => void;
  onFilterValidationError?: (hasError: boolean) => void;
  initialFilters?: PaymentsUIFilters;
  isLoading?: boolean;
  disabled?: boolean;
  autoLoadOnMount?: boolean;
  // TEMPORARY: When IUDs are unique, it will become:
  // selectedIuds?: Array<string>;
  selectedUniqueIds?: Array<string>;
};

export const PaymentsTable = ({
  data,
  onSelectionChange,
  onFiltersApplied,
  onFilterValidationError,
  initialFilters = {},
  isLoading = false,
  disabled = false,
  autoLoadOnMount = true,
  selectedUniqueIds = []
}: PaymentsTableProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Hook for managing filters and sorting
  const {
    appliedFilters,
    draftFilters,
    sortModel,
    updateDraftFilters,
    applyFilters,
    handleSortModelChange,
    handleDateFromChange,
    handleDateToChange,
    handleUpdateDateFromChange,
    handleUpdateDateToChange
  } = usePaymentsTableFilters({
    initialFilters,
    onFiltersChange: onFiltersApplied,
    onFilterValidationError,
    autoLoadOnMount
  });

  const tableData = data || {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10
  };

  // TODO: TEMPORARY SOLUTION - Add unique index to handle duplicate rows
  // The backend currently can return multiple rows with the same IUD, causing React warnings
  // for duplicate keys. This solution adds a uniqueId based on ABSOLUTE index to guarantee
  // uniqueness and stability across page changes until the backend is modified.
  // Once resolved on backend side, remove this logic and use row.iud directly
  // FUTURE MIGRATION:
  // - Remove rowsWithUniqueId completely
  // - Use rows={tableData.content} directly
  // - Change getRowId={(row) => row.iud}
  const rowsWithUniqueId = useMemo(() => {
    const currentPage = tableData.number || 0;
    const currentSize = tableData.size || 10;

    return (tableData.content || []).map((row, pageIndex) => {
      // Calculate stable absolute index identical to Step2Payments
      const absoluteIndex = currentPage * currentSize + pageIndex;
      return {
        ...row,
        uniqueId: `${row.iud || 'no-iud'}-${absoluteIndex}`
      };
    });
  }, [tableData.content, tableData.number, tableData.size]);

  // Calculate selectedRows based on global selection
  const selectedRows: GridRowSelectionModel = useMemo(() => {
    if (!selectedUniqueIds || selectedUniqueIds.length === 0) {
      return [];
    }

    // Map selected uniqueIds to uniqueIds for current page
    const result = rowsWithUniqueId
      .filter((row) => {
        const shouldSelect =
          row.uniqueId && selectedUniqueIds.includes(row.uniqueId);
        return shouldSelect;
      })
      .map((row) => {
        return row.uniqueId;
      });

    return result;
  }, [selectedUniqueIds, rowsWithUniqueId, tableData.number, tableData.size]);

  // Handler for row selection - passes uniqueId directly
  const handleRowSelectionChange = useCallback(
    (newSelection: GridRowSelectionModel) => {
      if (!onSelectionChange) return;

      // Pass uniqueId directly without conversion to IUD
      const selectedUniqueIds = newSelection
        .map((uniqueId) => {
          // Type guard for string
          if (typeof uniqueId !== 'string') return null;
          return uniqueId;
        })
        .filter((uniqueId): uniqueId is string => uniqueId !== null);

      onSelectionChange(selectedUniqueIds);
    },
    [onSelectionChange]
  );

  const handlePaginationChange = useCallback(
    (pagination: { page: number; size: number }) => {
      if (onFiltersApplied) {
        const sortParams =
          sortModel.length > 0
            ? [`${sortModel[0].field},${sortModel[0].sort}`]
            : undefined;

        onFiltersApplied(appliedFilters, pagination, sortParams);
      }
    },
    [
      onFiltersApplied,
      appliedFilters,
      sortModel,
      tableData.number,
      tableData.size,
      tableData.totalElements
    ]
  );

  const handleDetailClick = useCallback((row: PaymentRowWithUniqueId) => {
    console.log('Detail clicked for:', row);
    // TODO: Navigate to detail page when implemented
  }, []);

  const columns: Array<GridColDef> = [
    {
      field: 'iuv',
      headerName: t('commons.iuv') || 'IUV',
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
            label: t('commons.search') + ' ' + t('commons.iuv'),
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
            label: 'updateDateRange',
            gridWidth: 5,
            from: {
              label: t('commons.updatedFrom'),
              value: draftFilters.updateDateFrom,
              onChange: handleUpdateDateFromChange
            },
            to: {
              label: t('commons.dateTo'),
              value: draftFilters.updateDateTo,
              onChange: handleUpdateDateToChange
            }
          },
          {
            type: COMPONENT_TYPE.button,
            label: t('commons.search'),
            onClick: applyFilters,
            disabled: disabled,
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
        {/* DataGrid now synchronized with global selection */}
        {/* TODO: TEMPORARY SOLUTION - DataGrid with modified rows and custom getRowId
            When backend is fixed to avoid duplicate IUDs:
            - use rows={tableData.content}
            - use getRowId={(row) => row.iud} */}
        <CustomDataGrid
          rows={rowsWithUniqueId} // TEMPORARY: rows with artificial uniqueIds
          columns={columns}
          getRowId={(row) => row.uniqueId} // TEMPORARY: artificial key
          disableColumnMenu
          disableColumnResize
          checkboxSelection
          hideFooterSelectedRowCount
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
          disableVirtualization={true}
        />
      </Box>
    </Box>
  );
};
