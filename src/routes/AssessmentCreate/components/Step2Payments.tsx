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
import { useNavigate } from 'react-router';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../components/FormComponent';
import { PaymentsTable } from './PaymentsTable';
import GenericDialog from '../../../components/GenericDialog/GenericDialog';
import { useOperatingYears } from '../../../hooks/useOperatingYears';
import { useChapters } from '../../../hooks/useChapters';
import { useStep2PaymentsState } from '../../../hooks/useStep2PaymentsState';
import { usePaidInstallments } from '../../../hooks/usePaidInstallments';
import { useGlobalPaymentSelection } from '../../../hooks/useGlobalPaymentSelection';
import { usePaymentsManager } from '../../../hooks/usePaymentsManager';
import { deleteAssessmentDetails } from '../../../api/assessments';
import { useStore } from '../../../store/GlobalStore';
import { STATE } from '../../../store/types';
import { PageRoutes } from '../../../routes';
import type {
  PagedPaidInstallmentsDTO,
  PaymentsUIFilters
} from '../../../api/classifications/paidInstallments/mappings';
import { convertFiltersToAPI } from '../../../api/classifications/paidInstallments/mappings';
import { assessmentsRowsDetailSchema } from '../../../../generated/zod-schema';
import { z } from 'zod';
import utils from '../../../utils';

type AssessmentsRowsDetail = z.infer<typeof assessmentsRowsDetailSchema>;

export type Step2PaymentsRef = {
  showValidationError: (show: boolean) => void;
  showFilterValidationError: (show: boolean) => void;
  validateSelections: () => boolean;
};

export type AssessmentFormData = {
  addPaymentsToAssessment?: boolean;
  selectedPayments?: Array<string>;
  selectedPaymentIuds?: Array<string>;
  operatingYear?: string;
  chapterCode?: string;
  debtPositionTypeOrgCode?: string;
  assessmentName?: string;
  isModifyMode?: boolean;
  modifyAction?: 'add' | 'remove';
  assessmentId?: number;
  selectedAssessmentDetailIds?: Array<number>;
};

// Export validation function for use in AssessmentCreate
export const validateStep2Payments = (
  values: AssessmentFormData,
  currentSelectedAssessmentDetailIds?: Array<number>
): boolean => {
  const shouldLoadData =
    values.addPaymentsToAssessment === true ||
    String(values.addPaymentsToAssessment) === 'true';

  if (shouldLoadData) {
    // Check if we're in Remove mode
    if (values.isModifyMode && values.modifyAction === 'remove') {
      const assessmentDetailIds =
        currentSelectedAssessmentDetailIds !== undefined
          ? currentSelectedAssessmentDetailIds
          : values.selectedAssessmentDetailIds;

      const hasSelectedAssessmentDetailIds = !!(
        assessmentDetailIds && assessmentDetailIds.length > 0
      );
      return hasSelectedAssessmentDetailIds;
    } else {
      const hasSelectedPayments = !!(
        values.selectedPayments && values.selectedPayments.length > 0
      );
      const hasSelectedIuds = !!(
        values.selectedPaymentIuds && values.selectedPaymentIuds.length > 0
      );
      return hasSelectedPayments || hasSelectedIuds;
    }
  }

  return true;
};

/**
 * Step2Payments - Component for payment management in the Assessment Create flow
 *
 * Responsibilities:
 * - Payment selection/deselection
 * - Alert coordination for validation and info
 * - Integration with Assessment wizard
 * - Support for Add/Remove mode for existing Assessments
 *
 * Supported modes:
 * - Normal flow: Step 2 of the wizard creation
 * - Modify Add: Add payments to an existing Assessment
 * - Modify Remove: Remove payments from an existing Assessment
 */
const Step2PaymentsComponent = forwardRef<
  Step2PaymentsRef,
  { isActive?: boolean }
>(({ isActive = true }, ref) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  const assessmentName = useWatch({
    control,
    name: 'assessmentName'
  });
  const selectedAssessmentDetailIds = useWatch({
    control,
    name: 'selectedAssessmentDetailIds'
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

  const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState(false);
  // state for tracking manual API calls (pagination, filters, sorting)
  const [isManualApiCallPending, setIsManualApiCallPending] = useState(false);

  // Initialize delete mutation
  const deleteAssessmentDetailsMutation =
    deleteAssessmentDetails(organizationId);

  const paymentsState = useStep2PaymentsState();

  const currentPageRows = useMemo(() => {
    const dataSource = isRemoveMode ? removeData : paymentsState.paymentsData;
    return (dataSource?.content || []).map((row) => ({
      iud: row.iud || '',
      assessmentDetailId: isRemoveMode
        ? (row as typeof row & { assessmentDetailId?: number })
            .assessmentDetailId
        : undefined
    }));
  }, [isRemoveMode, removeData, paymentsState.paymentsData.content]);

  const globalSelection = useGlobalPaymentSelection({
    setValue: setValue as (name: string, value: unknown) => void,
    selectedPayments,
    currentPageRows,
    isRemoveMode
  });

  const paymentsManager = usePaymentsManager({
    shouldLoadData,
    selectedPayments,
    paymentsValidationError: paymentsState.showPaymentsValidationError,
    filtersValidationError: paymentsState.showFiltersValidationError,
    onPaymentsValidationChange: paymentsState.setShowPaymentsValidationError,
    onFiltersValidationChange: paymentsState.setShowFiltersValidationError,
    totalSelected: globalSelection.totalSelected
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

  // Handler for assessment detail data (Remove mode)
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

  // In Remove mode, disable usePaidInstallments - data loading handled by PaymentsTable
  const paymentsApi = usePaidInstallments({
    enabled:
      isActive && shouldLoadData && !!debtPositionTypeOrgCode && !isRemoveMode,
    pageSize: 10,
    debtPositionTypeOrgCode: debtPositionTypeOrgCode || '',
    onError: handleApiError
  });

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
    // Synchronize with payments manager
    paymentsManager.clearAllAlerts();
  }, [
    setValue,
    globalSelection.clearAllSelections,
    paymentsManager.clearAllAlerts
  ]);

  const handleClearSelection = useCallback(() => {
    if (isRemoveMode) {
      setValue('selectedAssessmentDetailIds', []);
    }
    setValue('selectedPayments', []);
    setValue('selectedPaymentIuds', []);

    globalSelection.clearAllSelections();
    // Synchronize with payments manager
    paymentsManager.hideAlert();
  }, [
    globalSelection.clearAllSelections,
    paymentsManager.hideAlert,
    isRemoveMode,
    setValue
  ]);

  const handleOpenRemoveConfirmModal = useCallback(() => {
    if (!isRemoveMode) {
      return;
    }

    const hasSelections =
      selectedAssessmentDetailIds && selectedAssessmentDetailIds.length > 0;

    if (hasSelections) {
      setShowRemoveConfirmModal(true);
    } else {
      paymentsManager.showValidationError(true);
    }
  }, [
    isRemoveMode,
    selectedAssessmentDetailIds,
    paymentsManager.showValidationError,
    setShowRemoveConfirmModal
  ]);

  const handleConfirmRemove = useCallback(async () => {
    const assessmentDetailIds = selectedAssessmentDetailIds || [];

    if (!assessmentDetailIds || assessmentDetailIds.length === 0) {
      console.error('No assessmentDetailIds provided to handleConfirmRemove');
      setShowRemoveConfirmModal(false);
      return;
    }
    try {
      await deleteAssessmentDetailsMutation.mutateAsync(assessmentDetailIds);
      setShowRemoveConfirmModal(false);

      navigate(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'assessment-remove-payments',
          i18nParams: {
            count: assessmentDetailIds.length,
            assessmentName
          },
          assessmentId
        }
      });
    } catch (error: unknown) {
      console.error('Error during payment removal:', error);

      setShowRemoveConfirmModal(false);

      const isAxiosErrorWithResponse = (
        err: unknown
      ): err is { response?: { status?: number } } => {
        return typeof err === 'object' && err !== null && 'response' in err;
      };

      const statusCode = isAxiosErrorWithResponse(error)
        ? error.response?.status
        : undefined;

      if (statusCode && statusCode >= 400 && statusCode < 500) {
        navigate(PageRoutes.RESPONSES_ERROR, {
          state: {
            category: 'assessment-remove-payments',
            errorType: '4xx',
            statusCode
          }
        });
        return;
      }
      utils.notify.emit(t('errors.generic'));
    }
  }, [
    selectedAssessmentDetailIds,
    deleteAssessmentDetailsMutation,
    navigate,
    assessmentName,
    assessmentId,
    t
  ]);

  const handleCancelRemove = useCallback(() => {
    setShowRemoveConfirmModal(false);
  }, []);

  // Handle table selection changes with direct IUD management
  const handleTableSelectionChange = useCallback(
    (newSelectedIuds: Array<string>) => {
      // Use Set for performance
      const currentSelectedSet = globalSelection.globalSelectedIuds;
      const newSelectedSet = new Set(newSelectedIuds);

      // Get current page IUDs for proper scope calculation
      const currentPageIuds = new Set(
        currentPageRows.map((row) => row.iud).filter(Boolean)
      );

      // Calculate changes ONLY for current page scope
      const currentPageSelectedIuds = Array.from(currentSelectedSet).filter(
        (iud) => currentPageIuds.has(iud)
      );

      const toDeselect = currentPageSelectedIuds.filter(
        (iud) => !newSelectedSet.has(iud)
      );
      const toSelect = newSelectedIuds.filter(
        (iud) => !currentSelectedSet.has(iud)
      );

      if (toDeselect.length > 0) {
        globalSelection.toggleIudSelection(toDeselect, false);
      }
      if (toSelect.length > 0) {
        globalSelection.toggleIudSelection(toSelect, true);
      }
    },
    [
      globalSelection.globalSelectedIuds,
      globalSelection.toggleIudSelection,
      currentPageRows
    ]
  );

  const handleFiltersApplied = useCallback(
    async (
      uiFilters: PaymentsUIFilters,
      pagination: { page: number; size: number },
      sortParams?: Array<string>
    ) => {
      setIsManualApiCallPending(true);

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
      } finally {
        setIsManualApiCallPending(false);
      }
    },
    [paymentsApi.fetchPaidInstallments, handleApiSuccess, handleApiError]
  );

  const handleRemoveModeFiltersApplied = useCallback(
    async (
      uiFilters: PaymentsUIFilters,
      pagination: { page: number; size: number },
      sortParams?: Array<string>
    ) => {
      if (!isRemoveMode || !assessmentId || !organizationId) return;

      setIsManualApiCallPending(true);

      try {
        // In remove mode, convert filters without adding automatic dates
        const convertFiltersForRemoval = (uiFilters: PaymentsUIFilters) => {
          const apiFilters: {
            iuv?: string;
            paymentDateTimeFrom?: string;
            paymentDateTimeTo?: string;
            updateDateFrom?: string;
            updateDateTo?: string;
          } = {};

          if (uiFilters.iuv?.trim()) {
            apiFilters.iuv = uiFilters.iuv.trim();
          }

          // If explicitly present, add data filters
          if (uiFilters.dateFrom && uiFilters.dateTo) {
            apiFilters.paymentDateTimeFrom = uiFilters.dateFrom.toISOString();
            apiFilters.paymentDateTimeTo = uiFilters.dateTo.toISOString();
          }

          if (uiFilters.updateDateFrom && uiFilters.updateDateTo) {
            apiFilters.updateDateFrom = uiFilters.updateDateFrom.toISOString();
            apiFilters.updateDateTo = uiFilters.updateDateTo.toISOString();
          }

          // We don't add default dates in remove mode
          return apiFilters;
        };

        const apiFilters = convertFiltersForRemoval(uiFilters);

        const queryParams = {
          size: pagination.size,
          page: pagination.page,
          ...(apiFilters.iuv && { iuv: apiFilters.iuv }),
          ...(apiFilters.paymentDateTimeFrom && {
            paymentDateTimeFrom: apiFilters.paymentDateTimeFrom
          }),
          ...(apiFilters.paymentDateTimeTo && {
            paymentDateTimeTo: apiFilters.paymentDateTimeTo
          }),
          ...(apiFilters.updateDateFrom && {
            updateDateFrom: apiFilters.updateDateFrom
          }),
          ...(apiFilters.updateDateTo && {
            updateDateTo: apiFilters.updateDateTo
          }),
          ...(sortParams?.length && { sort: sortParams })
        };

        const { data } = await utils.apiClient.bff.getPagedAssessmentsDetails(
          organizationId,
          assessmentId,
          queryParams
        );

        if (data) {
          handleAssessmentDetailSuccess(data);
        }
      } catch (error) {
        console.error('Failed to fetch assessment detail:', error);
        handleApiError(error as Error);
      } finally {
        setIsManualApiCallPending(false);
      }
    },
    [
      isRemoveMode,
      assessmentId,
      organizationId,
      handleAssessmentDetailSuccess,
      handleApiError
    ]
  );

  // Helper function to handle API errors
  const handleExternalApiErrors = useCallback(() => {
    const hasApiError =
      operatingYearsQuery.isError ||
      (chaptersQuery.isError && debtPositionTypeOrgCode) ||
      (!isRemoveMode && paymentsApi.isError);

    if (hasApiError) {
      if (operatingYearsQuery.isError) {
        console.error('Operating years error:', operatingYearsQuery.error);
      }
      if (chaptersQuery.isError && debtPositionTypeOrgCode) {
        console.error('Chapters error:', chaptersQuery.error);
      }
      if (!isRemoveMode && paymentsApi.isError) {
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
    paymentsApi.isError,
    paymentsApi.error,
    debtPositionTypeOrgCode,
    setValue,
    resetFormFields
  ]);

  useEffect(() => {
    handleExternalApiErrors();
  }, [
    operatingYearsQuery.isError,
    chaptersQuery.isError,
    paymentsApi.isError,
    debtPositionTypeOrgCode,
    handleExternalApiErrors
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
    resetFormFields,
    paymentsState.resetPaymentsData,
    paymentsState.clearValidationErrors
  ]);

  // Helper function to check if there are selections
  const hasSelections = useCallback(() => {
    return isRemoveMode
      ? !!(
          selectedAssessmentDetailIds && selectedAssessmentDetailIds.length > 0
        )
      : globalSelection.totalSelected > 0;
  }, [
    isRemoveMode,
    selectedAssessmentDetailIds,
    globalSelection.totalSelected
  ]);

  useImperativeHandle(
    ref,
    () => ({
      showValidationError: (show: boolean) => {
        const hasCurrentSelections = hasSelections();

        if (show && hasCurrentSelections) {
          handleOpenRemoveConfirmModal();
        } else {
          paymentsManager.showValidationError(show);
        }
      },
      showFilterValidationError: paymentsManager.showFilterValidationError,
      validateSelections: hasSelections
    }),
    [
      hasSelections,
      handleOpenRemoveConfirmModal,
      paymentsManager.showValidationError,
      paymentsManager.showFilterValidationError
    ]
  );

  const initialTableFilters = useMemo(() => {
    // In remove mode, we take the existing filters from the URL but remove the dates
    if (isRemoveMode) {
      const currentFilters = utils.URI.decode(window.location.hash);
      // We remove only the data filters keeping the others (e.g. IUV)
      return Object.fromEntries(
        Object.entries(currentFilters).filter(
          ([key]) => !['dateFrom', 'dateTo'].includes(key)
        )
      );
    }
    return {
      dateFrom: startOfDay(subDays(new Date(), 30)),
      dateTo: endOfDay(new Date())
    };
  }, [isRemoveMode]);

  const isApiCallPending = useMemo(() => {
    if (isRemoveMode) {
      return isManualApiCallPending;
    } else {
      return paymentsApi.isLoading || isManualApiCallPending;
    }
  }, [isRemoveMode, paymentsApi.isLoading, isManualApiCallPending]);

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

        // Reset URL parameters to default when debt type changes
        const { ...otherParams } = utils.URI.decode(window.location.hash);
        // Remove pagination and sorting params but keep other filters
        const resetParams = Object.fromEntries(
          Object.entries(otherParams).filter(
            ([key]) =>
              !['page', 'size', 'sortField', 'sortDirection'].includes(key)
          )
        );
        const paramsObj = {
          ...resetParams,
          page: 1,
          size: 10
        };
        const encoded = utils.URI.encode(paramsObj);
        utils.URI.set(encoded);

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
  const currentPageSelectedIuds = useMemo(() => {
    const currentPageIuds = currentPageRows
      .map((row) => row.iud)
      .filter((iud): iud is string => Boolean(iud));

    const selectedInCurrentPage = currentPageIuds.filter((iud) =>
      globalSelection.isIudSelected(iud)
    );

    return selectedInCurrentPage;
  }, [currentPageRows, globalSelection.globalSelectedIuds]);

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

      {shouldLoadData && paymentsManager.shouldShowErrorAlert && (
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

      {shouldLoadData && paymentsManager.shouldShowInfoAlert && (
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
            {globalSelection.totalSelected > currentPageSelectedIuds.length && (
              <Box
                component="span"
                sx={{ fontStyle: 'italic', ml: 1, color: 'text.secondary' }}
              >
                ({currentPageSelectedIuds.length} {t('commons.inThisPage')})
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
          onFiltersApplied={
            isRemoveMode ? handleRemoveModeFiltersApplied : handleFiltersApplied
          }
          onFilterValidationError={paymentsState.setShowFiltersValidationError}
          initialFilters={initialTableFilters}
          isLoading={
            (isRemoveMode ? isManualApiCallPending : paymentsApi.isLoading) &&
            !hasLoadedData
          }
          isApiCallPending={isApiCallPending}
          autoLoadOnMount={!hasLoadedData}
          selectedIuds={currentPageSelectedIuds}
          isRemoveMode={isRemoveMode}
        />
      )}

      {isRemoveMode && (
        <>
          <GenericDialog
            open={showRemoveConfirmModal}
            title={t('assessmentCreate.removePayments.confirmModal.title')}
            message={t(
              'assessmentCreate.removePayments.confirmModal.description'
            )}
            confirmLabel={
              selectedAssessmentDetailIds &&
              selectedAssessmentDetailIds.length > 0
                ? t('commons.onlyRemove')
                : undefined
            }
            cancelLabel={t('commons.cancel')}
            onConfirm={
              selectedAssessmentDetailIds &&
              selectedAssessmentDetailIds.length > 0
                ? handleConfirmRemove
                : undefined
            }
            onClose={handleCancelRemove}
            data-testid="remove-payments-confirm-modal"
          />
        </>
      )}
    </Stack>
  );
});

Step2PaymentsComponent.displayName = 'Step2Payments';

// Memoized PaymentsTable to prevent unnecessary re-renders
const MemoizedPaymentsTable = memo(PaymentsTable);

export { Step2PaymentsComponent as Step2Payments };
