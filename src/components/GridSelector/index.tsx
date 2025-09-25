import { Box, Button, Alert } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import {
  GridColDef,
  GridRowId,
  GridRowParams,
  GridRowSelectionModel,
  GridValidRowModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { CopyAll } from '@mui/icons-material';
import { useMemo } from 'react';
import CustomDataGrid from '../DataGrid/CustomDataGrid';

export type GridSelectorProps<
  T extends GridValidRowModel,
  K extends GridRowId
> = {
  // Data and display
  data: Array<T>;
  columns: Array<GridColDef>;
  getRowId: (row: T) => K;
  getDisplayName?: (row: T) => string;

  // Selection state
  selectedIds: Array<K>;
  onSelectionChange: (selectedIds: Array<K>) => void;

  // Initial selection and filtering
  isRowSelectable?: (params: GridRowParams<T>) => boolean;
  defaultSelection?: Array<K>;

  // Visibility and behavior
  show: boolean;
  showClearButton?: boolean;
  showSelectedAlert?: boolean;

  // Custom labels
  clearButtonLabel?: string;
  selectedCountLabel?: (count: number) => string;

  // Data grid props
  totalPages?: number;
  loading?: boolean;

  // Lifecycle hooks
  onDataLoaded?: (data: Array<T>) => void;
};

export const GridSelector = <T extends GridValidRowModel, K extends GridRowId>({
  data,
  columns,
  getRowId,
  onSelectionChange,
  isRowSelectable,
  defaultSelection,
  show,
  selectedIds,
  showClearButton = true,
  showSelectedAlert = true,
  clearButtonLabel,
  selectedCountLabel,
  totalPages = 1,
  loading = false
}: GridSelectorProps<T, K>) => {
  const { t } = useTranslation();

  // Process data to ensure consistent row structure
  const processedData = useMemo(() => {
    if (!data) return [];
    return data.map((row) => ({
      ...row,
      id: getRowId(row)
    }));
  }, [data, getRowId]);

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    onSelectionChange(newSelection as Array<K>);
  };

  const handleClearSelection = () => {
    if (defaultSelection) {
      onSelectionChange(defaultSelection);
    } else {
      onSelectionChange([]);
    }
  };

  // Default labels
  const defaultClearButtonLabel =
    clearButtonLabel || t('commons.deleteSelection');
  const defaultSelectedCountLabel =
    selectedCountLabel ||
    ((count: number) => t('commons.selectedOperator', { count }));

  if (!show) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      {showSelectedAlert && selectedIds.length > 0 && (
        <Alert
          severity="info"
          variant="outlined"
          sx={{ mb: 2 }}
          action={
            showClearButton ? (
              <Button size="large" onClick={handleClearSelection}>
                <CopyAll />
                {defaultClearButtonLabel}
              </Button>
            ) : undefined
          }
        >
          ({selectedIds.length}) {defaultSelectedCountLabel(selectedIds.length)}
        </Alert>
      )}

      <Box sx={{ bgcolor: theme.palette.grey[200], padding: 2 }}>
        <CustomDataGrid
          isRowSelectable={isRowSelectable}
          rows={processedData}
          columns={columns}
          getRowId={(row: T) => getRowId(row)}
          rowSelectionModel={selectedIds}
          disableColumnMenu
          disableColumnResize
          checkboxSelection
          hideFooterSelectedRowCount
          onRowSelectionModelChange={handleSelectionChange}
          totalPages={totalPages}
          loading={loading}
        />
      </Box>
    </Box>
  );
};
