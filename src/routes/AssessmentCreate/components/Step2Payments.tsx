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
  useState,
  memo
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
import { getAssessmentDetail } from '../../../api/assessments/assessmentDetail/assessmentDetail';
import { useStore } from '../../../store/GlobalStore';
import { STATE } from '../../../store/types';
import type {
  PagedPaidInstallmentsDTO,
  PaymentsUIFilters
} from '../../../api/classifications/paidInstallments/mappings';
import { convertFiltersToAPI } from '../../../api/classifications/paidInstallments/mappings';
import { assessmentsRowsDetailSchema } from '../../../../generated/zod-schema';
import { z } from 'zod';

type AssessmentsRowsDetail = z.infer<typeof assessmentsRowsDetailSchema>;

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
  // Campi per modalità modifica
  isModifyMode?: boolean;
  modifyAction?: 'add' | 'remove';
  assessmentId?: number;
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

const Step2PaymentsComponent = forwardRef<
  Step2PaymentsRef,
  { isActive?: boolean }
>(({ isActive = true }, ref) => {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<AssessmentFormData>();
  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);
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
  const isModifyMode = useWatch({
    control,
    name: 'isModifyMode'
  });
  const modifyAction = useWatch({
    control,
    name: 'modifyAction'
  });
  const assessmentId = useWatch({
    control,
    name: 'assessmentId'
  });

  // Normalize boolean value
  // In modify mode, always load data since we're working with payments
  const shouldLoadData =
    isModifyMode ||
    addPaymentsToAssessmentRaw === true ||
    String(addPaymentsToAssessmentRaw) === 'true';

  const isRemoveMode = isModifyMode && modifyAction === 'remove';

  const [removeData, setRemoveData] = useState<PagedPaidInstallmentsDTO | null>(
    null
  );

  const paymentsState = useStep2PaymentsState();

  // Hook for global cross-page IUD selection management
  // TEMPORARY: When IUDs are unique, remove the currentPageRows parameter
  // FUTURE: const globalSelection = useGlobalPaymentSelection({ setValue, selectedPayments });
  const currentPageRows = useMemo(() => {
    // For Remove mode, use removeData instead of paymentsState.paymentsData
    const dataSource = isRemoveMode ? removeData : paymentsState.paymentsData;
    const currentPage = dataSource?.number || 0;
    const currentSize = dataSource?.size || 10;

    const rows =
      dataSource?.content?.map((row, pageIndex) => {
        const absoluteIndex = currentPage * currentSize + pageIndex;
        return {
          uniqueId: `${row.iud || 'no-iud'}-${absoluteIndex}`,
          iud: row.iud || ''
        };
      }) || [];

    return rows;
  }, [
    isRemoveMode,
    removeData,
    paymentsState.paymentsData.content,
    paymentsState.paymentsData.number,
    paymentsState.paymentsData.size
  ]);

  const globalSelection = useGlobalPaymentSelection({
    setValue: setValue as (name: string, value: unknown) => void,
    selectedPayments,
    currentPageRows
  });

  // Syncronize IUDs when payments are selected
  // This ensures the persistence of IUDs for the new assessment-details flow
  useEffect(() => {
    if (shouldLoadData && selectedPayments) {
      setValue('selectedPaymentIuds', selectedPayments);
    }
  }, [selectedPayments, shouldLoadData, setValue]);

  // Flag to track if data has been loaded at least once
  const [hasLoadedData, setHasLoadedData] = useState(false);
  // Track previous debtPositionTypeOrgCode to detect changes
  const [prevDebtPositionTypeOrgCode, setPrevDebtPositionTypeOrgCode] =
    useState<string>('');

  // Stable callbacks to avoid infinite loops
  const handleApiSuccess = useCallback(
    (data: PagedPaidInstallmentsDTO) => {
      paymentsState.updatePaymentsData(data);
      setHasLoadedData(true);
    },
    [paymentsState.updatePaymentsData]
  );

  // Handler per i dati dell'assessment detail (Remove mode)
  const handleAssessmentDetailSuccess = useCallback(
    (data: AssessmentsRowsDetail) => {
      // Transform data from assessment detail to PagedPaidInstallmentsDTO format
      if (data?.pagedAssessmentsRowsDetail) {
        const transformedData: PagedPaidInstallmentsDTO = {
          content: (data.pagedAssessmentsRowsDetail.content || []).map(
            (item) => ({
              ...item,

              receiptCreationDate: item.updateDate,
              amount: item.amountCents || 0
            })
          ),
          totalElements: data.pagedAssessmentsRowsDetail.totalElements || 0,
          totalPages: data.pagedAssessmentsRowsDetail.totalPages || 0,
          number: data.pagedAssessmentsRowsDetail.number || 0,
          size: data.pagedAssessmentsRowsDetail.size || 10
        };

        setRemoveData(transformedData);
        setHasLoadedData(true);
      }
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

  // For Remove mode, use getAssessmentDetail instead of usePaidInstallments
  const paymentsApi = usePaidInstallments({
    enabled:
      isActive && shouldLoadData && !!debtPositionTypeOrgCode && !isRemoveMode,
    pageSize: 10,
    debtPositionTypeOrgCode: debtPositionTypeOrgCode || '',
    onError: handleApiError
  });

  const assessmentDetailQuery = getAssessmentDetail(
    organizationId,
    assessmentId || 0,
    { size: 10, page: 0 }, // Default pagination
    {
      enabled:
        isActive &&
        shouldLoadData &&
        isRemoveMode &&
        !!assessmentId &&
        !!organizationId &&
        !hasLoadedData
    }
  );

  // Effect for handling assessment detail data (Remove mode)
  useEffect(() => {
    if (
      isRemoveMode &&
      assessmentDetailQuery.data &&
      !assessmentDetailQuery.isLoading &&
      !hasLoadedData
    ) {
      handleAssessmentDetailSuccess(assessmentDetailQuery.data);
    }
    if (isRemoveMode && assessmentDetailQuery.isError) {
      handleApiError(assessmentDetailQuery.error as Error);
    }
  }, [
    isRemoveMode,
    assessmentDetailQuery.data,
    assessmentDetailQuery.isLoading,
    assessmentDetailQuery.isError,
    assessmentDetailQuery.error,
    hasLoadedData,
    handleAssessmentDetailSuccess,
    handleApiError
  ]);

  const operatingYearsQuery = useOperatingYears({
    includeAllOption: false,
    enabled: isActive && shouldLoadData
  });

  const currentYear = new Date().getFullYear().toString();
  const chaptersQuery = useChapters({
    operatingYear: currentYear,
    debtPositionTypeOrgCode: debtPositionTypeOrgCode || '',
    enabled: isActive && shouldLoadData && !!debtPositionTypeOrgCode,
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
      // Use the same data source as currentPageRows
      const dataSource = isRemoveMode ? removeData : paymentsState.paymentsData;
      const currentPageUniqueIds =
        dataSource?.content?.map(
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
    [
      isRemoveMode,
      removeData?.content,
      paymentsState.paymentsData.content,
      globalSelection.toggleUniqueIdSelection
    ]
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
      (isRemoveMode ? assessmentDetailQuery.isError : paymentsApi.isError);

    if (hasApiError) {
      if (operatingYearsQuery.isError) {
        console.error('Operating years error:', operatingYearsQuery.error);
      }
      if (chaptersQuery.isError && debtPositionTypeOrgCode) {
        console.error('Chapters error:', chaptersQuery.error);
      }
      if (isRemoveMode && assessmentDetailQuery.isError) {
        console.error(
          'Assessment Detail API error:',
          assessmentDetailQuery.error
        );
      } else if (!isRemoveMode && paymentsApi.isError) {
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
    isRemoveMode,
    assessmentDetailQuery.isError,
    assessmentDetailQuery.error,
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
  }, [selectedPayments?.length, paymentsState.setShowPaymentsValidationError]);

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

  // Reset data when debtPositionTypeOrgCode changes and step becomes active
  // This handles the case when user goes Step2->Step1->changes type->Step2
  // and the table needs to reload with new debt type data
  useEffect(() => {
    if (isActive && shouldLoadData && debtPositionTypeOrgCode) {
      // Check if debtPositionTypeOrgCode changed
      if (
        debtPositionTypeOrgCode !== prevDebtPositionTypeOrgCode &&
        prevDebtPositionTypeOrgCode !== ''
      ) {
        setHasLoadedData(false);
        paymentsState.resetPaymentsData();
        globalSelection.clearAllSelections();

        // Force reload data with new debtPositionTypeOrgCode
        handleFiltersApplied(initialTableFilters, { page: 0, size: 10 });
      }
      // Update the previous value
      setPrevDebtPositionTypeOrgCode(debtPositionTypeOrgCode);
    }
  }, [
    isActive,
    debtPositionTypeOrgCode,
    shouldLoadData,
    prevDebtPositionTypeOrgCode,
    paymentsState.resetPaymentsData,
    globalSelection.clearAllSelections,
    handleFiltersApplied,
    initialTableFilters
  ]);

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
      {!isModifyMode && (
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
      )}

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
              size="large"
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
        <MemoizedPaymentsTable
          data={
            isRemoveMode
              ? removeData || {
                  content: [],
                  totalElements: 0,
                  totalPages: 0,
                  number: 0,
                  size: 10
                }
              : paymentsState.paymentsData
          }
          onSelectionChange={handleTableSelectionChange}
          onFiltersApplied={isRemoveMode ? undefined : handleFiltersApplied}
          onFilterValidationError={paymentsState.setShowFiltersValidationError}
          initialFilters={initialTableFilters}
          isLoading={
            (isRemoveMode
              ? assessmentDetailQuery.isLoading
              : paymentsApi.isLoading) && !hasLoadedData
          }
          autoLoadOnMount={!hasLoadedData && !isRemoveMode}
          selectedUniqueIds={currentPageSelectedUniqueIds}
        />
      )}
    </Stack>
  );
});

Step2PaymentsComponent.displayName = 'Step2Payments';

// Memoized PaymentsTable to prevent unnecessary re-renders
const MemoizedPaymentsTable = memo(PaymentsTable);

export { Step2PaymentsComponent as Step2Payments };
