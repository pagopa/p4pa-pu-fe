import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller, Resolver, FieldErrors } from 'react-hook-form';
import {
  Grid,
  MenuItem,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  Box
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { z } from 'zod';
import WizardStepButtons from '../../../../components/Wizard/WizardStepButtons';
import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { SubjectType } from '../../../../utils/fieldValidation';
import { Step2Data } from '../../../../models/DebtPositionType';
import { createNestedStep2AddDebtorSchema } from '../../../../models/Step2AddDebtorSchema';

type Step2DataField = keyof Step2Data;
type NestedFieldName = `${Step2DataField}.value`;

type Props = {
  data: Step2Data;
  setData: (data: Step2Data) => void;
  onNext: () => void;
  onBack?: () => void;
  isEditing?: boolean;
  flagAnonymousFiscalCode?: boolean;
};

type FieldErrorValue = {
  type: string;
  message: string;
};

type NestedFieldErrors<T> = {
  [K in keyof T]?: {
    value?: FieldErrorValue;
  };
};

const Step2AddDebtor = ({
  data,
  setData,
  onNext,
  onBack,
  isEditing,
  flagAnonymousFiscalCode = false
}: Props) => {
  const { t } = useTranslation();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Don't initialize defaults in edit mode - data comes from API
    if (!isEditing) {
      initializeDefaultValues();
    }
  }, [data, setData, isEditing]);

  const initializeDefaultValues = () => {
    let hasUpdates = false;
    const updatedData = { ...data };

    // Initialize string fields with empty value
    const stringFields = [
      'address',
      'civicNumber',
      'zipCode',
      'province',
      'city'
    ] as const;

    stringFields.forEach((field) => {
      if (!updatedData[field]) {
        updatedData[field] = { value: '', readonly: false };
        hasUpdates = true;
      }
    });

    // Initialize country with 'IT' default
    if (!updatedData.country) {
      updatedData.country = { value: 'IT', readonly: false };
      hasUpdates = true;
    } else if (updatedData.country.value === '') {
      updatedData.country.value = 'IT';
      hasUpdates = true;
    }

    // Initialize anonymousSubject ONLY if completely missing
    // Don't overwrite if it exists (even if false) to preserve edit mode data
    if (updatedData.anonymousSubject === undefined) {
      updatedData.anonymousSubject = { value: false, readonly: false };
      hasUpdates = true;
    }

    if (hasUpdates) {
      setData(updatedData);
    }
  };

  const schema = createNestedStep2AddDebtorSchema(t);

  const createFieldError = (message: string): FieldErrorValue => ({
    type: 'validation',
    message
  });

  const transformZodErrors = (zodError: z.ZodError, values: Step2Data) => {
    const customizeErrorMessage = (
      fieldName: Step2DataField,
      message: string,
      subjectType?: string
    ): string => {
      if (fieldName === 'taxCode' && subjectType === SubjectType.BUSINESS) {
        if (message === t('debtPositionCreateWizard.step2.taxCode.required')) {
          return t('debtPositionCreateWizard.step2.vat.required');
        }
      }

      if (fieldName === 'fullName' && subjectType === SubjectType.BUSINESS) {
        if (message === t('debtPositionCreateWizard.step2.fullName.required')) {
          return t('debtPositionCreateWizard.step2.companyName.required');
        }
        if (
          message === t('debtPositionCreateWizard.step2.fullName.minTwoWords')
        ) {
          return t('debtPositionCreateWizard.step2.companyName.minTwoWords');
        }
      }

      return message;
    };

    return zodError.errors.reduce(
      (formErrors: NestedFieldErrors<Step2Data>, error) => {
        const path = error.path;

        if (path.length >= 2 && path[1] === 'value') {
          const fieldName = path[0] as Step2DataField;

          const customMessage = customizeErrorMessage(
            fieldName,
            error.message,
            values.subjectType?.value
          );

          formErrors[fieldName] = {
            value: createFieldError(customMessage)
          };
        }

        return formErrors;
      },
      {}
    );
  };

  const zodFormResolver: Resolver<Step2Data> = async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return { values, errors: {} };
    }

    return {
      values: {},
      errors: transformZodErrors(result.error, values) as FieldErrors<Step2Data>
    };
  };

  const {
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitted },
    trigger,
    clearErrors,
    setValue,
    reset
  } = useForm<Step2Data>({
    defaultValues: {
      ...data,
      country: {
        ...data.country,
        value: data.country?.value || 'IT'
      },
      anonymousSubject: {
        ...data.anonymousSubject,
        value: data.anonymousSubject?.value ?? false
      }
    },
    resolver: zodFormResolver,
    mode: 'onChange'
  });

  // Reset form values when edit data is loaded - only once
  useEffect(() => {
    if (
      isEditing &&
      data &&
      data.taxCode?.value &&
      !hasInitializedRef.current
    ) {
      hasInitializedRef.current = true;
      const resetData = {
        ...data,
        country: {
          ...data.country,
          value: data.country?.value || 'IT'
        },
        anonymousSubject: {
          ...data.anonymousSubject,
          value: data.anonymousSubject?.value ?? false
        }
      };
      reset(resetData, { keepDefaultValues: false });

      // Force setValue for anonymousSubject to ensure it's updated
      setValue(
        'anonymousSubject.value',
        data.anonymousSubject?.value ?? false,
        { shouldValidate: false }
      );
    }
  }, [isEditing, data?.taxCode?.value, data?.anonymousSubject?.value]);

  const subjectTypeValue = watch('subjectType.value') || '';

  // Track previous subject type to detect changes
  const prevSubjectTypeRef = useRef(subjectTypeValue);

  useEffect(() => {
    if (isSubmitted) {
      trigger('taxCode.value');
      trigger('fullName.value');
    }

    // Clean taxCode when subject type changes (e.g., from INDIVIDUAL to BUSINESS or vice versa)
    if (
      prevSubjectTypeRef.current &&
      prevSubjectTypeRef.current !== subjectTypeValue
    ) {
      setValue('taxCode.value', '');
    }

    // Update ref with current value
    prevSubjectTypeRef.current = subjectTypeValue;
  }, [subjectTypeValue, trigger, isSubmitted, setValue]);

  const handleFieldChange = async (
    fieldName: NestedFieldName,
    value: string
  ) => {
    setValue(fieldName, value);
    if (isSubmitted) {
      const isFieldValid = await trigger(fieldName);
      if (isFieldValid) {
        clearErrors(fieldName);
      }
    }
  };

  const handleSubjectTypeChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    setValue('subjectType.value', newValue);
    await trigger('taxCode.value');
    await trigger('fullName.value');
  };

  const onSubmit = async (values: Step2Data) => {
    const submittedData = { ...values };

    // If user is anonymous, set taxCode to 'ANONIMO' in the payload
    if (submittedData.anonymousSubject?.value === true) {
      submittedData.taxCode = {
        value: 'ANONIMO',
        readonly: submittedData.taxCode.readonly
      };
    }
    console.log('submittedData', submittedData);
    setData(submittedData);
    onNext();
  };

  /**
   * Helper function to determine if a field should be disabled in editing mode
   * In editing mode:
   * - Fiscal data fields (subjectType, taxCode) should remain disabled
   * - Personal data fields should be editable
   */
  const isFieldDisabled = (fieldType: 'fiscal' | 'personal') => {
    if (!isEditing) return false;
    return fieldType === 'fiscal'; // Only fiscal fields are disabled in editing mode
  };

  const getTaxCodeLabel = () => {
    return subjectTypeValue === SubjectType.BUSINESS
      ? t('debtPositionCreateWizard.step2.vat.label')
      : t('debtPositionCreateWizard.step2.taxCode.label');
  };

  const getTaxCodePlaceholder = () => {
    return subjectTypeValue === SubjectType.BUSINESS
      ? t('debtPositionCreateWizard.step2.vat.placeholder')
      : t('debtPositionCreateWizard.step2.taxCode.placeholder');
  };

  const getCompanyNameLabel = () => {
    return subjectTypeValue === SubjectType.BUSINESS
      ? t('debtPositionCreateWizard.step2.companyName.label')
      : t('debtPositionCreateWizard.step2.fullName.label');
  };

  /**
   * Helper function to determine if the anonymous subject switch should be disabled
   * The switch is disabled when:
   * - The subject type is BUSINESS (legal entity)
   * - Or in editing mode (fiscal data cannot be changed)
   */
  const isAnonymousSubjectDisabled = () => {
    return (
      subjectTypeValue === SubjectType.BUSINESS || isFieldDisabled('fiscal')
    );
  };

  /**
   * Helper function to determine if the tax code field should be shown
   * The field is hidden when ALL these conditions are met:
   * - flagAnonymousFiscalCode is true (debt type allows anonymous)
   * - Subject type is INDIVIDUAL (person, not business)
   * - Anonymous subject switch is enabled
   */
  const shouldShowTaxCodeField = () => {
    const anonymousSubjectValue = watch('anonymousSubject.value') || false;

    return !(
      flagAnonymousFiscalCode &&
      subjectTypeValue === SubjectType.INDIVIDUAL &&
      anonymousSubjectValue === true
    );
  };

  // Reset anonymousSubject to false when it becomes disabled
  // BUT preserve the value in editing mode (data comes from API)
  useEffect(() => {
    if (
      isAnonymousSubjectDisabled() &&
      data.anonymousSubject?.value &&
      !isEditing
    ) {
      setValue('anonymousSubject.value', false);
    }
  }, [subjectTypeValue, isEditing, data.anonymousSubject?.value, setValue]);

  // Reset taxCode to empty string when anonymousSubject becomes true
  // But don't clear it if it's already 'ANONIMO' (edit mode scenario)
  useEffect(() => {
    const anonymousSubjectValue = watch('anonymousSubject.value') || false;
    const taxCodeValue = data.taxCode?.value;

    if (
      anonymousSubjectValue === true &&
      taxCodeValue &&
      taxCodeValue !== 'ANONIMO'
    ) {
      setValue('taxCode.value', '');
    }
  }, [watch('anonymousSubject.value'), data.taxCode?.value, setValue]);

  // Clean taxCode if it contains 'ANONIMO' when switch is turned off
  useEffect(() => {
    const anonymousSubjectValue = watch('anonymousSubject.value') || false;
    const taxCodeValue = data.taxCode?.value;

    // If switch is OFF and taxCode contains 'ANONIMO', clean it
    if (anonymousSubjectValue === false && taxCodeValue === 'ANONIMO') {
      setValue('taxCode.value', '');
    }
  }, [watch('anonymousSubject.value'), data.taxCode?.value, setValue]);

  return (
    <form id="step2-add-debtor-form" data-testid="step2-form">
      <WizardStepWrapper
        title={t('debtPositionCreateWizard.addDebtor.title')}
        subtitle={t('debtPositionCreateWizard.addDebtor.subtitle')}
        showRequiredFieldsMessage={true}
      >
        <SectionBox
          title={t('debtPositionCreateWizard.step2.title')}
          adornment={<PersonIcon />}
        >
          <Typography variant="subtitle1" gutterBottom>
            {t('debtPositionCreateWizard.step2.fiscalData')}
          </Typography>

          <Controller
            name="subjectType.value"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="subject-type-select"
                data-testid="subject-type-field"
                label={t('debtPositionCreateWizard.step2.subjectType.label')}
                required
                select
                fullWidth
                margin="normal"
                disabled={isFieldDisabled('fiscal')}
                error={isSubmitted && !!errors.subjectType?.value}
                helperText={isSubmitted && errors.subjectType?.value?.message}
                onChange={(e) => {
                  field.onChange(e);
                  handleSubjectTypeChange(e);
                }}
              >
                <MenuItem
                  value={SubjectType.INDIVIDUAL}
                  data-testid="subject-type-option-individual"
                >
                  {t(
                    'debtPositionCreateWizard.step2.subjectType.options.fisica'
                  )}
                </MenuItem>
                <MenuItem
                  value={SubjectType.BUSINESS}
                  data-testid="subject-type-option-business"
                >
                  {t(
                    'debtPositionCreateWizard.step2.subjectType.options.giuridica'
                  )}
                </MenuItem>
              </TextField>
            )}
          />

          {/* Anonymous Subject Switch - only visible when flagAnonymousFiscalCode is true */}
          {flagAnonymousFiscalCode && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Controller
                name="anonymousSubject.value"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    data-testid="anonymous-subject-switch"
                    control={
                      <Switch
                        {...field}
                        checked={field.value}
                        disabled={isAnonymousSubjectDisabled()}
                        onChange={(e) => {
                          field.onChange(e.target.checked);
                          setValue('anonymousSubject.value', e.target.checked);
                        }}
                      />
                    }
                    label={t(
                      'debtPositionCreateWizard.step2.anonymousSubject.label'
                    )}
                  />
                )}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ ml: 5.5, mt: 0.25 }}
              >
                {t(
                  'debtPositionCreateWizard.step2.anonymousSubject.helperText'
                )}
              </Typography>
            </Box>
          )}

          {/* Tax Code field - hidden when anonymous subject is enabled */}
          {shouldShowTaxCodeField() && (
            <Controller
              name="taxCode.value"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="tax-code-input"
                  data-testid="tax-code-field"
                  label={getTaxCodeLabel()}
                  placeholder={getTaxCodePlaceholder()}
                  required
                  fullWidth
                  margin="normal"
                  disabled={isFieldDisabled('fiscal')}
                  error={isSubmitted && !!errors.taxCode?.value}
                  helperText={isSubmitted && errors.taxCode?.value?.message}
                  onChange={(e) => {
                    const upper = e.target.value.toUpperCase();
                    field.onChange(upper);
                    handleFieldChange('taxCode.value', upper);
                  }}
                  inputProps={{ maxLength: 16 }}
                />
              )}
            />
          )}

          <Typography variant="subtitle1" sx={{ mt: 3 }} gutterBottom>
            {t('debtPositionCreateWizard.step2.personalData')}
          </Typography>

          <Controller
            name="fullName.value"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="full-name-input"
                data-testid="full-name-field"
                label={getCompanyNameLabel()}
                fullWidth
                margin="normal"
                required
                disabled={isFieldDisabled('personal')}
                error={isSubmitted && !!errors.fullName?.value}
                helperText={isSubmitted && errors.fullName?.value?.message}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value);
                  handleFieldChange('fullName.value', value);
                }}
              />
            )}
          />

          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name="address.value"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="address-input"
                    data-testid="address-field"
                    label={t('debtPositionCreateWizard.step2.address.label')}
                    fullWidth
                    required
                    disabled={isFieldDisabled('personal')}
                    error={isSubmitted && !!errors.address?.value}
                    helperText={isSubmitted && errors.address?.value?.message}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      handleFieldChange('address.value', value);
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6} sm={3} md={3}>
              <Controller
                name="civicNumber.value"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="civic-number-input"
                    data-testid="civic-number-field"
                    label={t(
                      'debtPositionCreateWizard.step2.civicNumber.label'
                    )}
                    fullWidth
                    required
                    disabled={isFieldDisabled('personal')}
                    error={isSubmitted && !!errors.civicNumber?.value}
                    helperText={
                      isSubmitted && errors.civicNumber?.value?.message
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      handleFieldChange('civicNumber.value', value);
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6} sm={3} md={3}>
              <Controller
                name="zipCode.value"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="zip-code-input"
                    data-testid="zip-code-field"
                    label={t('debtPositionCreateWizard.step2.zipCode.label')}
                    fullWidth
                    required
                    disabled={isFieldDisabled('personal')}
                    error={isSubmitted && !!errors.zipCode?.value}
                    helperText={isSubmitted && errors.zipCode?.value?.message}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      handleFieldChange('zipCode.value', value);
                    }}
                    inputProps={{ maxLength: 5 }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={4}>
              <Controller
                name="country.value"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="country-select"
                    data-testid="country-field"
                    label={t('debtPositionCreateWizard.step2.country.label')}
                    select
                    fullWidth
                    required
                    disabled={isFieldDisabled('personal')}
                    error={isSubmitted && !!errors.country?.value}
                    helperText={isSubmitted && errors.country?.value?.message}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      handleFieldChange('country.value', value);
                    }}
                  >
                    <MenuItem value="IT" data-testid="country-option-IT">
                      Italia
                    </MenuItem>
                    <MenuItem value="FR" data-testid="country-option-FR">
                      Francia
                    </MenuItem>
                    <MenuItem value="DE" data-testid="country-option-DE">
                      Germania
                    </MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="province.value"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="province-select"
                    data-testid="province-field"
                    label={t('debtPositionCreateWizard.step2.province.label')}
                    select
                    fullWidth
                    required
                    disabled={isFieldDisabled('personal')}
                    error={isSubmitted && !!errors.province?.value}
                    helperText={isSubmitted && errors.province?.value?.message}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      handleFieldChange('province.value', value);
                    }}
                  >
                    <MenuItem value="MI" data-testid="province-option-MI">
                      MI
                    </MenuItem>
                    <MenuItem value="RM" data-testid="province-option-RM">
                      RM
                    </MenuItem>
                    <MenuItem value="TO" data-testid="province-option-TO">
                      TO
                    </MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="city.value"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="city-input"
                    data-testid="city-field"
                    label={t('debtPositionCreateWizard.step2.city.label')}
                    fullWidth
                    required
                    disabled={isFieldDisabled('personal')}
                    error={isSubmitted && !!errors.city?.value}
                    helperText={isSubmitted && errors.city?.value?.message}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      handleFieldChange('city.value', value);
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </SectionBox>
      </WizardStepWrapper>
      <WizardStepButtons
        onBack={onBack}
        onNext={handleSubmit(onSubmit)}
        disableNext={false}
      />
    </form>
  );
};

export default Step2AddDebtor;
