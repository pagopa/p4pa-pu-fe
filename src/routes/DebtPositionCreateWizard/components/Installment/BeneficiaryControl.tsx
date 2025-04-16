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
import { useState, useEffect, useCallback } from 'react';
import BeneficiaryField from '../Beneficiary/BeneficiaryField';

/**
 * Component that handles the beneficiary control for installments
 * @template T - Type extending FieldValues from react-hook-form
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
}: {
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
}) => {
  const { t } = useTranslation();

  const isMultibeneficiaryPath =
    `${fieldNamePrefix}.${index}.isMultibeneficiary` as Path<T>;
  const sameBeneficiariesAsBeforePath =
    `${fieldNamePrefix}.${index}.sameBeneficiariesAsBefore` as Path<T>;
  const amountPath = `${fieldNamePrefix}.${index}.amount` as Path<T>;

  const [hasPreviousBeneficiaries, setHasPreviousBeneficiaries] =
    useState(false);
  const [showBeneficiaryForm, setShowBeneficiaryForm] = useState(index === 0);
  const [beneficiaryAmountError, setBeneficiaryAmountError] = useState<
    string | null
  >(null);

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

  const currentAmount = useWatch({
    control,
    name: amountPath
  });

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
   * Validates that the sum of beneficiary amounts is less than the installment amount
   */
  const validateBeneficiaryAmounts = useCallback(() => {
    if (index === 0 || !hasPreviousBeneficiaries) {
      setBeneficiaryAmountError(null);
      return;
    }

    const currentSameBeneficiariesValue = getValues(
      sameBeneficiariesAsBeforePath
    );
    const useSameBeneficiaries =
      currentSameBeneficiariesValue === true ||
      String(currentSameBeneficiariesValue) === 'true';

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

    let totalBeneficiaryAmount = 0;
    for (const beneficiary of prevBeneficiaries) {
      const beneficiaryAmount =
        beneficiary && typeof beneficiary === 'object'
          ? (beneficiary as { amount?: string }).amount || '0'
          : '0';
      const amount = parseFloat(beneficiaryAmount.replace(',', '.')) || 0;
      totalBeneficiaryAmount += amount;
    }

    if (totalBeneficiaryAmount >= currentAmountValue) {
      setBeneficiaryAmountError(
        t(
          'debtPositionCreateWizard.step3.beneficiary.sumMustBeLessThanTotalInstallments'
        )
      );
    } else {
      setBeneficiaryAmountError(null);
    }
  }, [
    index,
    hasPreviousBeneficiaries,
    getValues,
    sameBeneficiariesAsBeforePath,
    amountPath,
    fieldNamePrefix,
    t
  ]);

  /**
   * Copies beneficiaries from the previous installment to the current one
   * Looks for the most recent installment with custom beneficiaries first,
   * falling back to the first installment with any beneficiaries if none found
   * @returns {void}
   */
  const copyBeneficiariesFromPreviousInstallment = useCallback(() => {
    if (!hasPreviousBeneficiaries || index === 0) return;

    // Initialize with the directly previous installment
    let sourceIndex = index - 1;
    let lastBeneficiariesFound = false;
    let lastInstallmentWithBeneficiaries = -1;

    // Look for the most recent installment with custom beneficiaries
    // Start from the most recent installment (directly before current)
    // and go backwards
    for (let i = index - 1; i >= 0; i--) {
      const installmentPath = `${fieldNamePrefix}.${i}` as Path<T>;
      const installment = getValues(installmentPath);

      // Check if this installment has custom beneficiaries (not inherited from other installments)
      const hasOwnBeneficiaries =
        installment &&
        installment.isMultibeneficiary &&
        installment.beneficiaries &&
        Array.isArray(installment.beneficiaries) &&
        installment.beneficiaries.length > 0 &&
        (i === 0 ||
          installment.sameBeneficiariesAsBefore === false ||
          installment.sameBeneficiariesAsBefore === 'false');

      if (hasOwnBeneficiaries) {
        lastBeneficiariesFound = true;
        lastInstallmentWithBeneficiaries = i;
        // As soon as we find an installment with custom beneficiaries, use it immediately
        break;
      }
    }

    // If we found an installment with custom beneficiaries, use that one
    if (lastBeneficiariesFound) {
      sourceIndex = lastInstallmentWithBeneficiaries;
    }
    // Otherwise, if no installments with custom beneficiaries were found,
    // fall back to the original behavior and use the first available installment with beneficiaries
    else {
      for (let i = 0; i < index; i++) {
        const installmentPath = `${fieldNamePrefix}.${i}` as Path<T>;
        const installment = getValues(installmentPath);

        // Check if this installment has any beneficiaries
        if (
          installment &&
          installment.isMultibeneficiary &&
          installment.beneficiaries &&
          Array.isArray(installment.beneficiaries) &&
          installment.beneficiaries.length > 0
        ) {
          sourceIndex = i;
          break;
        }
      }
    }

    const previousBeneficiariesPath =
      `${fieldNamePrefix}.${sourceIndex}.beneficiaries` as Path<T>;
    const previousBeneficiaries = getValues(previousBeneficiariesPath);

    const currentBeneficiariesPath =
      `${fieldNamePrefix}.${index}.beneficiaries` as Path<T>;

    // Create a deep copy of all beneficiaries to avoid shared references
    const deepCopyOfBeneficiaries = Array.isArray(previousBeneficiaries)
      ? previousBeneficiaries.map((beneficiary: Record<string, unknown>) => ({
          ...beneficiary
        }))
      : [];

    setValue(
      currentBeneficiariesPath,
      deepCopyOfBeneficiaries as unknown as PathValue<T, Path<T>>,
      { shouldDirty: true }
    );

    validateBeneficiaryAmounts();
  }, [
    hasPreviousBeneficiaries,
    index,
    fieldNamePrefix,
    getValues,
    setValue,
    validateBeneficiaryAmounts
  ]);

  /**
   * Checks if the previous installment has beneficiaries and manages the interface
   * and beneficiary copying based on configuration
   * @returns {void}
   */
  useEffect(() => {
    if (index === 0) {
      setHasPreviousBeneficiaries(false);
      return;
    }

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

      setHasPreviousBeneficiaries(previousHasBeneficiaries);

      if (!previousHasBeneficiaries && isMultibeneficiary) {
        const currentValue = getValues(sameBeneficiariesAsBeforePath);

        if (currentValue === true || String(currentValue) === 'true') {
          setValue(
            sameBeneficiariesAsBeforePath,
            false as unknown as PathValue<T, Path<T>>,
            { shouldDirty: true }
          );
          setShowBeneficiaryForm(true);
        }
      }

      if (previousHasBeneficiaries && isMultibeneficiary) {
        const currentValue = getValues(sameBeneficiariesAsBeforePath);
        const shouldCopyBeneficiaries =
          currentValue === true || String(currentValue) === 'true';

        const currentBeneficiariesPath =
          `${fieldNamePrefix}.${index}.beneficiaries` as Path<T>;
        const currentBeneficiaries = getValues(currentBeneficiariesPath);
        const hasNoBeneficiaries =
          !currentBeneficiaries ||
          !Array.isArray(currentBeneficiaries) ||
          currentBeneficiaries.length === 0;

        setShowBeneficiaryForm(!shouldCopyBeneficiaries);

        if (shouldCopyBeneficiaries && hasNoBeneficiaries) {
          copyBeneficiariesFromPreviousInstallment();
        }
      }
    };

    checkPreviousBeneficiaries();
  }, [
    index,
    fieldNamePrefix,
    getValues,
    previousMultibeneficiary,
    isMultibeneficiary,
    setValue,
    sameBeneficiariesAsBeforePath,
    copyBeneficiariesFromPreviousInstallment
  ]);

  /**
   * Handles changes to the "same beneficiaries as before" value
   * Updates the UI and copies beneficiaries when appropriate
   * @returns {void}
   */
  useEffect(() => {
    if (index === 0) return;

    const currentValue = getValues(sameBeneficiariesAsBeforePath);
    const valueAsBool =
      currentValue === true || String(currentValue) === 'true';

    setShowBeneficiaryForm(!valueAsBool);

    if (valueAsBool && hasPreviousBeneficiaries) {
      copyBeneficiariesFromPreviousInstallment();
    }
  }, [
    index,
    sameBeneficiariesValue,
    fieldNamePrefix,
    getValues,
    hasPreviousBeneficiaries,
    sameBeneficiariesAsBeforePath,
    copyBeneficiariesFromPreviousInstallment
  ]);

  /**
   * Validates beneficiary amounts when relevant form values change
   * @returns {void}
   */
  useEffect(() => {
    validateBeneficiaryAmounts();
  }, [
    currentAmount,
    sameBeneficiariesValue,
    hasPreviousBeneficiaries,
    previousBeneficiaries,
    validateBeneficiaryAmounts
  ]);

  return (
    <>
      {/* Switch for enabling multiple beneficiaries */}
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

                    setShowBeneficiaryForm(!isYes);

                    if (isYes && hasPreviousBeneficiaries) {
                      copyBeneficiariesFromPreviousInstallment();

                      validateBeneficiaryAmounts();

                      setTimeout(() => {
                        validateBeneficiaryAmounts();
                      }, 100);
                    } else {
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
      {/* {isMultibeneficiary &&
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
                Beneficiaries have been copied from the previous installment.
              </Typography>
            </Box>
          </Grid>
        )} */}
    </>
  );
};

export default BeneficiaryControl;
