import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Stack, Alert, Button, Box } from '@mui/material';
import { CopyAll } from '@mui/icons-material';
import {
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useState
} from 'react';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../components/FormComponent';
import { PaymentsTable } from './PaymentsTable';
import { useOperatingYears } from '../../../hooks/useOperatingYears';
import { useChapters } from '../../../hooks/useChapters';
import { useStep2PaymentsState } from '../../../hooks/useStep2PaymentsState';
import { usePaidInstallments } from '../../../hooks/usePaidInstallments';
import { useGlobalPaymentSelection } from '../../../hooks/useGlobalPaymentSelection';
import type {
  PagedPaidInstallmentsDTO,
  PaymentsUIFilters
} from '../../../api/classifications/paidInstallments/mappings';
import { convertFiltersToAPI } from '../../../api/classifications/paidInstallments/mappings';

export type Step2PaymentsRef = {
  showValidationError: (show: boolean) => void;
  showFilterValidationError: (show: boolean) => void;
};

type AssessmentFormData = {
  addPaymentsToAssessment?: boolean;
  selectedPayments?: Array<string>;
  selectedPaymentIuds?: Array<string>;
  operatingYear?: string;
  chapterCode?: string;
  debtPositionTypeOrgCode?: string;
};

// Export validation function for use in AssessmentCreate
export const validateStep2Payments = (values: AssessmentFormData): boolean => {
  const shouldLoadData =
    values.addPaymentsToAssessment === true ||
    String(values.addPaymentsToAssessment) === 'true';

  if (shouldLoadData) {
    const hasSelectedPayments = !!(
      values.selectedPayments && values.selectedPayments.length > 0
    );
    const hasSelectedIuds = !!(
      values.selectedPaymentIuds && values.selectedPaymentIuds.length > 0
    );

    return hasSelectedPayments || hasSelectedIuds;
  }

  return true;
};

export const Step2Payments = forwardRef<Step2PaymentsRef, {}>((_, ref) => {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<AssessmentFormData>();
  const addPaymentsToAssessmentRaw = useWatch({
    control,
    name: 'addPaymentsToAssessment'
  });
  const debtPositionTypeOrgCode = useWatch({
    control,
    name: 'debtPositionTypeOrgCode'
  });
  const selectedPayments = useWatch({
    control,
    name: 'selectedPayments'
  });

  // Normalize boolean value
  const shouldLoadData =
    addPaymentsToAssessmentRaw === true ||
    String(addPaymentsToAssessmentRaw) === 'true';

  // Syncronize IUDs when payments are selected
  // This ensures the persistence of IUDs for the new assessment-details flow
  useEffect(() => {
    if (shouldLoadData && selectedPayments) {
      setValue('selectedPaymentIuds', selectedPayments);
    }
  }, [selectedPayments, shouldLoadData, setValue]);

  const paymentsState = useStep2PaymentsState();

  // Hook for global cross-page IUD selection management
  // TEMPORARY: When IUDs are unique, remove the currentPageRows parameter
  // FUTURE: const globalSelection = useGlobalPaymentSelection({ setValue, selectedPayments });
  const currentPageRows = useMemo(() => {
    const currentPage = paymentsState.paymentsData.number || 0;
    const currentSize = paymentsState.paymentsData.size || 10;

    const rows =
      paymentsState.paymentsData.content?.map((row, pageIndex) => {
        const absoluteIndex = currentPage * currentSize + pageIndex;
        return {
          uniqueId: `${row.iud || 'no-iud'}-${absoluteIndex}`,
          iud: row.iud || ''
        };
      }) || [];

    return rows;
  }, [
    paymentsState.paymentsData.content,
    paymentsState.paymentsData.number,
    paymentsState.paymentsData.size
  ]);

  const globalSelection = useGlobalPaymentSelection({
    setValue: setValue as (name: string, value: unknown) => void,
    selectedPayments,
    currentPageRows
  });

  // Flag to track if data has been loaded at least once
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Stable callbacks to avoid infinite loops
  const handleApiSuccess = useCallback(
    (data: PagedPaidInstallmentsDTO) => {
      paymentsState.updatePaymentsData(data);
      setHasLoadedData(true);
    },
    [paymentsState.updatePaymentsData]
  );

  const handleApiError = useCallback(
    (error: Error) => {
      console.error('Step2 Payments API Error:', error);
      paymentsState.resetPaymentsData();
    },
    [paymentsState.resetPaymentsData]
  );

  const paymentsApi = usePaidInstallments({
    enabled: shouldLoadData && !!debtPositionTypeOrgCode,
    pageSize: 10,
    debtPositionTypeOrgCode: debtPositionTypeOrgCode || '',
    onError: handleApiError
  });

  const operatingYearsQuery = useOperatingYears({
    includeAllOption: false,
    enabled: shouldLoadData
  });

  const currentYear = new Date().getFullYear().toString();
  const chaptersQuery = useChapters({
    operatingYear: currentYear,
    debtPositionTypeOrgCode: debtPositionTypeOrgCode || '',
    enabled: shouldLoadData && !!debtPositionTypeOrgCode,
    purpose: 'validation'
  });

  const resetFormFields = useCallback(() => {
    setValue('selectedPayments', []);
    setValue('selectedPaymentIuds', []);
    setValue('operatingYear', '');
    setValue('chapterCode', '');
    globalSelection.clearAllSelections();
  }, [setValue, globalSelection.clearAllSelections]);

  const handleClearSelection = useCallback(() => {
    globalSelection.clearAllSelections();
  }, [globalSelection.clearAllSelections]);

  // TEMPORARY: When IUDs are unique, this handler will become much simpler
  // FUTURE: handleTableSelectionChange = (newSelectedIuds) => { globalSelection.toggleIudSelection(newSelectedIuds) }
  const handleTableSelectionChange = useCallback(
    (newSelectedUniqueIds: Array<string>) => {
      // Get all currently selected uniqueIds
      const currentSelectedUniqueIds = Array.from(
        globalSelection.globalSelectedUniqueIds
      );

      // TEMPORARY: Calculate uniqueIds for current page
      // FUTURE: const currentPageIuds = paymentsState.paymentsData.content?.map(row => row.iud) || [];
      const currentPageUniqueIds =
        paymentsState.paymentsData.content?.map(
          (row, index) => `${row.iud || 'no-iud'}-${index}`
        ) || [];

      const toDeselect = currentPageUniqueIds.filter(
        (uniqueId) =>
          currentSelectedUniqueIds.includes(uniqueId) &&
          !newSelectedUniqueIds.includes(uniqueId)
      );
      const toSelect = newSelectedUniqueIds.filter(
        (uniqueId) => !currentSelectedUniqueIds.includes(uniqueId)
      );

      if (toDeselect.length > 0) {
        globalSelection.toggleUniqueIdSelection(toDeselect, false);
      }

      if (toSelect.length > 0) {
        globalSelection.toggleUniqueIdSelection(toSelect, true);
      }
    },
    [paymentsState.paymentsData.content, globalSelection]
  );

  const handleFiltersApplied = useCallback(
    async (
      uiFilters: PaymentsUIFilters,
      pagination: { page: number; size: number },
      sortParams?: Array<string>
    ) => {
      try {
        const apiFilters = convertFiltersToAPI(uiFilters);

        const data = await paymentsApi.fetchPaidInstallments({
          filters: apiFilters,
          pagination,
          sort: sortParams
        });

        if (data) {
          handleApiSuccess(data);
        }
      } catch (error) {
        console.error('Failed to fetch filtered paid installments:', error);
        handleApiError(error as Error);
      }
    },
    [paymentsApi.fetchPaidInstallments, handleApiSuccess, handleApiError]
  );

  // Helper function to handle API errors
  const handleExternalApiErrors = useCallback(() => {
    const hasApiError =
      operatingYearsQuery.isError ||
      (chaptersQuery.isError && debtPositionTypeOrgCode) ||
      paymentsApi.isError;

    if (hasApiError) {
      if (operatingYearsQuery.isError) {
        console.error('Operating years error:', operatingYearsQuery.error);
      }
      if (chaptersQuery.isError && debtPositionTypeOrgCode) {
        console.error('Chapters error:', chaptersQuery.error);
      }
      if (paymentsApi.isError) {
        console.error('Payments API error:', paymentsApi.error);
      }
      setValue('addPaymentsToAssessment', false);
      resetFormFields();
    }
  }, [
    operatingYearsQuery.isError,
    operatingYearsQuery.error,
    chaptersQuery.isError,
    chaptersQuery.error,
    paymentsApi.isError,
    paymentsApi.error,
    debtPositionTypeOrgCode,
    setValue,
    resetFormFields
  ]);

  useEffect(() => {
    if (!shouldLoadData) {
      // Reset all form fields and state when switching to "No"
      resetFormFields();
      paymentsState.resetPaymentsData();
      paymentsState.clearValidationErrors();
      setHasLoadedData(false);
      return;
    }
  }, [
    shouldLoadData,
    handleExternalApiErrors,
    resetFormFields,
    paymentsState.resetPaymentsData,
    paymentsState.clearValidationErrors
  ]);

  useEffect(() => {
    if (selectedPayments && selectedPayments.length > 0) {
      paymentsState.setShowPaymentsValidationError(false);
    }
  }, [selectedPayments, paymentsState.setShowPaymentsValidationError]);

  useImperativeHandle(
    ref,
    () => ({
      showValidationError: paymentsState.setShowPaymentsValidationError,
      showFilterValidationError: paymentsState.setShowFiltersValidationError
    }),
    [
      paymentsState.setShowPaymentsValidationError,
      paymentsState.setShowFiltersValidationError
    ]
  );

  const initialTableFilters = useMemo(() => {
    return {
      dateFrom: startOfDay(subDays(new Date(), 30)),
      dateTo: endOfDay(new Date())
    };
  }, []);

  const selectionBannerText = useMemo(() => {
    const count = globalSelection.totalSelected;
    if (count === 0) return '';

    const translationKey =
      count === 1
        ? 'assessmentCreate.configuration.step2.selection.banner.single'
        : 'assessmentCreate.configuration.step2.selection.banner.multiple';

    return t(translationKey, { count });
  }, [globalSelection.totalSelected, t]);

  // Calculate selections for current page (for DataGrid synchronization)
  // TEMPORARY: Convert from uniqueId to list for DataGrid
  // FUTURE: Will be much simpler, direct IUD mapping
  const currentPageSelectedUniqueIds = useMemo(() => {
    const currentPageUniqueIds = currentPageRows.map((row) => row.uniqueId);

    const selectedInCurrentPage = currentPageUniqueIds.filter((uniqueId) =>
      globalSelection.isUniqueIdSelected(uniqueId)
    );

    return selectedInCurrentPage;
  }, [currentPageRows, globalSelection.globalSelectedUniqueIds]);

  return (
    <Stack direction="column" gap={3} width="100%">
      <WizardStepWrapper>
        <Stack direction="column" gap={2} alignItems="left" width="100%">
          <FormComponent.ControlledRadioGroup
            name="addPaymentsToAssessment"
            data-testid="addPaymentsToAssessment"
            control={control}
            label={t(
              'assessmentCreate.configuration.step2.addPayments.radioLabel'
            )}
            sx={{ flexDirection: 'row' }}
            options={[
              {
                value: true,
                label: t(
                  'assessmentCreate.configuration.step2.addPayments.options.yes'
                )
              },
              {
                value: false,
                label: t(
                  'assessmentCreate.configuration.step2.addPayments.options.no'
                )
              }
            ]}
          />
        </Stack>
      </WizardStepWrapper>

      {shouldLoadData && operatingYearsQuery.isError && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{ mb: 2 }}
          data-testid="operating-years-error-banner"
        >
          {t('errors.fetchOperatingYears')}
        </Alert>
      )}

      {shouldLoadData && chaptersQuery.isError && debtPositionTypeOrgCode && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{ mb: 2 }}
          data-testid="chapters-error-banner"
        >
          {t('errors.fetchChapters')}
        </Alert>
      )}

      {shouldLoadData && paymentsState.showPaymentsValidationError && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{ mb: 2 }}
          data-testid="payments-selection-error-banner"
        >
          {t(
            'assessmentCreate.configuration.step2.validation.noPaymentsSelected'
          )}
        </Alert>
      )}

      {shouldLoadData && paymentsState.showFiltersValidationError && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{ mb: 2 }}
          data-testid="filter-validation-error-banner"
        >
          {t(
            'assessmentCreate.configuration.step2.validation.noFiltersSelected'
          )}
        </Alert>
      )}

      {shouldLoadData && globalSelection.totalSelected > 0 && (
        <Alert
          severity="info"
          variant="outlined"
          sx={{ mb: 2 }}
          data-testid="payments-selection-banner"
          action={
            <Button
              variant="naked"
              size="small"
              startIcon={<CopyAll />}
              onClick={handleClearSelection}
              data-testid="clear-selection-button"
            >
              {t(
                'assessmentCreate.configuration.step2.selection.banner.clearSelection'
              )}
            </Button>
          }
        >
          <Box component="span" sx={{ fontWeight: 'medium' }}>
            {selectionBannerText}
            {globalSelection.totalSelected >
              currentPageSelectedUniqueIds.length && (
              <Box
                component="span"
                sx={{ fontStyle: 'italic', ml: 1, color: 'text.secondary' }}
              >
                ({currentPageSelectedUniqueIds.length} {t('commons.inThisPage')}
                )
              </Box>
            )}
          </Box>
        </Alert>
      )}

      {shouldLoadData && (
        <PaymentsTable
          data={paymentsState.paymentsData}
          onSelectionChange={handleTableSelectionChange}
          onFiltersApplied={handleFiltersApplied}
          onFilterValidationError={paymentsState.setShowFiltersValidationError}
          initialFilters={initialTableFilters}
          isLoading={paymentsApi.isLoading}
          autoLoadOnMount={!hasLoadedData}
          selectedUniqueIds={currentPageSelectedUniqueIds}
        />
      )}
    </Stack>
  );
});
