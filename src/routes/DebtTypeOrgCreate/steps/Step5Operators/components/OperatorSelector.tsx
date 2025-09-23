import { Box, Button, Alert } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import {
  GridColDef,
  GridRowParams,
  GridRowSelectionModel
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { CopyAll } from '@mui/icons-material';
import { useMemo, useEffect, useCallback, useState } from 'react';
import { DebtPositionTypeOrgOperatorDTO } from '../../../../../../generated/apiClient';
import CustomDataGrid from '../../../../../components/DataGrid/CustomDataGrid';
import { useFormContext } from 'react-hook-form';
import { DebtTypeOrgForm } from '../../../types';
import { OperatorsSelection } from '../../../../../../generated/data-contracts';
import { useStore } from '../../../../../store/GlobalStore';
import { useSearch } from '../../../../../hooks/useSearch';
import { getDebtPositionTypeOrgOperators } from '../../../../../api/debtPositionTypeOrgOperators';
import { useParams } from 'react-router';

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
  const [isInitialized, setIsInitialized] = useState(false);

  const { debtPositionTypeOrgId } = useParams<{
    debtPositionTypeOrgId: string;
  }>();

  const {
    state: { organizationId, userInfo }
  } = useStore();

  const defaultOperator = userInfo?.mappedExternalUserId;

  const { watch, setValue } = useFormContext<DebtTypeOrgForm>();

  const enabledOperators = watch('enabledOperators') || [];
  const operatorsSelection = watch('operatorsSelection');

  const query = getDebtPositionTypeOrgOperators(organizationId);

  const debtTypeOrgOperators = useSearch({
    filters: {
      debtPositionTypeOrgId: edit ? Number(debtPositionTypeOrgId) : undefined
    },
    query
  });

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

  useEffect(() => {
    if (debtTypeOrgOperators.query?.data && !isInitialized) {
      if (edit) {
        const enabledFromApi = operators
          .filter((op) => op.enabled)
          .map((op) => op.id);
        setValue('enabledOperators', enabledFromApi);
        setValue('operatorsSelection', OperatorsSelection.SELECTED);
      } else if (defaultOperator) {
        setValue('enabledOperators', [defaultOperator]);
      }
      setIsInitialized(true);
    }
  }, [
    debtTypeOrgOperators.query?.data,
    operators,
    edit,
    defaultOperator,
    setValue,
    isInitialized
  ]);

  const isRowSelectable = (params: GridRowParams) => {
    return String(params.id) !== defaultOperator;
  };

  const currentPageRows = useMemo(() => {
    return operators.map((op) => ({
      id: op.id
    }));
  }, [operators]);

  const currentPageSelectedIds = useMemo(() => {
    if (!enabledOperators || enabledOperators.length === 0) return [];
    if (currentPageRows.length === 0) return [];

    const currentPageIds = new Set(currentPageRows.map((row) => row.id));

    return enabledOperators.filter((opId) => currentPageIds.has(opId));
  }, [enabledOperators, currentPageRows]);

  const handleSelectionChange = useCallback(
    (newSelectedIds: Array<string>) => {
      const currentPageIds = currentPageRows.map((row) => row.id);

      const otherPagesSelections = enabledOperators.filter(
        (opId) => !currentPageIds.includes(opId)
      );

      const updatedEnabled = [...otherPagesSelections, ...newSelectedIds];

      setValue('enabledOperators', updatedEnabled);

      const newlyDisabled = enabledOperators.filter(
        (opId) =>
          currentPageIds.includes(opId) && !newSelectedIds.includes(opId)
      );

      const currentDisabled = watch('disabledOperators') || [];
      const updatedDisabled = [
        ...currentDisabled.filter((opId) => !currentPageIds.includes(opId)),
        ...newlyDisabled
      ].filter((opId) => !newSelectedIds.includes(opId));

      setValue('disabledOperators', updatedDisabled);
    },
    [enabledOperators, currentPageRows, setValue, watch]
  );

  const handleRowSelectionChange = useCallback(
    (newSelection: GridRowSelectionModel) => {
      const selectedIds = newSelection
        .map((id) => (typeof id === 'string' ? id : null))
        .filter((id): id is string => id !== null);

      handleSelectionChange(selectedIds);
    },
    [handleSelectionChange]
  );

  const handleClearSelection = useCallback(() => {
    setValue('enabledOperators', []);
    setValue('disabledOperators', []);
  }, [setValue]);

  const columns: Array<GridColDef> = [
    {
      field: 'operator',
      headerName: t('commons.operator'),
      flex: 1,
      type: 'string',
      sortable: true
    }
  ];

  const totalSelected = enabledOperators.length;
  const currentPageSelected = currentPageSelectedIds.length;

  return operatorsSelection === OperatorsSelection.SELECTED ? (
    <Box sx={{ mt: 2 }}>
      {totalSelected > 0 && (
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
          <Box component="span" sx={{ fontWeight: 'medium' }}>
            ({totalSelected}){' '}
            {t('commons.selectedOperator', { count: totalSelected })}
            {totalSelected > currentPageSelected && (
              <Box
                component="span"
                sx={{ fontStyle: 'italic', ml: 1, color: 'text.secondary' }}
              >
                ({currentPageSelected} {t('commons.inThisPage')})
              </Box>
            )}
          </Box>
        </Alert>
      )}

      <Box sx={{ bgcolor: theme.palette.grey[200], padding: 2 }}>
        <CustomDataGrid
          isRowSelectable={isRowSelectable}
          rows={operators}
          columns={columns}
          getRowId={(row: OperatorData) => row.id}
          disableColumnMenu
          disableColumnResize
          checkboxSelection
          rowSelectionModel={currentPageSelectedIds}
          hideFooterSelectedRowCount
          onRowSelectionModelChange={handleRowSelectionChange}
          totalPages={debtTypeOrgOperators.query?.data?.totalPages || 1}
        />
      </Box>
    </Box>
  ) : null;
};
