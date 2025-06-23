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
import {
  isSameBeneficiariesAsBeforeEnabled,
  hasValidBeneficiaries
} from '../../../../models/Step3Schema';

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
  toggleMultibeneficiary,
  isEditing = false
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
  isEditing?: boolean;
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

    const useSameBeneficiaries = isSameBeneficiariesAsBeforeEnabled(
      currentSameBeneficiariesValue
    );

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
   * Copies beneficiaries from the previous installment to the current one.
   * First looks for the most recent installment with custom beneficiaries,
   * falling back to the first installment with any beneficiaries if none found.
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
        hasValidBeneficiaries(installment) &&
        (i === 0 ||
          !isSameBeneficiariesAsBeforeEnabled(
            installment.sameBeneficiariesAsBefore
          ));

      if (hasOwnBeneficiaries) {
        lastBeneficiariesFound = true;
        lastInstallmentWithBeneficiaries = i;
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
          hasValidBeneficiaries(installment)
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

    // Get current and previous installment for amount ratio calculation
    const currentInstallmentPath = `${fieldNamePrefix}.${index}` as Path<T>;
    const sourceInstallmentPath =
      `${fieldNamePrefix}.${sourceIndex}` as Path<T>;
    const currentInstallment = getValues(currentInstallmentPath);
    const sourceInstallment = getValues(sourceInstallmentPath);

    // Calculate the ratio between the installment amounts
    const currentAmount = parseFloat(currentInstallment.amount);
    const sourceAmount = parseFloat(sourceInstallment.amount);
    const ratio = currentAmount / sourceAmount;

    // Create a deep copy of all beneficiaries and adjust amounts based on ratio
    let deepCopyOfBeneficiaries = Array.isArray(previousBeneficiaries)
      ? previousBeneficiaries.map((beneficiary: Record<string, unknown>) => ({
          ...beneficiary
        }))
      : [];

    // If we have valid amounts, adjust beneficiary amounts proportionally
    if (
      !isNaN(ratio) &&
      ratio > 0 &&
      !isNaN(currentAmount) &&
      !isNaN(sourceAmount)
    ) {
      deepCopyOfBeneficiaries = deepCopyOfBeneficiaries.map(
        (beneficiary: Record<string, unknown>) => {
          const beneficiaryAmount = parseFloat(beneficiary.amount as string);
          if (!isNaN(beneficiaryAmount)) {
            return {
              ...beneficiary,
              amount: (beneficiaryAmount * ratio).toFixed(2)
            };
          }
          return beneficiary;
        }
      );
    }

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

      // Use hasValidBeneficiaries function to check for valid beneficiaries
      const previousHasBeneficiaries = !!(
        previousInstallment &&
        previousInstallment.isMultibeneficiary &&
        hasValidBeneficiaries(previousInstallment)
      );

      setHasPreviousBeneficiaries(previousHasBeneficiaries);

      if (!previousHasBeneficiaries && isMultibeneficiary) {
        const currentValue = getValues(sameBeneficiariesAsBeforePath);

        if (isSameBeneficiariesAsBeforeEnabled(currentValue)) {
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

        // If the value is undefined (never set) and we're not in editing mode,
        // automatically set the default to true to copy beneficiaries
        if (currentValue === undefined && !isEditing) {
          setValue(
            sameBeneficiariesAsBeforePath,
            true as unknown as PathValue<T, Path<T>>,
            { shouldDirty: true }
          );
          return;
        }

        const shouldCopyBeneficiaries =
          isSameBeneficiariesAsBeforeEnabled(currentValue);

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
    copyBeneficiariesFromPreviousInstallment,
    isEditing
  ]);

  /**
   * Updates the UI and copies beneficiaries when appropriate
   */
  useEffect(() => {
    if (index === 0) return;

    // In editing mode, always show beneficiary form and don't use radio logic
    if (isEditing) {
      setShowBeneficiaryForm(true);
      return;
    }

    const currentValue = getValues(sameBeneficiariesAsBeforePath);
    const valueAsBool = isSameBeneficiariesAsBeforeEnabled(currentValue);

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
    copyBeneficiariesFromPreviousInstallment,
    isEditing
  ]);

  /**
   * Validates beneficiary amounts when relevant form values change
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
      <Grid item xs={12} data-testid="multibeneficiary-switch">
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

      {/* Radio buttons for beneficiary reuse - hidden in edit mode */}
      {isMultibeneficiary && hasPreviousBeneficiaries && !isEditing && (
        <Grid item xs={12} data-testid="same-beneficiaries-radio">
          <Controller
            name={sameBeneficiariesAsBeforePath}
            control={control}
            render={({ field }) => (
              <FormControl
                component="fieldset"
                error={!!beneficiaryAmountError}
              >
                <FormLabel component="legend">
                  <Typography variant="body2" color="text.primary">
                    {t(
                      'debtPositionCreateWizard.step3.installments.sameBeneficiaries'
                    )}
                  </Typography>
                </FormLabel>
                <RadioGroup
                  {...field}
                  row
                  value={String(
                    field.value === undefined ? 'true' : field.value
                  )}
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

                      // If we're switching from "yes" to "no", make sure we reset the beneficiaries
                      if (!isYes) {
                        const currentBeneficiariesPath =
                          `${fieldNamePrefix}.${index}.beneficiaries` as Path<T>;

                        // Reset beneficiaries to empty array
                        setValue(
                          currentBeneficiariesPath,
                          [] as unknown as PathValue<T, Path<T>>,
                          { shouldDirty: true, shouldValidate: true }
                        );

                        // After removing beneficiaries, trigger validation of the entire form
                        // to remove any residual errors
                        setTimeout(() => {
                          trigger();
                        }, 50);

                        // Add a default empty beneficiary only if we'll show the beneficiary form
                        // (in this specific case we don't want to create beneficiaries that will be empty and trigger errors)
                        if (showBeneficiaryForm) {
                          setTimeout(() => {
                            const defaultBeneficiary = {
                              entityName: '',
                              amount: '',
                              taxCode: '',
                              remittance: '',
                              iban: '',
                              taxonomyCode: '',
                              isNew: true
                            };

                            setValue(
                              currentBeneficiariesPath,
                              [defaultBeneficiary] as unknown as PathValue<
                                T,
                                Path<T>
                              >,
                              { shouldDirty: true, shouldValidate: true }
                            );
                          }, 100);
                        }
                      }
                    }
                  }}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label={t('debtPositionCreateWizard.step3.installments.yes')}
                    disabled={!hasPreviousBeneficiaries}
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label={t('debtPositionCreateWizard.step3.installments.no')}
                    disabled={!hasPreviousBeneficiaries}
                  />
                </RadioGroup>
                {beneficiaryAmountError && (
                  <FormHelperText error>
                    {beneficiaryAmountError}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
      )}

      {isMultibeneficiary && showBeneficiaryForm && (
        <Grid item xs={12} mt={1} data-testid="beneficiary-field">
          <BeneficiaryField
            control={control}
            errors={errors}
            isSubmitted={isSubmitted}
            totalAmount={getValues(amountPath) || ''}
            fieldNamePrefix={
              `${fieldNamePrefix}.${index}.beneficiaries` as FieldArrayPath<T>
            }
            disabled={false}
            setValue={setValue}
            getValues={getValues}
            trigger={trigger}
            onToggleMultibeneficiary={toggleMultibeneficiary}
            isInsideInstallment={true}
            installmentIndex={index}
            installmentsFieldNamePrefix={fieldNamePrefix}
            isEditing={isEditing}
          />
        </Grid>
      )}
    </>
  );
};

export default BeneficiaryControl;
