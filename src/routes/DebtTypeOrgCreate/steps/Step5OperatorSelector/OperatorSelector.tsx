import { Box, Button, Alert } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import CustomDataGrid from '../../../../components/DataGrid/CustomDataGrid';
import {
  GridColDef,
  GridRowSelectionModel,
  GridSortModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { CopyAll } from '@mui/icons-material';
import { useState, useEffect, useMemo } from 'react';
import { getDebtPositionTypeOrgOperators } from '../../../../api/debtPositionTypeOrgOperators';
import { DebtPositionTypeOrgOperatorDTO } from '../../../../../generated/data-contracts';

type OperatorData = {
  id: string;
  operator: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  mappedExternalUserId?: string;
};

type OperatorSelectorProps = {
  organizationId: number;
  debtPositionTypeOrgId?: number;
  onSelectionChange: (enabledOperators: Array<string>) => void;
  enabledOperators: Array<string>;
};

const OperatorSelector = ({
  organizationId,
  debtPositionTypeOrgId,
  onSelectionChange,
  enabledOperators
}: OperatorSelectorProps) => {
  const { t } = useTranslation();
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>(enabledOperators);

  const [appliedFilters, setAppliedFilters] = useState({
    page: 0,
    size: 10
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const sortArray = useMemo(() => {
    if (sortModel.length === 0) return undefined;
    return sortModel.map((sort) => `${sort.field},${sort.sort}`);
  }, [sortModel]);

  const { data: apiResponse } = getDebtPositionTypeOrgOperators(
    organizationId,
    {
      debtPositionTypeOrgId,
      page: appliedFilters.page,
      size: appliedFilters.size,
      ...(sortArray && { sort: sortArray })
    }
  );

  const operators: Array<OperatorData> = useMemo(() => {
    if (!apiResponse?.content) return [];

    return apiResponse.content.map(
      (operator: DebtPositionTypeOrgOperatorDTO) => ({
        id: operator.mappedExternalUserId || operator.operatorId || '',
        operator:
          `${operator.firstName || ''} ${operator.lastName || ''}`.trim() ||
          operator.mappedExternalUserId ||
          operator.operatorId ||
          'N/A',
        firstName: operator.firstName,
        lastName: operator.lastName,
        enabled: operator.enabled,
        mappedExternalUserId: operator.mappedExternalUserId,
        operatorId: operator.operatorId
      })
    );
  }, [apiResponse]);

  useEffect(() => {
    setRowSelectionModel(enabledOperators);
  }, [enabledOperators]);

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    setRowSelectionModel(newSelection);
    onSelectionChange(newSelection as Array<string>);
  };

  const handleClearSelection = () => {
    setRowSelectionModel([]);
    onSelectionChange([]);
  };

  const handleSortModelChange = (model: GridSortModel) => {
    setSortModel(model);
  };

  const updatePagination = (params: { page?: number; size?: number }) => {
    setAppliedFilters((prev) => ({
      ...prev,
      ...params
    }));
  };

  const columns: Array<GridColDef> = [
    {
      field: 'operator',
      headerName: t('commons.operator'),
      flex: 1,
      type: 'string',
      sortable: true
    }
  ];

  const selectedCount = rowSelectionModel.length;

  return (
    <Box sx={{ mt: 2 }}>
      {selectedCount > 0 && (
        <Alert
          severity="info"
          variant="outlined"
          sx={{ mb: 2 }}
          action={
            <Button size="large" onClick={handleClearSelection}>
              <CopyAll />
              {t('commons.deleteSelection')}
            </Button>
          }
        >
          ({selectedCount}) {t('commons.selectedOperator')}
        </Alert>
      )}

      <Box sx={{ bgcolor: theme.palette.grey[200], padding: 2 }}>
        <CustomDataGrid
          rows={operators}
          columns={columns}
          getRowId={(row) => row.id}
          disableColumnMenu
          disableColumnResize
          checkboxSelection
          rowSelectionModel={rowSelectionModel}
          hideFooterSelectedRowCount
          onRowSelectionModelChange={handleSelectionChange}
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          customPagination={{
            totalPages: apiResponse?.totalPages || 0,
            defaultPageOption: appliedFilters.size,
            sizePageOptions: [5, 10, 15, 20],
            onPageChange: (page) =>
              updatePagination({
                page: page - 1,
                size: appliedFilters.size
              }),
            onPageSizeChange: (size) => updatePagination({ size, page: 0 }),
            currentPage: appliedFilters.page + 1
          }}
        />
      </Box>
    </Box>
  );
};

export default OperatorSelector;
