import {
  Box,
  Grid,
  Typography,
  FormControlLabel,
  Switch,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormHelperText
} from '@mui/material';
import {
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger,
  Path,
  FieldArrayPath,
  PathValue,
  useWatch
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import BeneficiaryField from '../Beneficiary/BeneficiaryField';

type BeneficiaryControlProps<T extends FieldValues> = {
  index: number;
  control: Control<T>;
  errors: FieldErrors<T>;
  isSubmitted: boolean;
  fieldNamePrefix: string;
  disabled?: boolean;
  getValues: UseFormGetValues<T>;
  setValue: UseFormSetValue<T>;
  trigger: UseFormTrigger<T>;
  isMultibeneficiary: boolean;
  toggleMultibeneficiary: (value: boolean) => void;
};

/**
 * Componente per la gestione dei beneficiari multipli di una rata
 */
const BeneficiaryControl = <T extends FieldValues>({
  index,
  control,
  errors,
  isSubmitted,
  fieldNamePrefix,
  disabled = false,
  getValues,
  setValue,
  trigger,
  isMultibeneficiary,
  toggleMultibeneficiary
}: BeneficiaryControlProps<T>) => {
  const { t } = useTranslation();

  // Paths per i campi
  const isMultibeneficiaryPath =
    `${fieldNamePrefix}.${index}.isMultibeneficiary` as Path<T>;
  const sameBeneficiariesAsBeforePath =
    `${fieldNamePrefix}.${index}.sameBeneficiariesAsBefore` as Path<T>;
  const amountPath = `${fieldNamePrefix}.${index}.amount` as Path<T>;

  // Stati locali
  const [hasPreviousBeneficiaries, setHasPreviousBeneficiaries] =
    useState(false);
  const [showBeneficiaryForm, setShowBeneficiaryForm] = useState(index === 0);
  const [beneficiaryAmountError, setBeneficiaryAmountError] = useState<
    string | null
  >(null);

  // Osservazione valori
  const previousMultibeneficiaryPath =
    index > 0
      ? (`${fieldNamePrefix}.${index - 1}.isMultibeneficiary` as Path<T>)
      : null;

  const previousMultibeneficiary =
    index > 0
      ? useWatch({
          control,
          name: previousMultibeneficiaryPath as Path<T>,
          disabled: false
        })
      : null;

  const sameBeneficiariesValue = useWatch({
    control,
    name: sameBeneficiariesAsBeforePath as Path<T>
  }) as unknown as string | boolean;

  // Osserva il valore corrente dell'importo della rata
  const currentAmount = useWatch({
    control,
    name: amountPath
  });

  // Osserva i beneficiari della rata precedente (solo se necessario)
  const previousBeneficiariesPath =
    index > 0
      ? (`${fieldNamePrefix}.${index - 1}.beneficiaries` as Path<T>)
      : null;

  const previousBeneficiaries = previousBeneficiariesPath
    ? useWatch({
        control,
        name: previousBeneficiariesPath
      })
    : null;

  /**
   * Verifica se la somma degli importi dei beneficiari supera l'importo della rata
   */
  const validateBeneficiaryAmounts = () => {
    if (index === 0 || !hasPreviousBeneficiaries) {
      setBeneficiaryAmountError(null);
      return;
    }

    // Verifica se il radio button è impostato su "Sì"
    const currentSameBeneficiariesValue = getValues(
      sameBeneficiariesAsBeforePath
    );
    const useSameBeneficiaries =
      currentSameBeneficiariesValue === true ||
      String(currentSameBeneficiariesValue) === 'true';

    // Se non è impostato su "Sì", nessun errore
    if (!useSameBeneficiaries) {
      setBeneficiaryAmountError(null);
      return;
    }

    const currentAmountStr = getValues(amountPath) || '0';
    const currentAmountValue =
      parseFloat(currentAmountStr.replace(',', '.')) || 0;
    const prevBeneficiariesPath =
      `${fieldNamePrefix}.${index - 1}.beneficiaries` as Path<T>;
    const prevBeneficiaries = getValues(prevBeneficiariesPath) || [];

    // Calcola la somma degli importi dei beneficiari precedenti
    let totalBeneficiaryAmount = 0;
    for (const beneficiary of prevBeneficiaries) {
      // Tipizziamo correttamente il beneficiario
      const beneficiaryAmount =
        beneficiary && typeof beneficiary === 'object'
          ? (beneficiary as { amount?: string }).amount || '0'
          : '0';
      const amount = parseFloat(beneficiaryAmount.replace(',', '.')) || 0;
      totalBeneficiaryAmount += amount;
    }

    // Se la somma degli importi dei beneficiari è maggiore dell'importo della rata, mostra errore
    if (totalBeneficiaryAmount > currentAmountValue) {
      setBeneficiaryAmountError(
        t('debtPositionCreateWizard.step3.beneficiary.sumMustBeLessThanTotal')
      );
    } else {
      setBeneficiaryAmountError(null);
    }
  };

  /**
   * Checks if the previous installment has beneficiaries and manages the interface
   * and beneficiary copying based on configuration.
   */
  useEffect(() => {
    if (index === 0) {
      setHasPreviousBeneficiaries(false);
      return;
    }

    // Check if previous installment has beneficiaries
    const checkPreviousBeneficiaries = () => {
      const previousInstallmentPath =
        `${fieldNamePrefix}.${index - 1}` as Path<T>;
      const previousInstallment = getValues(previousInstallmentPath);

      const previousHasBeneficiaries = !!(
        previousInstallment &&
        previousInstallment.isMultibeneficiary &&
        previousInstallment.beneficiaries &&
        Array.isArray(previousInstallment.beneficiaries) &&
        previousInstallment.beneficiaries.length > 0
      );

      // Update state
      setHasPreviousBeneficiaries(previousHasBeneficiaries);

      // If previous installment does NOT have beneficiaries but this installment has "Yes" in radio buttons,
      // we need to change it to "No" and show the beneficiary form
      if (!previousHasBeneficiaries && isMultibeneficiary) {
        const currentValue = getValues(sameBeneficiariesAsBeforePath);
        // If value is true or "true", change it to false
        if (currentValue === true || String(currentValue) === 'true') {
          setValue(
            sameBeneficiariesAsBeforePath,
            false as unknown as PathValue<T, Path<T>>,
            { shouldDirty: true }
          );
          // Force beneficiary form display
          setShowBeneficiaryForm(true);
        }
      }

      // If there are beneficiaries in the previous installment and we are in multi-beneficiary mode,
      // we can copy beneficiaries at initialization if user selected "Yes"
      if (previousHasBeneficiaries && isMultibeneficiary) {
        const currentValue = getValues(sameBeneficiariesAsBeforePath);
        const shouldCopyBeneficiaries =
          currentValue === true || String(currentValue) === 'true';

        // Check if current installment already has beneficiaries
        const currentBeneficiariesPath =
          `${fieldNamePrefix}.${index}.beneficiaries` as Path<T>;
        const currentBeneficiaries = getValues(currentBeneficiariesPath);
        const hasNoBeneficiaries =
          !currentBeneficiaries ||
          !Array.isArray(currentBeneficiaries) ||
          currentBeneficiaries.length === 0;

        // Update form display state
        setShowBeneficiaryForm(!shouldCopyBeneficiaries);

        // Copy beneficiaries only if:
        // - sameBeneficiariesAsBefore value is true
        // - There are no beneficiaries in current installment yet
        if (shouldCopyBeneficiaries && hasNoBeneficiaries) {
          const previousBeneficiariesPath =
            `${fieldNamePrefix}.${index - 1}.beneficiaries` as Path<T>;
          const previousBeneficiaries = getValues(previousBeneficiariesPath);

          // Set form value explicitly
          setValue(
            currentBeneficiariesPath,
            [...previousBeneficiaries] as unknown as PathValue<T, Path<T>>,
            { shouldDirty: true }
          );
        }
      }
    };

    // Initial check and on every change of previous installment's multi-beneficiary state
    checkPreviousBeneficiaries();
  }, [
    index,
    fieldNamePrefix,
    getValues,
    previousMultibeneficiary,
    isMultibeneficiary,
    setValue,
    sameBeneficiariesAsBeforePath
  ]);

  /**
   * Handles changes to the "same beneficiaries as before" value
   */
  useEffect(() => {
    // For the first installment there are no radio buttons to manage
    if (index === 0) return;

    // Update display state based on radio button value
    const currentValue = getValues(sameBeneficiariesAsBeforePath);
    const valueAsBool =
      currentValue === true || String(currentValue) === 'true';

    // If value is "Yes", hide beneficiary form
    // If value is "No", show beneficiary form
    setShowBeneficiaryForm(!valueAsBool);

    // If value is "Yes" and there are beneficiaries in previous installment, copy them
    if (valueAsBool && hasPreviousBeneficiaries) {
      // Copy beneficiaries from previous installment
      const previousBeneficiariesPath =
        `${fieldNamePrefix}.${index - 1}.beneficiaries` as Path<T>;
      const previousBeneficiaries = getValues(previousBeneficiariesPath);

      // Copy them to current installment
      const currentBeneficiariesPath =
        `${fieldNamePrefix}.${index}.beneficiaries` as Path<T>;
      setValue(
        currentBeneficiariesPath,
        [...previousBeneficiaries] as unknown as PathValue<T, Path<T>>,
        { shouldDirty: true }
      );

      // Validate beneficiary amounts after copying
      setTimeout(() => validateBeneficiaryAmounts(), 0);
    }
  }, [
    index,
    sameBeneficiariesValue,
    fieldNamePrefix,
    getValues,
    setValue,
    hasPreviousBeneficiaries,
    sameBeneficiariesAsBeforePath
  ]);

  // Effetto che si attiva quando cambia l'importo della rata o il valore di sameBeneficiariesAsBefore
  // o quando cambiano i beneficiari della rata precedente
  useEffect(() => {
    validateBeneficiaryAmounts();
  }, [
    currentAmount,
    sameBeneficiariesValue,
    hasPreviousBeneficiaries,
    previousBeneficiaries,
    getValues,
    t
  ]);

  return (
    <>
      {/* Switch for other beneficiaries */}
      <Grid item xs={12}>
        <Controller
          name={isMultibeneficiaryPath}
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  {...field}
                  checked={!!field.value}
                  disabled={disabled}
                  onChange={(e) => {
                    const value = e.target.checked;
                    // Use our specialized handler
                    toggleMultibeneficiary(value);
                  }}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <Typography variant="body2">
                    {t(
                      'debtPositionCreateWizard.step3.installments.otherBeneficiaries'
                    )}
                  </Typography>
                </Box>
              }
            />
          )}
        />
      </Grid>

      {/* Question "Are beneficiaries the same as previous installment?" - only for installments from second onwards */}
      {isMultibeneficiary && index > 0 && (
        <Grid item xs={12}>
          <FormControl component="fieldset" error={!!beneficiaryAmountError}>
            <FormLabel component="legend">
              <Typography variant="body2">
                {t(
                  'debtPositionCreateWizard.step3.installments.sameBeneficiaries'
                )}
              </Typography>
            </FormLabel>
            <Controller
              name={sameBeneficiariesAsBeforePath}
              control={control}
              defaultValue={'true' as unknown as PathValue<T, Path<T>>}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  row
                  onChange={(e) => {
                    const isYes = e.target.value === 'true';
                    field.onChange(isYes as unknown as PathValue<T, Path<T>>);

                    // Immediately update form display state
                    setShowBeneficiaryForm(!isYes);

                    // If user selects "Yes", we will copy beneficiaries from previous installment
                    if (isYes && hasPreviousBeneficiaries) {
                      // Get beneficiaries from previous installment
                      const previousBeneficiariesPath =
                        `${fieldNamePrefix}.${index - 1}.beneficiaries` as Path<T>;
                      const previousBeneficiaries = getValues(
                        previousBeneficiariesPath
                      );

                      // Copy them to current installment
                      const currentBeneficiariesPath =
                        `${fieldNamePrefix}.${index}.beneficiaries` as Path<T>;
                      setValue(
                        currentBeneficiariesPath,
                        [...previousBeneficiaries] as unknown as PathValue<
                          T,
                          Path<T>
                        >,
                        { shouldDirty: true }
                      );

                      // Validate beneficiary amounts after copying
                      setTimeout(() => validateBeneficiaryAmounts(), 0);
                    } else {
                      // Cancella l'errore se l'utente seleziona "No"
                      setBeneficiaryAmountError(null);
                    }
                  }}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="Sì"
                    disabled={!hasPreviousBeneficiaries}
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="No"
                    disabled={!hasPreviousBeneficiaries}
                  />
                </RadioGroup>
              )}
            />
            {beneficiaryAmountError && (
              <FormHelperText error>{beneficiaryAmountError}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      )}

      {/* BeneficiaryField component - visible only when conditions are met */}
      {isMultibeneficiary && showBeneficiaryForm && (
        <Grid item xs={12} mt={1}>
          <BeneficiaryField
            control={control}
            errors={errors}
            isSubmitted={isSubmitted}
            totalAmount={getValues(amountPath) || ''}
            fieldNamePrefix={
              `${fieldNamePrefix}.${index}.beneficiaries` as FieldArrayPath<T>
            }
            disabled={disabled}
            setValue={setValue}
            getValues={getValues}
            trigger={trigger}
            onToggleMultibeneficiary={toggleMultibeneficiary}
            isInsideInstallment={true}
            installmentIndex={index}
            installmentsFieldNamePrefix={fieldNamePrefix}
          />
        </Grid>
      )}

      {/* Informative message when beneficiaries are copied from the previous installment */}
      {isMultibeneficiary &&
        index > 0 &&
        !showBeneficiaryForm &&
        hasPreviousBeneficiaries && (
          <Grid item xs={12} mt={1}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                border: '1px dashed',
                borderColor: 'divider'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                I beneficiari sono stati copiati dalla rata precedente.
              </Typography>
            </Box>
          </Grid>
        )}
    </>
  );
};

export default BeneficiaryControl;
