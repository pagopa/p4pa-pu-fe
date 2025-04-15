import {
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Controller,
  useForm,
  Path,
  UseFormTrigger,
  FieldValues
} from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import WizardStepButtons from '../../../../components/Wizard/WizardStepButtons';
import SectionBox from '../../../../components/Wizard/SectionBox';
import ArticleIcon from '@mui/icons-material/Article';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import BeneficiaryField from '../Beneficiary/BeneficiaryField';
import InstallmentField from '../Installment/InstallmentField';
import type {
  Beneficiary,
  Installment,
  PaymentOption
} from '../../../../models/paymentTypes';
import {
  createAmountValidator,
  isBeneficiariesTotalValid,
  createDateValidator
} from '../../../../utils/fieldValidation';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { PageRoutes } from '../../../../App';
import { BeneficiaryFieldRef } from '../Beneficiary/BeneficiaryField';

export type Step3Data = {
  paymentObject: { value: string; readonly: boolean };
  paymentOption: { value: PaymentOption; readonly: boolean };
  amount: { value: string; readonly: boolean };
  dueDate: { value: string | null; readonly: boolean };
  flagMandatoryDueDate: boolean;
  isMultibeneficiary: { value: boolean; readonly: boolean };
  beneficiaries?: Array<Beneficiary>;
  installments?: Array<Installment>;
};

type Props = {
  data: Step3Data;
  setData: (data: Step3Data) => void;
  onNext: () => void;
  onBack: () => void;
};

type FormValues = {
  paymentObject: { value: string; readonly: boolean };
  paymentOption: { value: PaymentOption; readonly: boolean };
  amount: { value: string; readonly: boolean };
  dueDate: { value: Date | null; readonly: boolean };
  isMultibeneficiary: { value: boolean; readonly: boolean };
  beneficiaries?: Array<Beneficiary>;
  installments?: Array<Installment>;
};

// Function extracted to reduce nesting
function triggerValidationForAllBeneficiaries<T extends FieldValues>(
  beneficiaries: Array<Record<string, unknown>>,
  trigger: UseFormTrigger<T>
) {
  beneficiaries.forEach((_, index) => {
    trigger(`beneficiaries.${index}.amount` as Path<T>);
  });
}

// Function to trigger validation for all beneficiaries across all installments
function triggerValidationForAllInstallmentBeneficiaries<T extends FieldValues>(
  installments: Array<Record<string, unknown>>,
  trigger: UseFormTrigger<T>
) {
  installments.forEach((installment, installmentIndex) => {
    if (installment.isMultibeneficiary) {
      const installmentBeneficiaries =
        (installment.beneficiaries as Array<Record<string, unknown>>) || [];

      installmentBeneficiaries.forEach(
        (_: Record<string, unknown>, beneficiaryIndex: number) => {
          const path =
            `installments.${installmentIndex}.beneficiaries.${beneficiaryIndex}.amount` as Path<T>;
          trigger(path);
        }
      );
    }
  });
}

// Function to validate payment fields (IBAN and postalAccount)
function triggerPaymentFieldsValidation<T extends FieldValues>(
  installments: Array<Record<string, unknown>>,
  trigger: UseFormTrigger<T>
) {
  installments.forEach((installment, installmentIndex) => {
    if (installment.isMultibeneficiary) {
      const installmentBeneficiaries =
        (installment.beneficiaries as Array<Record<string, unknown>>) || [];

      installmentBeneficiaries.forEach(
        (_: Record<string, unknown>, beneficiaryIndex: number) => {
          // IBAN validation
          const ibanPath =
            `installments.${installmentIndex}.beneficiaries.${beneficiaryIndex}.iban` as Path<T>;
          trigger(ibanPath);

          // Postal account validation
          const postalAccountPath =
            `installments.${installmentIndex}.beneficiaries.${beneficiaryIndex}.postalAccount` as Path<T>;
          trigger(postalAccountPath);
        }
      );
    }
  });
}

const Step3 = ({ data, setData, onBack }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Convert date string value to Date object for DatePicker
  const initialData: FormValues = {
    ...data,
    dueDate: {
      ...data.dueDate,
      value: data.dueDate?.value ? new Date(data.dueDate.value) : null
    },
    paymentOption: {
      ...data.paymentOption,
      value: data.paymentOption.value as PaymentOption
    },
    beneficiaries: data.beneficiaries || [],
    installments: data.installments || []
  };

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitted },
    watch,
    setValue,
    trigger,
    getValues
  } = useForm<FormValues>({
    defaultValues: initialData,
    mode: 'onChange'
  });
  const isMultibeneficiary = watch('isMultibeneficiary.value');
  const totalAmount = watch('amount.value');
  const beneficiaries = watch('beneficiaries') || [];
  const paymentOption = watch('paymentOption.value');

  const isInstallment = paymentOption === 'INSTALLMENTS';

  // Effect to handle beneficiaries initialization
  useEffect(() => {
    const currentBeneficiaries = getValues('beneficiaries') || [];
    // Initialize beneficiaries only if switch is active and there are no beneficiaries yet
    if (isMultibeneficiary && currentBeneficiaries.length === 0) {
      setValue(
        'beneficiaries',
        [
          {
            entityName: '',
            amount: '',
            taxCode: '',
            iban: '',
            postalAccount: '',
            taxonomyCode: ''
          }
        ],
        { shouldDirty: true }
      );
    } else if (!isMultibeneficiary) {
      setValue('beneficiaries', []);
    }
  }, [isMultibeneficiary, setValue, getValues]);

  // Handle total amount update when installments change
  const handleInstallmentsChange = (totalAmount: string) => {
    setValue('amount.value', totalAmount);
  };

  // Reference to BeneficiaryField component to access its methods
  const beneficiaryFieldRef = useRef<BeneficiaryFieldRef>({});

  // Handle multi-beneficiary toggle switch
  const handleMultibeneficiaryToggle = (value: boolean) => {
    setValue('isMultibeneficiary.value', value);

    // If disabling multi-beneficiary, reset beneficiaries
    if (
      !value &&
      beneficiaryFieldRef.current &&
      beneficiaryFieldRef.current.resetAllBeneficiaries
    ) {
      beneficiaryFieldRef.current.resetAllBeneficiaries();
    }
  };

  const onSubmit = async (values: FormValues) => {
    const currentBeneficiaries = getValues('beneficiaries') || [];
    // Validate beneficiaries total amount
    if (
      isMultibeneficiary &&
      !isBeneficiariesTotalValid(currentBeneficiaries, totalAmount)
    ) {
      trigger('beneficiaries');
      return;
    }
    // Validate beneficiaries for each installment if payment is installment
    if (isInstallment) {
      const installments = getValues('installments') || [];
      let hasInvalidBeneficiaries = false;
      let hasInvalidPaymentFields = false;
      let hasInvalidAmounts = false;
      // Check each installment
      for (let i = 0; i < installments.length; i++) {
        const installment = installments[i];
        // Validate installment amount
        if (!installment.amount || parseFloat(installment.amount) <= 0) {
          hasInvalidAmounts = true;
        }
        if (installment.isMultibeneficiary) {
          const beneficiaries = installment.beneficiaries || [];
          // Check beneficiaries structure
          beneficiaries.forEach((b: Record<string, unknown>, idx: number) => {
            // Fix format if needed
            if (
              typeof b.amount !== 'string' &&
              b.amount !== null &&
              b.amount !== undefined
            ) {
              beneficiaries[idx].amount = String(b.amount);
            }
            // Validate payment fields (IBAN or postalAccount required)
            const iban = typeof b.iban === 'string' ? b.iban : '';
            const postalAccount =
              typeof b.postalAccount === 'string' ? b.postalAccount : '';
            if (
              (!iban || iban.trim() === '') &&
              (!postalAccount || postalAccount.trim() === '')
            ) {
              hasInvalidPaymentFields = true;
            }
          });

          // Validate beneficiaries total matches installment amount
          try {
            const isValid = isBeneficiariesTotalValid(
              beneficiaries,
              installment.amount
            );

            if (!isValid) {
              hasInvalidBeneficiaries = true;
            }
          } catch (error) {
            hasInvalidBeneficiaries = true;
          }
        }
      }

      // If any validation fails, trigger form validation and stop submission
      if (
        hasInvalidAmounts ||
        hasInvalidBeneficiaries ||
        hasInvalidPaymentFields
      ) {
        try {
          // Trigger installment amounts validation
          installments.forEach((_: Record<string, unknown>, index: number) => {
            trigger(`installments.${index}.amount` as Path<FormValues>);
          });

          // Trigger validation for all beneficiaries in all installments
          triggerValidationForAllInstallmentBeneficiaries(
            installments,
            trigger
          );

          // Trigger payment fields validation
          triggerPaymentFieldsValidation(installments, trigger);
        } catch (error) {
          // Error caught but not logged
        }
        return;
      }
    }

    // Format values for saving
    const formattedValues: Step3Data = {
      ...values,
      dueDate: {
        ...values.dueDate,
        value:
          values.dueDate.value instanceof Date
            ? formatDate(values.dueDate.value.toISOString())
            : values.dueDate.value
      },
      flagMandatoryDueDate: data.flagMandatoryDueDate,
      // Include beneficiaries only if multi-beneficiary is true and not installment
      ...(!isInstallment && values.isMultibeneficiary.value
        ? { beneficiaries: values.beneficiaries }
        : {}),
      // Include installments only if payment option is installment
      ...(isInstallment ? { installments: values.installments } : {})
    };
    // Save data
    setData(formattedValues);
    // Navigate to completion page
    navigate(PageRoutes.DEBT_POSITION_CREATE_WIZARD_COMPLETED, {
      state: { paymentObject: formattedValues.paymentObject.value },
      replace: true
    });
  };

  const validateAmount = createAmountValidator(t);
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <WizardStepWrapper
        title={t('debtPositionCreateWizard.configurationAlert.title')}
        subtitle={t('debtPositionCreateWizard.configurationAlert.subtitle')}
      >
        <SectionBox
          title={t('debtPositionCreateWizard.step3.title')}
          adornment={<ArticleIcon />}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="paymentObject.value"
                control={control}
                rules={{
                  required: t(
                    'debtPositionCreateWizard.step3.paymentObject.required'
                  )
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t(
                      'debtPositionCreateWizard.step3.paymentObject.label'
                    )}
                    required
                    disabled={data.paymentObject?.readonly}
                    error={isSubmitted && !!errors.paymentObject?.value}
                    helperText={
                      isSubmitted && errors.paymentObject?.value?.message
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="paymentOption.value"
                control={control}
                rules={{
                  required: t(
                    'debtPositionCreateWizard.step3.paymentOption.required'
                  )
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label={t(
                      'debtPositionCreateWizard.step3.paymentOption.label'
                    )}
                    required
                    disabled={data.paymentOption?.readonly}
                    error={isSubmitted && !!errors.paymentOption?.value}
                    helperText={
                      isSubmitted && errors.paymentOption?.value?.message
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);

                      switch (value) {
                        case 'INSTALLMENTS':
                          // When installment option is selected
                          // Disable multi-beneficiary mode
                          setValue('isMultibeneficiary.value', false);
                          // Reset amount field
                          setValue('amount.value', '');
                          // Reset installments array for proper initialization
                          setValue('installments', []);
                          break;
                        case 'SINGLE':
                          if (paymentOption === 'INSTALLMENTS') {
                            setValue('amount.value', '');
                            setValue('installments', []);
                          }
                          break;
                      }
                    }}
                  >
                    <MenuItem value="SINGLE">
                      {t('debtPositionCreateWizard.step3.paymentOption.single')}
                    </MenuItem>
                    <MenuItem value="INSTALLMENTS">
                      {t(
                        'debtPositionCreateWizard.step3.paymentOption.installments'
                      )}
                    </MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="amount.value"
                control={control}
                rules={validateAmount}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('debtPositionCreateWizard.step3.amount.label')}
                    required
                    disabled={data.amount?.readonly || isInstallment}
                    value={
                      field.value
                        ? field.value.toString().replace('.', ',')
                        : ''
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">€</InputAdornment>
                      ),
                      inputProps: {
                        style: { textAlign: 'left' },
                        onWheel: (e) =>
                          e.target instanceof HTMLElement && e.target.blur() // Remove focus when mouse wheel is used
                      }
                    }}
                    error={
                      isSubmitted && !!errors.amount?.value && !isInstallment
                    }
                    helperText={
                      isInstallment
                        ? t(
                            'debtPositionCreateWizard.step3.amount.installmentHelperText'
                          )
                        : isSubmitted && errors.amount?.value?.message
                    }
                    onChange={(e) => {
                      // Accept only numbers, dot and comma
                      const filteredValue = e.target.value.replace(
                        /[^0-9.,]/g,
                        ''
                      );
                      // Convert comma to dot for numeric handling
                      const normalizedValue = filteredValue.replace(',', '.');
                      // Update form value
                      field.onChange(normalizedValue);

                      // Use setTimeout to ensure value is updated before validation
                      if (isMultibeneficiary && beneficiaries.length > 0) {
                        setTimeout(() => {
                          triggerValidationForAllBeneficiaries(
                            beneficiaries,
                            trigger
                          );
                        }, 0);
                      }
                    }}
                    onBlur={(e) => {
                      // Format value with two decimals when field loses focus
                      const value = e.target.value.replace(',', '.');
                      if (value && !isNaN(parseFloat(value))) {
                        const formatted = parseFloat(value).toFixed(2);
                        field.onChange(formatted);
                      }
                      field.onBlur();
                    }}
                  />
                )}
              />
            </Grid>

            {/* Show due date field only if NOT in installment mode */}
            {!isInstallment && (
              <Grid item xs={12}>
                <Controller
                  name="dueDate.value"
                  control={control}
                  rules={createDateValidator(
                    t,
                    data.flagMandatoryDueDate,
                    t('debtPositionCreateWizard.step3.dueDate.required')
                  )}
                  render={({ field: { onChange, value, ...field } }) => (
                    <DatePicker
                      {...field}
                      value={value}
                      label={t('debtPositionCreateWizard.step3.dueDate.label')}
                      disabled={data.dueDate?.readonly}
                      minDate={new Date()}
                      format="dd/MM/yyyy"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: data.flagMandatoryDueDate,
                          error: isSubmitted && !!errors.dueDate?.value,
                          helperText:
                            isSubmitted && errors.dueDate?.value?.message
                        },
                        actionBar: {
                          actions: ['clear']
                        }
                      }}
                      onChange={(date) => {
                        onChange(date);
                      }}
                    />
                  )}
                />
              </Grid>
            )}

            {/* Show multi-beneficiary switch only if NOT in installment mode */}
            {!isInstallment && (
              <Grid item xs={12}>
                <Controller
                  name="isMultibeneficiary.value"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          {...field}
                          checked={field.value}
                          disabled={data.isMultibeneficiary?.readonly}
                          onChange={(e) => {
                            const value = e.target.checked;
                            handleMultibeneficiaryToggle(value);
                          }}
                        />
                      }
                      label={t(
                        'debtPositionCreateWizard.step3.isMultibeneficiary.label'
                      )}
                    />
                  )}
                />
              </Grid>
            )}

            {/* Beneficiary component - visible only when multi-beneficiary is true AND not in installment mode */}
            {isMultibeneficiary && !isInstallment && (
              <Grid item xs={12} mt={2}>
                <BeneficiaryField<FormValues>
                  ref={beneficiaryFieldRef}
                  control={control}
                  errors={errors}
                  isSubmitted={isSubmitted}
                  totalAmount={totalAmount}
                  fieldNamePrefix="beneficiaries"
                  disabled={false}
                  setValue={setValue}
                  getValues={getValues}
                  trigger={trigger}
                  onToggleMultibeneficiary={handleMultibeneficiaryToggle}
                />
              </Grid>
            )}
          </Grid>
        </SectionBox>
      </WizardStepWrapper>
      {/* Installments component - visible only when installment option is selected */}
      {isInstallment && (
        <InstallmentField<FormValues>
          control={control}
          errors={errors}
          isSubmitted={isSubmitted}
          fieldNamePrefix="installments"
          disabled={false}
          flagMandatoryDueDate={data.flagMandatoryDueDate}
          setValue={setValue}
          getValues={getValues}
          trigger={trigger}
          onInstallmentsChange={handleInstallmentsChange}
        />
      )}
      <WizardStepButtons
        onBack={onBack}
        onNext={handleSubmit(onSubmit)}
        disableNext={false}
        nextLabel="commons.create"
      />
    </form>
  );
};

export default Step3;
