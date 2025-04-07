import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Paper
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';
import SectionBox from '../../../components/Wizard/SectionBox';
import { validateTaxCode } from '../../../utils/fieldValidation';

type Step2Data = {
  subjectType: { value: string; readonly: boolean };
  taxCode: { value: string; readonly: boolean };
  fullName: { value: string; readonly: boolean };
  address: { value: string; readonly: boolean };
  civicNumber: { value: string; readonly: boolean };
  zipCode: { value: string; readonly: boolean };
  country: { value: string; readonly: boolean };
  province: { value: string; readonly: boolean };
  city: { value: string; readonly: boolean };
};

type Props = {
  data: Step2Data;
  setData: (data: Step2Data) => void;
  onNext: () => void;
  onBack: () => void;
};

const Step2AddDebtor = ({ data, setData, onNext, onBack }: Props) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitted },
    trigger,
    clearErrors,
    setValue
  } = useForm<Step2Data>({
    defaultValues: data,
    mode: 'onChange'
  });
  const { t } = useTranslation();

  const subjectTypeValue = watch('subjectType.value') || '';
  const countryValue = watch('country.value') || '';
  const provinceValue = watch('province.value') || '';

  const validateZipCode = (zipCode: string) => {
    if (!zipCode) return t('common.required');
    if (countryValue === 'IT' || !countryValue) {
      return (
        /^\d{5}$/.test(zipCode) || 'Il CAP deve essere di 5 cifre numeriche'
      );
    }
    return true;
  };

  // Funzione per gestire i cambiamenti nei campi
  const handleFieldChange = async (fieldName: string, value: string) => {
    setValue(fieldName as any, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });

    if (isSubmitted) {
      const isFieldValid = await trigger(fieldName as any);
      if (isFieldValid) {
        clearErrors(fieldName as any);
      }
    }
  };

  const onSubmit = async (values: Step2Data) => {
    setData(values);
    onNext();
  };

  // Verifica se tutti i campi obbligatori sono stati compilati
  const allRequiredFieldsFilled = () => {
    const requiredFields = [
      'subjectType.value',
      'taxCode.value',
      'fullName.value',
      'address.value',
      'civicNumber.value',
      'zipCode.value'
    ] as const;

    return requiredFields.every((field) => {
      const value = watch(field as any);
      return value && typeof value === 'string' && value.trim() !== '';
    });
  };

  return (
    <Box>
      <SectionBox hideHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                {t('debtPositionCreateWizard.step2.title')}
              </Typography>
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              {t('debtPositionCreateWizard.step2.fiscalData')}
            </Typography>

            <Controller
              name="subjectType.value"
              control={control}
              rules={{ required: t('common.required') }}
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
                    handleFieldChange('subjectType.value', e.target.value);
                  }}
                >
                  <MenuItem value="fisica">
                    {t(
                      'debtPositionCreateWizard.step2.subjectType.options.fisica'
                    )}
                  </MenuItem>
                  <MenuItem value="giuridica">
                    {t(
                      'debtPositionCreateWizard.step2.subjectType.options.giuridica'
                    )}
                  </MenuItem>
                </TextField>
              )}
            />

            <TextField
              label={t('debtPositionCreateWizard.step2.taxCode.label')}
              required
              fullWidth
              margin="normal"
              disabled={data.taxCode.readonly}
              {...register('taxCode.value', {
                required: t('common.required'),
                validate: (value) => {
                  const result = validateTaxCode(value, subjectTypeValue);
                  return result === true ? true : t(result as string);
                }
              })}
              error={isSubmitted && !!errors.taxCode?.value}
              helperText={isSubmitted && errors.taxCode?.value?.message}
              onChange={(e) => {
                handleFieldChange(
                  'taxCode.value',
                  e.target.value.toUpperCase()
                );
              }}
              inputProps={{ maxLength: 16 }}
            />

            <Typography variant="subtitle2" sx={{ mt: 3 }} gutterBottom>
              {t('debtPositionCreateWizard.step2.personalData')}
            </Typography>

            <TextField
              label={t('debtPositionCreateWizard.step2.fullName.label')}
              fullWidth
              margin="normal"
              required
              disabled={data.fullName.readonly}
              {...register('fullName.value', {
                required: t('common.required')
              })}
              error={isSubmitted && !!errors.fullName?.value}
              helperText={isSubmitted && errors.fullName?.value?.message}
              onChange={(e) => {
                handleFieldChange('fullName.value', e.target.value);
              }}
            />

            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label={t('debtPositionCreateWizard.step2.address.label')}
                  fullWidth
                  required
                  disabled={data.address.readonly}
                  {...register('address.value', {
                    required: t('common.required')
                  })}
                  error={isSubmitted && !!errors.address?.value}
                  helperText={isSubmitted && errors.address?.value?.message}
                  onChange={(e) => {
                    handleFieldChange('address.value', e.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={3}>
                <TextField
                  label={t('debtPositionCreateWizard.step2.civicNumber.label')}
                  fullWidth
                  required
                  disabled={data.civicNumber.readonly}
                  {...register('civicNumber.value', {
                    required: t('common.required')
                  })}
                  error={isSubmitted && !!errors.civicNumber?.value}
                  helperText={isSubmitted && errors.civicNumber?.value?.message}
                  onChange={(e) => {
                    handleFieldChange('civicNumber.value', e.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={3}>
                <TextField
                  label={t('debtPositionCreateWizard.step2.zipCode.label')}
                  fullWidth
                  required
                  disabled={data.zipCode.readonly}
                  {...register('zipCode.value', {
                    required: t('common.required'),
                    validate: validateZipCode
                  })}
                  error={isSubmitted && !!errors.zipCode?.value}
                  helperText={isSubmitted && errors.zipCode?.value?.message}
                  onChange={(e) => {
                    handleFieldChange('zipCode.value', e.target.value);
                  }}
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={t('debtPositionCreateWizard.step2.country.label')}
                  select
                  fullWidth
                  disabled={data.country.readonly}
                  {...register('country.value')}
                  value={countryValue}
                  onChange={(e) => {
                    handleFieldChange('country.value', e.target.value);
                  }}
                >
                  <MenuItem value="IT">Italia</MenuItem>
                  <MenuItem value="FR">Francia</MenuItem>
                  <MenuItem value="DE">Germania</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={t('debtPositionCreateWizard.step2.province.label')}
                  select
                  fullWidth
                  disabled={data.province.readonly}
                  {...register('province.value')}
                  value={provinceValue}
                  onChange={(e) => {
                    handleFieldChange('province.value', e.target.value);
                  }}
                >
                  <MenuItem value="MI">MI</MenuItem>
                  <MenuItem value="RM">RM</MenuItem>
                  <MenuItem value="TO">TO</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={t('debtPositionCreateWizard.step2.city.label')}
                  fullWidth
                  disabled={data.city.readonly}
                  {...register('city.value')}
                  onChange={(e) => {
                    handleFieldChange('city.value', e.target.value);
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          <WizardStepButtons
            onBack={onBack}
            onNext={handleSubmit(onSubmit)}
            disableNext={!allRequiredFieldsFilled()}
          />
        </form>
      </SectionBox>
    </Box>
  );
};

export default Step2AddDebtor;
