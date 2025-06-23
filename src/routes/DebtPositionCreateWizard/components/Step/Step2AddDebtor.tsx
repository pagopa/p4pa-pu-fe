import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller, Resolver, FieldErrors } from 'react-hook-form';
import { Grid, MenuItem, TextField, Typography } from '@mui/material';
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
  isEditing
}: Props) => {
  const { t } = useTranslation();

  useEffect(() => {
    initializeDefaultValues();
  }, [data, setData]);

  const initializeDefaultValues = () => {
    const fieldsToInitialize: Array<Step2DataField> = [
      'address',
      'civicNumber',
      'zipCode',
      'country',
      'province',
      'city'
    ];

    let hasUpdates = false;
    const updatedData = { ...data };

    fieldsToInitialize.forEach((field) => {
      if (!updatedData[field]) {
        if (field === 'country') {
          updatedData[field] = { value: 'IT', readonly: false };
        } else {
          updatedData[field] = { value: '', readonly: false };
        }
        hasUpdates = true;
      }
    });

    if (updatedData.country && updatedData.country.value === '') {
      updatedData.country.value = 'IT';
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
    setValue
  } = useForm<Step2Data>({
    defaultValues: {
      ...data,
      country: {
        ...data.country,
        value: data.country?.value || 'IT'
      }
    },
    resolver: zodFormResolver,
    mode: 'onChange'
  });

  useEffect(() => {
    if (data?.subjectType?.value) {
      setValue('subjectType.value', data.subjectType.value);
    }
    if (data?.taxCode?.value) {
      setValue('taxCode.value', data.taxCode.value);
    }
    if (data?.fullName?.value) {
      setValue('fullName.value', data.fullName.value);
    }
    if (data?.address?.value) {
      setValue('address.value', data.address.value);
    }
    if (data?.civicNumber?.value) {
      setValue('civicNumber.value', data.civicNumber.value);
    }
    if (data?.zipCode?.value) {
      setValue('zipCode.value', data.zipCode.value);
    }
    if (data?.country?.value) {
      setValue('country.value', data.country.value);
    }
    if (data?.province?.value) {
      setValue('province.value', data.province.value);
    }
    if (data?.city?.value) {
      setValue('city.value', data.city.value);
    }
  }, [
    data?.subjectType?.value,
    data?.taxCode?.value,
    data?.fullName?.value,
    data?.address?.value,
    data?.civicNumber?.value,
    data?.zipCode?.value,
    data?.country?.value,
    data?.province?.value,
    data?.city?.value,
    setValue
  ]);

  const subjectTypeValue = watch('subjectType.value') || '';

  useEffect(() => {
    if (isSubmitted) {
      trigger('taxCode.value');
      trigger('fullName.value');
    }
  }, [subjectTypeValue, trigger, isSubmitted]);

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
    setData(values);
    onNext();
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

  return (
    <form id="step2-add-debtor-form" data-testid="step2-form">
      <WizardStepWrapper
        title={t('debtPositionCreateWizard.addDebtor.title')}
        subtitle={t('debtPositionCreateWizard.addDebtor.subtitle')}
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
                disabled={isEditing}
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
                disabled={isEditing}
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
                disabled={isEditing}
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
                    disabled={isEditing}
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
                    disabled={isEditing}
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
                    disabled={isEditing}
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
                    disabled={isEditing}
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
                    disabled={isEditing}
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
                    disabled={isEditing}
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
