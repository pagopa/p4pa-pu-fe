import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Stack, Alert } from '@mui/material';
import {
  useEffect,
  useCallback,
  useState,
  useImperativeHandle,
  forwardRef
} from 'react';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../components/FormComponent';
import { PaymentsTable } from './PaymentsTable';
import { useOperatingYears } from '../../../hooks/useOperatingYears';
import { useChapters } from '../../../hooks/useChapters';
import { usePaidInstallments } from '../../../hooks/usePaidInstallments';

export type Step2Props = {
  editmode?: boolean;
};

export type Step2PaymentsRef = {
  showValidationError: (show: boolean) => void;
};

type AssessmentFormData = {
  addPaymentsToAssessment?: boolean;
  selectedPayments?: Array<string>;
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
    return !!(values.selectedPayments && values.selectedPayments.length > 0);
  }

  return true; // If not adding payments, validation passes
};

/**
 * Step 2 - Payments Management
 *
 * Permette all'utente di scegliere se aggiungere pagamenti all'assessment e di
 * selezionare i pagamenti disponibili utilizzando l'API reale.
 *
 * NOTA: Durante la creazione, utilizziamo un assessmentId temporaneo (-1) per
 * recuperare i paid installments disponibili. Questo permetterà di mostrare
 * i pagamenti reali che possono essere associati all'assessment.
 */
export const Step2Payments = forwardRef<Step2PaymentsRef, Step2Props>(
  ({ editmode = false }, ref) => {
    const { t } = useTranslation();
    const { control, setValue } = useFormContext<AssessmentFormData>();

    // State per mostrare l'alert di validazione
    const [showValidationError, setShowValidationError] = useState(false);

    // Watch form values
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

    // Always convert to boolean for consistency (pattern from AssessmentCreate.tsx)
    const shouldLoadData =
      addPaymentsToAssessmentRaw === true ||
      String(addPaymentsToAssessmentRaw) === 'true';

    // Helper function for form field reset
    const resetFormFields = useCallback(() => {
      setValue('selectedPayments', []);
      setValue('operatingYear', '');
      setValue('chapterCode', '');
    }, [setValue]);

    // API Calls - React Query handles automatically cache and deduplication
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

    // Hook per recuperare i paid installments usando l'API reale
    const paidInstallmentsHook = usePaidInstallments({
      enabled: shouldLoadData && !!debtPositionTypeOrgCode,
      debtPositionTypeOrgCode: debtPositionTypeOrgCode || '',
      assessmentId: -1, // Valore temporaneo durante la creazione
      pageSize: 10
    });

    // Carica i pagamenti quando shouldLoadData diventa true e abbiamo debtPositionTypeOrgCode
    useEffect(() => {
      if (shouldLoadData && debtPositionTypeOrgCode && paidInstallmentsHook) {
        paidInstallmentsHook
          .fetchPaidInstallments({
            pagination: { page: 0, size: 10 },
            sort: ['paymentDateTime:desc']
          })
          .catch((error) => {
            console.error('Failed to fetch paid installments:', error);
          });
      }
    }, [shouldLoadData, debtPositionTypeOrgCode, paidInstallmentsHook]);

    // Reset form fields when user selects "No"
    useEffect(() => {
      if (!shouldLoadData) {
        resetFormFields();
        setShowValidationError(false); // Hide validation error when switching to "No"
      }
    }, [shouldLoadData, resetFormFields]);

    // Hide validation error when user selects payments
    useEffect(() => {
      if (selectedPayments && selectedPayments.length > 0) {
        setShowValidationError(false);
      }
    }, [selectedPayments]);

    // Expose validation functions via ref
    useImperativeHandle(
      ref,
      () => ({
        showValidationError: (show: boolean) => {
          setShowValidationError(show);
        }
      }),
      []
    );

    // Auto-reset on API failures (non-edit mode only)
    useEffect(() => {
      if (!editmode && shouldLoadData) {
        const shouldResetOnError =
          operatingYearsQuery.isError ||
          (chaptersQuery.isError && debtPositionTypeOrgCode) ||
          paidInstallmentsHook.isError;

        if (shouldResetOnError) {
          setValue('addPaymentsToAssessment', false);
          resetFormFields();
        }
      }
    }, [
      editmode,
      shouldLoadData,
      operatingYearsQuery.isError,
      chaptersQuery.isError,
      paidInstallmentsHook.isError,
      debtPositionTypeOrgCode,
      setValue,
      resetFormFields
    ]);

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
              disabled={editmode}
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

        {shouldLoadData && paidInstallmentsHook.isError && (
          <Alert
            severity="error"
            variant="outlined"
            sx={{ mb: 2 }}
            data-testid="paid-installments-error-banner"
          >
            {t('errors.fetchPaidInstallments')}
          </Alert>
        )}

        {shouldLoadData && showValidationError && (
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

        {shouldLoadData && (
          <PaymentsTable
            onSelectionChange={(selected) =>
              setValue('selectedPayments', selected)
            }
            disabled={editmode}
            paymentsData={paidInstallmentsHook.data}
            isLoading={paidInstallmentsHook.isLoading}
            onDataRefresh={paidInstallmentsHook.fetchPaidInstallments}
          />
        )}
      </Stack>
    );
  }
);
