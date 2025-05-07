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

// Type representing the complete path to a field value.
// Example: 'subjectType.value', 'taxCode.value'
type NestedFieldName = `${Step2DataField}.value`;

type Props = {
  data: Step2Data;
  setData: (data: Step2Data) => void;
  onNext: () => void;
  onBack?: () => void;
};

// Type per i messaggi di errore
type FieldErrorValue = {
  type: string;
  message: string;
};

// Type per i campi di errore nidificati
type NestedFieldErrors<T> = {
  [K in keyof T]?: {
    value?: FieldErrorValue;
  };
};

const Step2AddDebtor = ({ data, setData, onNext, onBack }: Props) => {
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
  };

  // Utilizziamo il nuovo schema nidificato che corrisponde alla struttura di Step2Data
  const schema = createNestedStep2AddDebtorSchema(t);

  /**
   * Maps an error from Zod to a react-hook-form error
   */
  const createFieldError = (message: string): FieldErrorValue => ({
    type: 'validation',
    message
  });

  /**
   * Trasforma gli errori Zod nel formato atteso da react-hook-form
   * La struttura degli errori ora rispecchia quella del nostro oggetto Step2Data
   */
  const transformZodErrors = (zodError: z.ZodError, values: Step2Data) => {
    // Funzione per personalizzare messaggi di errore specifici
    const customizeErrorMessage = (
      fieldName: Step2DataField,
      message: string,
      subjectType?: string
    ): string => {
      // Per i messaggi relativi a taxCode, personalizza in base al tipo di soggetto
      if (fieldName === 'taxCode' && subjectType === SubjectType.BUSINESS) {
        if (message === t('debtPositionCreateWizard.step2.taxCode.required')) {
          return t('debtPositionCreateWizard.step2.vat.required');
        }
      }

      // Per i messaggi relativi a fullName, personalizza in base al tipo di soggetto
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

      // Restituisci il messaggio originale per tutti gli altri casi
      return message;
    };

    // Usa reduce per costruire l'oggetto degli errori in modo più funzionale
    return zodError.errors.reduce(
      (formErrors: NestedFieldErrors<Step2Data>, error) => {
        const path = error.path;

        // Solo gli errori con path di almeno 2 elementi e secondo elemento 'value' ci interessano
        if (path.length >= 2 && path[1] === 'value') {
          const fieldName = path[0] as Step2DataField;

          // Personalizza il messaggio di errore in base al campo e al tipo di soggetto
          const customMessage = customizeErrorMessage(
            fieldName,
            error.message,
            values.subjectType?.value
          );

          // Aggiungi l'errore al campo appropriato
          formErrors[fieldName] = {
            value: createFieldError(customMessage)
          };
        }

        return formErrors;
      },
      {}
    );
  };

  /**
   * Resolver personalizzato per la validazione con Zod
   */
  const zodFormResolver: Resolver<Step2Data> = async (values) => {
    // Validazione con Zod direttamente sulla struttura nidificata
    const result = schema.safeParse(values);

    if (result.success) {
      return { values, errors: {} };
    }

    // Trasforma gli errori Zod per react-hook-form
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

  const subjectTypeValue = watch('subjectType.value') || '';

  useEffect(() => {
    if (isSubmitted) {
      trigger('taxCode.value');
      trigger('fullName.value');
    }
  }, [subjectTypeValue, trigger, isSubmitted]);

  /**
   * Gestisce il cambiamento di qualsiasi campo del form
   */
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

  /**
   * Gestisce il cambiamento del tipo di soggetto
   */
  const handleSubjectTypeChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    setValue('subjectType.value', newValue);
    await trigger('taxCode.value');
    await trigger('fullName.value');
  };

  /**
   * Gestisce la sottomissione del form
   */
  const onSubmit = async (values: Step2Data) => {
    setData(values);
    onNext();
  };

  /**
   * Ottiene l'etichetta appropriata per il codice fiscale/partita IVA
   */
  const getTaxCodeLabel = () => {
    return subjectTypeValue === SubjectType.BUSINESS
      ? t('debtPositionCreateWizard.step2.vat.label')
      : t('debtPositionCreateWizard.step2.taxCode.label');
  };

  /**
   * Ottiene il placeholder appropriato per il codice fiscale/partita IVA
   */
  const getTaxCodePlaceholder = () => {
    return subjectTypeValue === SubjectType.BUSINESS
      ? t('debtPositionCreateWizard.step2.vat.placeholder')
      : t('debtPositionCreateWizard.step2.taxCode.placeholder');
  };

  /**
   * Ottiene l'etichetta appropriata per il nome/ragione sociale
   */
  const getCompanyNameLabel = () => {
    return subjectTypeValue === SubjectType.BUSINESS
      ? t('debtPositionCreateWizard.step2.companyName.label')
      : t('debtPositionCreateWizard.step2.fullName.label');
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
                }}
              >
                <MenuItem value={SubjectType.INDIVIDUAL}>
                  {t(
                    'debtPositionCreateWizard.step2.subjectType.options.fisica'
                  )}
                </MenuItem>
                <MenuItem value={SubjectType.BUSINESS}>
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
                  field.onChange(value);
                  handleFieldChange('fullName.value', value);
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
                      field.onChange(value);
                      handleFieldChange('address.value', value);
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
                      field.onChange(value);
                      handleFieldChange('zipCode.value', value);
                    }}
                    inputProps={{ maxLength: 5 }}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Grid per paese, provincia e città */}
          <Grid container spacing={2} mt={1}>
            {/* Campo paese */}
            <Grid item xs={12} sm={4}>
              <Controller
                name="country.value"
                control={control}
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
        onNext={handleSubmit(onSubmit)}
        disableNext={false}
      />
    </form>
  );
};

export default Step2AddDebtor;
