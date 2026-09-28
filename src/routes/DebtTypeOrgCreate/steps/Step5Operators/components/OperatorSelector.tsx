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
import { DebtPositionTypeOrgOperatorDTO } from '../../../../../../generated/core/client';
import CustomDataGrid from '../../../../../components/DataGrid/CustomDataGrid';
import { useFormContext } from 'react-hook-form';
import { DebtTypeOrgForm } from '../../../types';
import { OperatorsSelection } from '../../../../../../generated/core/data-contracts';
import { useStore } from '../../../../../store/GlobalStore';
import { useSearch } from '../../../../../hooks/useSearch';
import { getDebtPositionTypeOrgOperators } from '../../../../../api/debtPositionTypeOrgOperators';
import { useParams } from 'react-router';

const getOperatorId = (operator: DebtPositionTypeOrgOperatorDTO) =>
  operator.mappedExternalUserId || operator.operatorId || '';

const getUniqueOperatorIds = (operatorIds: Array<string>) =>
  Array.from(new Set(operatorIds.filter(Boolean)));

const areOperatorIdsEqual = (
  currentOperatorIds: Array<string>,
  nextOperatorIds: Array<string>
) =>
  currentOperatorIds.length === nextOperatorIds.length &&
  currentOperatorIds.every(
    (operatorId, index) => operatorId === nextOperatorIds[index]
  );

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
  const disabledOperators = watch('disabledOperators') || [];
  const operatorsSelection = watch('operatorsSelection');

  const query = getDebtPositionTypeOrgOperators(organizationId);

  // On a browser reload the route param can resolve on a later render than
  // this component's mount, so guard against sending NaN/undefined ids.
  const parsedDebtPositionTypeOrgId = Number(debtPositionTypeOrgId);
  const isValidDebtPositionTypeOrgId =
    !!debtPositionTypeOrgId && !Number.isNaN(parsedDebtPositionTypeOrgId);

  const debtTypeOrgOperators = useSearch({
    filters: {
      debtPositionTypeOrgId:
        edit && isValidDebtPositionTypeOrgId
          ? parsedDebtPositionTypeOrgId
          : undefined
    },
    query
  });

  const operators: Array<DebtPositionTypeOrgOperatorDTO> = useMemo(() => {
    if (!debtTypeOrgOperators.query?.data?.content) return [];

    return debtTypeOrgOperators.query?.data?.content;
  }, [debtTypeOrgOperators.query?.data]);

  // Track only the ids currently rendered by the grid so selection updates can
  // merge the visible page with selections preserved from other server pages.
  const operatorIdsInCurrentPage = useMemo(
    () => operators.map(getOperatorId).filter(Boolean),
    [operators]
  );

  // The DataGrid must only receive ids that exist in the current page rows;
  // full cross-page selection remains stored in the form state.
  const selectedOperatorsInCurrentPage = useMemo(
    () =>
      enabledOperators.filter((operatorId) =>
        operatorIdsInCurrentPage.includes(operatorId)
      ),
    [enabledOperators, operatorIdsInCurrentPage]
  );

  // Force a remount when the server page changes so MUI drops any internal row
  // references from the previous page and does not raise MissingRowIdError.
  const gridKey = useMemo(
    () =>
      `${debtTypeOrgOperators.query?.data?.number ?? 0}-${operatorIdsInCurrentPage.join('|')}`,
    [debtTypeOrgOperators.query?.data?.number, operatorIdsInCurrentPage]
  );

  useEffect(() => {
    if (!debtTypeOrgOperators.query?.data) {
      return;
    }

    if (edit) {
      // In edit mode each fetched page may contain operators already enabled on
      // the server. Merge them into the persisted selection unless the user has
      // explicitly disabled them in this session.
      const enabledFromApi = operators
        .filter((op) => op.enabled)
        .map(getOperatorId);
      const nextEnabledOperators = getUniqueOperatorIds([
        ...enabledOperators,
        ...enabledFromApi.filter(
          (operatorId) => !disabledOperators.includes(operatorId)
        )
      ]);

      if (!areOperatorIdsEqual(enabledOperators, nextEnabledOperators)) {
        setValue('enabledOperators', nextEnabledOperators);
      }

      if (!isInitialized) {
        setValue('operatorsSelection', OperatorsSelection.SELECTED);
      }
    } else if (!isInitialized && defaultOperator) {
      setValue('enabledOperators', [defaultOperator]);
    }

    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [
    debtTypeOrgOperators.query?.data,
    operators,
    edit,
    defaultOperator,
    enabledOperators,
    disabledOperators,
    setValue,
    isInitialized
  ]);

  const isRowSelectable = (params: GridRowParams) => {
    return String(params.id) !== defaultOperator;
  };

  const handleSelectionChange = useCallback(
    (newSelection: GridRowSelectionModel) => {
      const currentDefaultOperator = userInfo?.mappedExternalUserId;

      // The grid only reports the current page selection. Keep off-page ids from
      // the form state and replace only the portion belonging to the visible page.
      const selectedOperatorsInCurrentPage = newSelection
        .map((operatorId) => String(operatorId))
        .filter(Boolean);
      const selectedOperatorsOutsideCurrentPage = enabledOperators.filter(
        (operatorId) => !operatorIdsInCurrentPage.includes(operatorId)
      );

      setValue(
        'enabledOperators',
        getUniqueOperatorIds([
          ...selectedOperatorsOutsideCurrentPage,
          ...selectedOperatorsInCurrentPage,
          ...(currentDefaultOperator ? [currentDefaultOperator] : [])
        ])
      );

      if (edit) {
        // When editing an existing configuration, remember which operators were
        // originally enabled by the backend but are now unchecked by the user.
        const enabledFromApiInCurrentPage = operators
          .filter((operator) => operator.enabled)
          .map(getOperatorId);
        const disabledOperatorsOutsideCurrentPage = disabledOperators.filter(
          (operatorId) => !operatorIdsInCurrentPage.includes(operatorId)
        );

        setValue(
          'disabledOperators',
          getUniqueOperatorIds([
            ...disabledOperatorsOutsideCurrentPage,
            ...enabledFromApiInCurrentPage.filter(
              (operatorId) =>
                !selectedOperatorsInCurrentPage.includes(operatorId)
            )
          ])
        );
      } else if (disabledOperators.length > 0) {
        setValue('disabledOperators', []);
      }
    },
    [
      userInfo,
      enabledOperators,
      operatorIdsInCurrentPage,
      setValue,
      edit,
      operators,
      disabledOperators
    ]
  );

  const handleClearSelection = useCallback(() => {
    const currentDefaultOperator = userInfo?.mappedExternalUserId;

    // Clearing preserves the default operator, if present, and marks every
    // other selected operator as explicitly disabled for edit-mode payloads.
    const previouslySelected = enabledOperators.filter(
      (opId) => opId !== currentDefaultOperator
    );

    if (currentDefaultOperator) {
      setValue('enabledOperators', [currentDefaultOperator]);
    } else {
      setValue('enabledOperators', []);
    }

    setValue('disabledOperators', previouslySelected);
  }, [setValue, userInfo, enabledOperators]);

  const columns: Array<GridColDef> = [
    {
      field: 'mappedExternalUserId',
      headerName: t('commons.operator'),
      flex: 1,
      type: 'string',
      sortable: false,
      renderCell: (params) =>
        `${params.row.firstName} ${params.row.lastName || params.row.mappedExternalUserId}`
    }
  ];

  const totalSelected = enabledOperators.length;
  // Keep the alert aligned with what the user sees on the current page while
  // still showing the total selection accumulated across server pages.
  const currentPageSelected = selectedOperatorsInCurrentPage.length;

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
          key={gridKey}
          isRowSelectable={isRowSelectable}
          rows={operators}
          columns={columns}
          getRowId={getOperatorId}
          rowSelectionModel={selectedOperatorsInCurrentPage}
          disableColumnMenu
          disableColumnResize
          checkboxSelection
          hideFooterSelectedRowCount
          onRowSelectionModelChange={handleSelectionChange}
          totalPages={debtTypeOrgOperators.query?.data?.totalPages || 1}
          totalElements={debtTypeOrgOperators.query?.data?.totalElements || 0}
          keepNonExistentRowsSelected
          tabIndex={0}
        />
      </Box>
    </Box>
  ) : null;
};
