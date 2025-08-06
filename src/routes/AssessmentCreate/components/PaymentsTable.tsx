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

// TODO: Type for row with added uniqueId until backend fixes duplicate IUDs
type PaymentRowWithUniqueId = PaidInstallmentDTO & {
  uniqueId: string;
  receiptId?: number;
};

export type PaymentsTableProps = {
  data?: PagedPaidInstallmentsDTO;
  onSelectionChange?: (selectedUniqueIds: Array<string>) => void;
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
  selectedUniqueIds?: Array<string>;
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
  selectedUniqueIds = [],
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
      onFiltersApplied?.(filters, { page: 1, size: 10 }, []);
    },
    onFilterValidationError,
    autoLoadOnMount
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

  // TODO: Add uniqueId to rows to handle duplicate IUDs
  const rowsWithUniqueId = useMemo(() => {
    const currentPage = tableData.number || 0;
    const currentSize = tableData.size || size;

    return (tableData.content || []).map((row, pageIndex) => {
      const absoluteIndex = currentPage * currentSize + pageIndex;
      return {
        ...row,
        uniqueId: `${row.iud || 'no-iud'}-${absoluteIndex}`
      };
    });
  }, [tableData.content, tableData.number, tableData.size, size]);

  // Map selected uniqueIds to row selection model
  const selectedRows: GridRowSelectionModel = useMemo(() => {
    if (!selectedUniqueIds || selectedUniqueIds.length === 0) return [];

    return rowsWithUniqueId
      .filter((row): row is PaymentRowWithUniqueId =>
        Boolean(row.uniqueId && selectedUniqueIds.includes(row.uniqueId))
      )
      .map((row) => row.uniqueId);
  }, [selectedUniqueIds, rowsWithUniqueId]);

  // Handle row selection change
  const handleRowSelectionChange = useCallback(
    (newSelection: GridRowSelectionModel) => {
      if (!onSelectionChange) return;

      const selectedIds = newSelection
        .map((uniqueId) => (typeof uniqueId === 'string' ? uniqueId : null))
        .filter((id): id is string => id !== null);

      onSelectionChange(selectedIds);
    },
    [onSelectionChange]
  );

  // Handle clicking detail icon button
  const handleDetailClick = useCallback(
    (row: PaymentRowWithUniqueId) => {
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
          rows={rowsWithUniqueId}
          columns={columns}
          getRowId={(row) => row.uniqueId}
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
