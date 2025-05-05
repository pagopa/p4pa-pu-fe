import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Grid, MenuItem, TextField, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import WizardStepButtons from '../../../../components/Wizard/WizardStepButtons';
import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { createValidators } from '../../../../utils/fieldValidation';
import { Step2Data } from '../../../../models/DebtPositionType';

type Step2DataField = keyof Step2Data;

// Type representing the complete path to a field value.
// Example: 'subjectType.value', 'taxCode.value'
type NestedFieldName = `${Step2DataField}.value`;

type Props = {
  data: Step2Data; // Current step data
  setData: (data: Step2Data) => void; // Function to update data
  onNext: () => void; // Function to proceed to next step
  onBack?: () => void; // Function to go back to previous step
};

const Step2AddDebtor = ({ data, setData, onNext, onBack }: Props) => {
  const { t } = useTranslation();

  // Initialize missing fields in data
  useEffect(() => {
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
        // Set "IT" as default value for country field
        if (field === 'country') {
          updatedData[field] = { value: 'IT', readonly: false };
        } else {
          updatedData[field] = { value: '', readonly: false };
        }
        hasUpdates = true;
      }
    });

    // If country is empty, set "IT" as default value
    if (updatedData.country && updatedData.country.value === '') {
      updatedData.country.value = 'IT';
      hasUpdates = true;
    }

    if (hasUpdates) {
      setData(updatedData);
    }
  }, [data, setData]);

  const {
    handleSubmit, // Function to handle form submission
    watch, // Function to watch field values
    control, // Control object for Controller
    formState: { errors, isSubmitted }, // Form state: errors and submission flag
    trigger, // Function to manually trigger validation
    clearErrors, // Function to clear errors
    setValue // Function to set field values
  } = useForm<Step2Data>({
    defaultValues: {
      ...data,
      country: {
        ...data.country,
        value: data.country?.value || 'IT'
      }
    },
    mode: 'onChange' // Validation mode: on field change
  });

  const subjectTypeValue = watch('subjectType.value') || '';
  const countryValue = watch('country.value') || '';

  // Effect that revalidates tax code/VAT and fullName/company name when subject type changes
  useEffect(() => {
    if (isSubmitted) {
      trigger('taxCode.value');
      trigger('fullName.value');
    }
  }, [subjectTypeValue, trigger, isSubmitted]);

  // Creation of validation utilities and labels
  const { getValidationRules } = createValidators(t, subjectTypeValue);
  // Get validation rules for all fields
  const validationRules = getValidationRules();

  // Function to validate zip code.
  // For Italy, it must be a 5-digit number.
  // For other countries, any non-empty value is accepted.
  const validateZipCode = (zipCode: string) => {
    if (!zipCode) return t('commons.required');
    if (countryValue === 'IT' || !countryValue) {
      return (
        /^\d{5}$/.test(zipCode) ||
        t('debtPositionCreateWizard.step2.zipCode.error')
      );
    }
    return true;
  };

  // Function to handle changes to any form field.
  // Updates the value and triggers validation if the form has already been submitted.
  const handleFieldChange = async (
    fieldName: NestedFieldName,
    value: string
  ) => {
    setValue(fieldName, value);
    // If the form has already been submitted, validate the field and clear any errors
    if (isSubmitted) {
      const isFieldValid = await trigger(fieldName);
      if (isFieldValid) {
        clearErrors(fieldName);
      }
    }
  };

  // Specific function to handle subject type changes.
  // This field affects the behavior of other fields, such as tax code.
  const handleSubjectTypeChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    setValue('subjectType.value', newValue);
  };

  // Function called on valid form submission.
  // Saves the data and proceeds to the next step.
  const onSubmit = async (values: Step2Data) => {
    setData(values);
    onNext();
  };

  const getTaxCodeLabel = () => {
    switch (subjectTypeValue) {
      case 'F':
        return t('debtPositionCreateWizard.step2.taxCode.label');
      case 'G':
        return t('debtPositionCreateWizard.step2.vat.label');
      default:
        return t('commons.fiscalCodeorVat');
    }
  };

  const getTaxCodePlaceholder = () => {
    switch (subjectTypeValue) {
      case 'F':
        return t('debtPositionCreateWizard.step2.taxCode.placeholder');
      case 'G':
        return t('debtPositionCreateWizard.step2.vat.placeholder');
      default:
        return t('debtPositionCreateWizard.step2.taxCode.placeholder');
    }
  };

  const getCompanyNameLabel = () => {
    switch (subjectTypeValue) {
      case 'F':
        return t('debtPositionCreateWizard.step2.fullName.label');
      case 'G':
        return t('debtPositionCreateWizard.step2.companyName.label');
      default:
        return t('debtPositionCreateWizard.step2.fullName.label');
    }
  };

  return (
    <form>
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

          {/* Field to select subject type (individual or legal entity) */}
          <Controller
            name="subjectType.value"
            control={control}
            rules={validationRules.subjectType}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('debtPositionCreateWizard.step2.subjectType.label')}
                required
                select
                fullWidth
                margin="normal"
                disabled={data.subjectType.readonly}
                error={isSubmitted && !!errors.subjectType?.value}
                helperText={isSubmitted && errors.subjectType?.value?.message}
                onChange={(e) => {
                  field.onChange(e);
                  handleSubjectTypeChange(e);
                  // Force revalidation of taxCode field only if form was already submitted
                  if (isSubmitted) {
                    trigger('taxCode.value');
                  }
                }}
              >
                <MenuItem value="F">
                  {t(
                    'debtPositionCreateWizard.step2.subjectType.options.fisica'
                  )}
                </MenuItem>
                <MenuItem value="G">
                  {t(
                    'debtPositionCreateWizard.step2.subjectType.options.giuridica'
                  )}
                </MenuItem>
              </TextField>
            )}
          />

          {/* Field for tax code or VAT number */}
          <Controller
            name="taxCode.value"
            control={control}
            rules={validationRules.taxCode}
            render={({ field }) => (
              <TextField
                {...field}
                label={getTaxCodeLabel()}
                placeholder={getTaxCodePlaceholder()}
                required
                fullWidth
                margin="normal"
                disabled={data.taxCode.readonly}
                error={isSubmitted && !!errors.taxCode?.value}
                helperText={isSubmitted && errors.taxCode?.value?.message}
                onChange={(e) => {
                  const upper = e.target.value.toUpperCase();
                  field.onChange(upper);
                  handleFieldChange('taxCode.value', upper);
                  if (isSubmitted) {
                    trigger('taxCode.value');
                  }
                }}
                inputProps={{ maxLength: 16 }}
              />
            )}
          />

          <Typography variant="subtitle1" sx={{ mt: 3 }} gutterBottom>
            {t('debtPositionCreateWizard.step2.personalData')}
          </Typography>

          {/* Field for full name */}
          <Controller
            name="fullName.value"
            control={control}
            rules={validationRules.fullName}
            render={({ field }) => (
              <TextField
                {...field}
                label={getCompanyNameLabel()}
                fullWidth
                margin="normal"
                required
                disabled={data.fullName.readonly}
                error={isSubmitted && !!errors.fullName?.value}
                helperText={isSubmitted && errors.fullName?.value?.message}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value); // RHF
                  handleFieldChange('fullName.value', value); // update wizard state
                }}
              />
            )}
          />

          {/* Grid for address, civic number and zip code */}
          <Grid container spacing={2} mt={1}>
            {/* Field for address */}
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name="address.value"
                control={control}
                rules={{
                  required: t('debtPositionCreateWizard.step2.address.required')
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('debtPositionCreateWizard.step2.address.label')}
                    fullWidth
                    required
                    disabled={data.address?.readonly || false}
                    error={isSubmitted && !!errors.address?.value}
                    helperText={isSubmitted && errors.address?.value?.message}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value); // synchronize RHF
                      handleFieldChange('address.value', value); // update wizard state
                    }}
                  />
                )}
              />
            </Grid>

            {/* Field for civic number */}
            <Grid item xs={6} sm={3} md={3}>
              <Controller
                name="civicNumber.value"
                control={control}
                rules={{
                  required: t(
                    'debtPositionCreateWizard.step2.civicNumber.required'
                  )
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t(
                      'debtPositionCreateWizard.step2.civicNumber.label'
                    )}
                    fullWidth
                    required
                    disabled={data.civicNumber?.readonly || false}
                    error={isSubmitted && !!errors.civicNumber?.value}
                    helperText={
                      isSubmitted && errors.civicNumber?.value?.message
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value); // synchronize RHF
                      handleFieldChange('civicNumber.value', value); // update wizard state
                    }}
                  />
                )}
              />
            </Grid>

            {/* Field for zip code with specific validation */}
            <Grid item xs={6} sm={3} md={3}>
              <Controller
                name="zipCode.value"
                control={control}
                rules={{
                  required: t(
                    'debtPositionCreateWizard.step2.zipCode.required'
                  ),
                  validate: validateZipCode
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('debtPositionCreateWizard.step2.zipCode.label')}
                    fullWidth
                    required
                    disabled={data.zipCode?.readonly || false}
                    error={isSubmitted && !!errors.zipCode?.value}
                    helperText={isSubmitted && errors.zipCode?.value?.message}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value); // synchronize RHF
                      handleFieldChange('zipCode.value', value);
                    }}
                    inputProps={{ maxLength: 5 }} // Limit to 5 characters (Italian zip code length)
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Grid for country, province and city */}
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={4}>
              <Controller
                name="country.value"
                control={control}
                rules={{
                  required: t('debtPositionCreateWizard.step2.country.required')
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('debtPositionCreateWizard.step2.country.label')}
                    select
                    fullWidth
                    required
                    disabled={data.country?.readonly || false}
                    error={isSubmitted && !!errors.country?.value}
                    helperText={isSubmitted && errors.country?.value?.message}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      handleFieldChange('country.value', value);
                    }}
                  >
                    <MenuItem value="IT">Italia</MenuItem>
                    <MenuItem value="FR">Francia</MenuItem>
                    <MenuItem value="DE">Germania</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="province.value"
                control={control}
                rules={{
                  required: t(
                    'debtPositionCreateWizard.step2.province.required'
                  )
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('debtPositionCreateWizard.step2.province.label')}
                    select
                    fullWidth
                    required
                    disabled={data.province?.readonly || false}
                    error={isSubmitted && !!errors.province?.value}
                    helperText={isSubmitted && errors.province?.value?.message}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      handleFieldChange('province.value', value);
                    }}
                  >
                    <MenuItem value="MI">MI</MenuItem>
                    <MenuItem value="RM">RM</MenuItem>
                    <MenuItem value="TO">TO</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="city.value"
                control={control}
                rules={{
                  required: t('debtPositionCreateWizard.step2.city.required')
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('debtPositionCreateWizard.step2.city.label')}
                    fullWidth
                    required
                    disabled={data.city?.readonly || false}
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

          {/* Buttons to navigate through the wizard */}
        </SectionBox>
      </WizardStepWrapper>
      <WizardStepButtons
        onBack={onBack}
        onNext={handleSubmit(onSubmit)} // Proceed if validation passes
        disableNext={false}
      />
    </form>
  );
};

export default Step2AddDebtor;
