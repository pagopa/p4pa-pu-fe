import { useEffect, useMemo, useCallback } from 'react';
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
import { generatePath } from 'react-router';
import { PageRoutes } from '../..';
import { useHashParamsListener } from '../../../hooks/useHashParamsListener';

// Payment row type with additional fields for table display
type PaymentRow = PaidInstallmentDTO & {
  receiptId?: number;
};

export type PaymentsTableProps = {
  data?: PagedPaidInstallmentsDTO;
  onSelectionChange?: (selectedIuds: Array<string>) => void;
  onFiltersApplied?: (
    filters: PaymentsUIFilters,
    pagination: { page: number; size: number },
    sort?: Array<string>
  ) => void;
  onFilterValidationError?: (hasError: boolean) => void;
  initialFilters?: PaymentsUIFilters;
  isLoading?: boolean;
  isApiCallPending?: boolean;
  disabled?: boolean;
  autoLoadOnMount?: boolean;
  selectedIuds?: Array<string>;
  isRemoveMode?: boolean;
};

export const PaymentsTable = ({
  data,
  onSelectionChange,
  onFiltersApplied,
  onFilterValidationError,
  initialFilters = {},
  isLoading = false,
  isApiCallPending = false,
  disabled = false,
  autoLoadOnMount = true,
  selectedIuds = [],
  isRemoveMode = false
}: PaymentsTableProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Listen to hash parameters
  const {
    page: pageStr,
    size: sizeStr,
    sortDirection,
    sortField
  } = useHashParamsListener() as {
    page: number;
    size: number;
    sortDirection: string;
    sortField: string;
  };

  const page = pageStr ? Number(pageStr) : 1;
  const size = sizeStr ? Number(sizeStr) : 10;

  const sort = useMemo(
    () => (sortDirection && sortField ? [`${sortField},${sortDirection}`] : []),
    [sortDirection, sortField]
  );

  const {
    draftFilters,
    updateDraftFilters,
    applyFilters,
    handleDateFromChange,
    handleDateToChange,
    hasValidFilters
  } = usePaymentsTableFilters({
    initialFilters,
    onFiltersChange: (filters) => {
      onFiltersApplied?.(filters, { page: 0, size: 10 }, []);
    },
    onFilterValidationError,
    autoLoadOnMount,
    isRemoveMode
  });

  // Call onFiltersApplied when pagination, sorting, or filters change
  useEffect(() => {
    if (onFiltersApplied && hasValidFilters) {
      // Page for API/backend zero-based
      onFiltersApplied(draftFilters, { page: page - 1, size }, sort);
    }
  }, [page, size, sort]);

  // Prepare table data with fallback defaults
  const tableData = data || {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size
  };

  // Use API data directly with unique IUDs
  const tableRows = useMemo(() => {
    const rows = tableData.content || [];

    return rows;
  }, [tableData.content]);

  // Map selected IUDs to row selection model
  const selectedRows: GridRowSelectionModel = useMemo(() => {
    if (!selectedIuds || selectedIuds.length === 0) return [];
    if (tableRows.length === 0) return [];

    // Create a Set for faster lookup
    const tableIuds = new Set(tableRows.map((row) => row.iud).filter(Boolean));

    // Filter selectedIuds to only include those present in current page
    return selectedIuds.filter((iud) => tableIuds.has(iud));
  }, [selectedIuds, tableRows]);

  // Handle row selection change - newSelection contains IUDs directly
  const handleRowSelectionChange = useCallback(
    (newSelection: GridRowSelectionModel) => {
      if (!onSelectionChange) return;

      // Filter to ensure we only get valid string IUDs
      const selectedIuds = newSelection
        .map((iud) => (typeof iud === 'string' ? iud : null))
        .filter((iud): iud is string => iud !== null);

      onSelectionChange(selectedIuds);
    },
    [onSelectionChange]
  );

  // Handle clicking detail icon button
  const handleDetailClick = useCallback(
    (row: PaymentRow) => {
      const detailPath = generatePath(PageRoutes.TELEMATIC_RECEIPT_DETAIL, {
        id: isRemoveMode
          ? Number(row.receiptId)
          : Number(row.receiptPaymentRequestId)
      });
      const fullUrl = `${window.location.origin}${detailPath}`;
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    },
    [isRemoveMode]
  );

  const combinedLoading = useMemo(
    () => isLoading || isApiCallPending,
    [isLoading, isApiCallPending]
  );

  // Define columns with translations and formatting
  const columns: Array<GridColDef> = useMemo(
    () => [
      {
        field: 'iuv',
        headerName: t('commons.iuv') ?? 'IUV',
        flex: 1,
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
        field: 'paymentDateTime',
        headerName: t('commons.paymentdate'),
        flex: 1,
        type: 'string',
        renderCell: (params) =>
          params.value ? new Date(params.value).toLocaleDateString('it-IT') : ''
      },
      {
        field: 'receiptCreationDate',
        headerName: t('commons.lastUpdate'),
        flex: 1,
        type: 'string',
        renderCell: (params) =>
          params.value ? new Date(params.value).toLocaleDateString('it-IT') : ''
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
    ],
    [t, theme.palette.primary.main, handleDetailClick]
  );

  return (
    <Box>
      <FilterContainer
        items={[
          {
            type: COMPONENT_TYPE.textField,
            label: `${t('commons.search')} ${t('commons.iuv')}`,
            value: draftFilters.iuv || '',
            onChange: (e) => updateDraftFilters({ iuv: e.target.value }),
            adornment: <Search />,
            gridWidth: 5
          },
          {
            type: COMPONENT_TYPE.dateRange,
            label: 'dateRange',
            gridWidth: 5,
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
            type: COMPONENT_TYPE.button,
            label: t('commons.search'),
            onClick: applyFilters,
            disabled,
            gridWidth: 2
          }
        ]}
      />

      <Box sx={{ bgcolor: theme.palette.grey[200], padding: 2, mt: 2 }}>
        <CustomDataGrid
          rows={tableRows}
          columns={columns}
          getRowId={(row) => row.iud}
          disableColumnMenu
          disableColumnResize
          checkboxSelection
          hideFooterSelectedRowCount
          rowSelectionModel={selectedRows}
          totalPages={data?.totalPages ?? 1}
          onRowSelectionModelChange={handleRowSelectionChange}
          localeText={{ noRowsLabel: t('flowDataGrid.noDataRows') }}
          loading={combinedLoading}
          disableVirtualization={true}
        />
      </Box>
    </Box>
  );
};
