import { Box, Button, Alert } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import {
  GridColDef,
  GridRowParams,
  GridRowSelectionModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { CopyAll } from '@mui/icons-material';
import { useMemo, useEffect } from 'react';
import { DebtPositionTypeOrgOperatorDTO } from '../../../../../../generated/apiClient';
import CustomDataGrid from '../../../../../components/DataGrid/CustomDataGrid';
import { useFormContext } from 'react-hook-form';
import { DebtTypeOrgForm } from '../../../types';
import { OperatorsSelection } from '../../../../../../generated/data-contracts';
import { useStore } from '../../../../../store/GlobalStore';
import { useDebtTypeOrgId } from '../../../../../hooks/useDebtTypeOrgId';
import { useSearch } from '../../../../../hooks/useSearch';
import { getDebtPositionTypeOrgOperators } from '../../../../../api/debtPositionTypeOrgOperators';

type OperatorData = {
  id: string;
  operator: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  mappedExternalUserId?: string;
};

export const OperatorSelector = ({ edit }: { edit?: boolean }) => {
  const { t } = useTranslation();

  const {
    state: { organizationId, userInfo }
  } = useStore();

  const defaultOperator = userInfo?.mappedExternalUserId;

  const debtPositionTypeOrgId = useDebtTypeOrgId();

  const { watch, setValue } = useFormContext<DebtTypeOrgForm>();

  const enabledOperators = watch('enabledOperators');
  const disabledOperators = watch('disabledOperators');
  const operatorsSelection = watch('operatorsSelection');

  const onSelectionChange = (selection: Array<string>) => {
    // Default to empty arrays if undefined
    const currentEnabled = enabledOperators ?? [];
    const currentDisabled = disabledOperators ?? [];

    // Find newly enabled (added) and newly disabled (removed) operators
    const added = selection.filter((op) => !currentEnabled.includes(op));
    const removed = currentEnabled.filter((op) => !selection.includes(op));

    // Update enabledOperators: Add new, remove removed
    const newEnabled = [
      ...currentEnabled.filter((op) => !removed.includes(op)),
      ...added
    ];

    // Update disabledOperators: Add removed, remove added
    const newDisabled = [
      ...currentDisabled.filter((op) => !added.includes(op)),
      ...removed
    ];

    setValue('enabledOperators', newEnabled);
    setValue('disabledOperators', newDisabled);
  };

  const query = getDebtPositionTypeOrgOperators(
    organizationId
  );

  const debtTypeOrgOperators = useSearch({
    filters: {},
    query
  });

  const isRowSelectable = (params: GridRowParams) => {
    // Coerce id to string for comparison, since defaultOperator is string
    return String(params.id) !== defaultOperator;
  };

  useEffect(() => {
    if (debtTypeOrgOperators.query?.data) {
      onSelectionChange(
        operators.filter((op) => op.enabled).map((op) => op.id)
      );

      if (edit) {
        setValue('operatorsSelection', OperatorsSelection.SELECTED);
      } else if (defaultOperator) {
        setValue('enabledOperators', [defaultOperator]);
      }
    }
  }, [debtTypeOrgOperators.query?.data]);

  const operators: Array<OperatorData> = useMemo(() => {
    if (!debtTypeOrgOperators.query?.data?.content) return [];

    return debtTypeOrgOperators.query?.data?.content.map(
      (operator: DebtPositionTypeOrgOperatorDTO) => ({
        ...operator,
        id: operator.mappedExternalUserId || operator.operatorId || '',
        operator:
          `${operator.firstName || ''} ${operator.lastName || ''}`.trim() ||
          operator.mappedExternalUserId ||
          operator.operatorId ||
          'N/A'
      })
    );
  }, [debtTypeOrgOperators.query?.data]);

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    onSelectionChange(newSelection as Array<string>);
  };

  const handleClearSelection = () => {
    onSelectionChange([]);
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

  const selectedCount = enabledOperators?.length;

  return operatorsSelection == OperatorsSelection.SELECTED ? (
    <Box sx={{ mt: 2 }}>
      {selectedCount ? (
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
          ({selectedCount}){' '}
          {t('commons.selectedOperator', { count: selectedCount })}
        </Alert>
      ) : null}

      <Box sx={{ bgcolor: theme.palette.grey[200], padding: 2 }}>
        <CustomDataGrid
          isRowSelectable={isRowSelectable}
          rows={operators}
          columns={columns}
          getRowId={(row: OperatorData) => row.id}
          disableColumnMenu
          disableColumnResize
          checkboxSelection
          rowSelectionModel={enabledOperators}
          hideFooterSelectedRowCount
          onRowSelectionModelChange={handleSelectionChange}
          totalPages={debtTypeOrgOperators.query?.data?.totalPages || 1}
        />
      </Box>
    </Box>
  ) : null;
};
