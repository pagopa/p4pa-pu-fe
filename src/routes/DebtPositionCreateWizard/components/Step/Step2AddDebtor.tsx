import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
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
import WizardStepButtons from '../../../../components/Wizard/WizardStepButtons';
import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { SubjectType } from '../../../../utils/fieldValidation';
import { Step2Data } from '../../../../models/DebtPositionType';
import { createNestedStep2AddDebtorSchema } from '../../../../models/Step2AddDebtorSchema';
import { Step2ControlledTextField } from './Step2ControlledTextField';
import { useStep2Form } from '../../../../hooks/useStep2Form';

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

const Step2AddDebtor = ({
  data,
  setData,
  onNext,
  onBack,
  isEditing,
  flagAnonymousFiscalCode = false
}: Props) => {
  const { t } = useTranslation();

  // Create schema
  const schema = createNestedStep2AddDebtorSchema(t);

  // Use custom hook for form management
  const {
    control,
    handleSubmit,
    watch,
    errors,
    isSubmitted,
    trigger,
    clearErrors,
    setValue
  } = useStep2Form({
    data,
    setData,
    isEditing,
    schema,
    t
  });

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

  // Unified effect: Handle all anonymousSubject-related logic
  useEffect(() => {
    const anonymousSubjectValue = watch('anonymousSubject.value') || false;
    const taxCodeValue = data.taxCode?.value;

    // 1. Reset anonymousSubject to false when it becomes disabled
    //    BUT preserve the value in editing mode (data comes from API)
    if (
      isAnonymousSubjectDisabled() &&
      data.anonymousSubject?.value &&
      !isEditing
    ) {
      setValue('anonymousSubject.value', false);
      return; // Early return to avoid conflicting updates
    }

    // 2. Reset taxCode to empty string when anonymousSubject becomes true
    //    But don't clear it if it's already 'ANONIMO' (edit mode scenario)
    if (
      anonymousSubjectValue === true &&
      taxCodeValue &&
      taxCodeValue !== 'ANONIMO'
    ) {
      setValue('taxCode.value', '');
      return; // Early return to avoid conflicting updates
    }

    // 3. Clean taxCode if it contains 'ANONIMO' when switch is turned off
    if (anonymousSubjectValue === false && taxCodeValue === 'ANONIMO') {
      setValue('taxCode.value', '');
    }
  }, [
    watch('anonymousSubject.value'),
    data.anonymousSubject?.value,
    data.taxCode?.value,
    subjectTypeValue,
    isEditing,
    setValue
  ]);

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
            <Step2ControlledTextField
              name="taxCode"
              control={control}
              label={getTaxCodeLabel()}
              placeholder={getTaxCodePlaceholder()}
              required
              disabled={isFieldDisabled('fiscal')}
              isSubmitted={isSubmitted}
              errors={errors}
              onFieldChange={handleFieldChange}
              transformValue={(value) => value.toUpperCase()}
              inputProps={{ maxLength: 16 }}
              id="tax-code-input"
              data-testid="tax-code-field"
            />
          )}

          <Typography variant="subtitle1" sx={{ mt: 3 }} gutterBottom>
            {t('debtPositionCreateWizard.step2.personalData')}
          </Typography>

          <Step2ControlledTextField
            name="fullName"
            control={control}
            label={getCompanyNameLabel()}
            required
            disabled={isFieldDisabled('personal')}
            isSubmitted={isSubmitted}
            errors={errors}
            onFieldChange={handleFieldChange}
            id="full-name-input"
            data-testid="full-name-field"
          />

          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={6} md={6}>
              <Step2ControlledTextField
                name="address"
                control={control}
                label={t('debtPositionCreateWizard.step2.address.label')}
                required
                disabled={isFieldDisabled('personal')}
                isSubmitted={isSubmitted}
                errors={errors}
                onFieldChange={handleFieldChange}
                id="address-input"
                data-testid="address-field"
                margin="none"
              />
            </Grid>

            <Grid item xs={6} sm={3} md={3}>
              <Step2ControlledTextField
                name="civicNumber"
                control={control}
                label={t('debtPositionCreateWizard.step2.civicNumber.label')}
                required
                disabled={isFieldDisabled('personal')}
                isSubmitted={isSubmitted}
                errors={errors}
                onFieldChange={handleFieldChange}
                id="civic-number-input"
                data-testid="civic-number-field"
                margin="none"
              />
            </Grid>

            <Grid item xs={6} sm={3} md={3}>
              <Step2ControlledTextField
                name="zipCode"
                control={control}
                label={t('debtPositionCreateWizard.step2.zipCode.label')}
                required
                disabled={isFieldDisabled('personal')}
                isSubmitted={isSubmitted}
                errors={errors}
                onFieldChange={handleFieldChange}
                inputProps={{ maxLength: 5 }}
                id="zip-code-input"
                data-testid="zip-code-field"
                margin="none"
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
              <Step2ControlledTextField
                name="city"
                control={control}
                label={t('debtPositionCreateWizard.step2.city.label')}
                required
                disabled={isFieldDisabled('personal')}
                isSubmitted={isSubmitted}
                errors={errors}
                onFieldChange={handleFieldChange}
                id="city-input"
                data-testid="city-field"
                margin="none"
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
