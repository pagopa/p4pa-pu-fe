import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { MenuItem, TextField, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import WizardStepButtons from '../../../../components/Wizard/WizardStepButtons';
import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { createValidators } from '../../../../utils/fieldValidation';

// Tipo che definisce la struttura dati dello Step 2 del wizard.
export type Step2Data = {
  subjectType: { value: string; readonly: boolean }; // Tipo soggetto (fisica/giuridica)
  taxCode: { value: string; readonly: boolean }; // Codice fiscale o partita IVA
  fullName: { value: string; readonly: boolean }; // Nome completo
  // address: { value: string; readonly: boolean }; // Indirizzo
  // civicNumber: { value: string; readonly: boolean }; // Numero civico
  // zipCode: { value: string; readonly: boolean }; // CAP
  // country: { value: string; readonly: boolean }; // Nazione
  // province: { value: string; readonly: boolean }; // Provincia
  // city: { value: string; readonly: boolean }; // Città
};

type Step2DataField = keyof Step2Data;

//Tipo che rappresenta il percorso completo al valore di un campo.
//Esempio: 'subjectType.value', 'taxCode.value'
type NestedFieldName = `${Step2DataField}.value`;

type Props = {
  data: Step2Data; // Dati attuali dello step
  setData: (data: Step2Data) => void; // Funzione per aggiornare i dati
  onNext: () => void; // Funzione per passare allo step successivo
  onBack?: () => void; // Funzione per tornare allo step precedente
};

const Step2AddDebtor = ({ data, setData, onNext, onBack }: Props) => {
  const { t } = useTranslation();
  const {
    handleSubmit, // Funzione per gestire la sottomissione del form
    watch, // Funzione per osservare i valori dei campi
    control, // Oggetto di controllo per Controller
    formState: { errors, isSubmitted }, // Stato del form: errori e flag di sottomissione
    trigger, // Funzione per attivare la validazione manualmente
    clearErrors, // Funzione per ripulire gli errori
    setValue // Funzione per impostare valori nei campi
  } = useForm<Step2Data>({
    defaultValues: data, // Inizializza il form con i dati esistenti
    mode: 'onChange' // Modalità di validazione: alla modifica del campo
  });

  // Osservazione di campi specifici per reagire ai loro cambiamenti
  const subjectTypeValue = watch('subjectType.value') || '';
  // const countryValue = watch('country.value') || '';
  // const provinceValue = watch('province.value') || '';

  // Effetto che rivalida il codice fiscale/partita IVA e fullName e ragione socialequando cambia il tipo di soggetto
  useEffect(() => {
    if (isSubmitted) {
      trigger('taxCode.value');
      trigger('fullName.value');
    }
  }, [subjectTypeValue, trigger, isSubmitted]);

  // Creazione delle utility di validazione e label
  const { getValidationRules } = createValidators(t, subjectTypeValue);
  // Ottiene le regole di validazione per tutti i campi
  const validationRules = getValidationRules();

  // Funzione per validare il CAP.
  // Per l'Italia deve essere un numero di 5 cifre.
  // Per altri paesi è accettato qualsiasi valore non vuoto.
  // const validateZipCode = (zipCode: string) => {
  //   if (!zipCode) return t('commons.required');
  //   if (countryValue === 'IT' || !countryValue) {
  //     return (
  //       /^\d{5}$/.test(zipCode) ||
  //       t('debtPositionCreateWizard.step2.zipCode.error')
  //     );
  //   }
  //   return true;
  // };

  // Funzione per gestire il cambiamento di un qualsiasi campo del form.
  // Aggiorna il valore e attiva la validazione se il form è già stato inviato.
  const handleFieldChange = async (
    fieldName: NestedFieldName,
    value: string
  ) => {
    // Imposta il nuovo valore nel form
    setValue(fieldName, value);
    // Se il form è già stato inviato, verifica il campo e pulisce eventuali errori
    if (isSubmitted) {
      const isFieldValid = await trigger(fieldName);
      if (isFieldValid) {
        clearErrors(fieldName);
      }
    }
  };

  // Funzione specifica per gestire il cambiamento del tipo di soggetto.
  // Questo campo influenza il comportamento di altri campi, come il codice fiscale.
  const handleSubjectTypeChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    // Aggiorna il valore del tipo di soggetto
    setValue('subjectType.value', newValue);
  };

  // Funzione chiamata alla submission valida del form.
  // Salva i dati e passa allo step successivo.
  const onSubmit = async (values: Step2Data) => {
    setData(values); // Salva i dati nel contesto del wizard
    onNext(); // Passa allo step successivo
  };

  // Verifica se tutti i campi obbligatori sono compilati.
  // Usata per abilitare/disabilitare il pulsante "Avanti".
  // const allRequiredFieldsFilled = (): boolean => {
  //   // Lista dei campi obbligatori
  //   const requiredFields: Array<NestedFieldName> = [
  //     'subjectType.value',
  //     'taxCode.value',
  //     'fullName.value',
  //     'address.value',
  //     'civicNumber.value',
  //     'zipCode.value'
  //   ];

  //   // Verifica che tutti i campi obbligatori abbiano un valore
  //   return requiredFields.every((field) => {
  //     const value = watch(field);
  //     return typeof value === 'string' && value.trim() !== '';
  //   });
  // };

  const getTaxCodeLabel = () => {
    switch (subjectTypeValue) {
      case 'fisica':
        return t('debtPositionCreateWizard.step2.taxCode.label');
      case 'giuridica':
        return t('debtPositionCreateWizard.step2.vat.label');
      default:
        return t('commons.fiscalCodeorVat');
    }
  };

  const getTaxCodePlaceholder = () => {
    switch (subjectTypeValue) {
      case 'fisica':
        return t('debtPositionCreateWizard.step2.taxCode.placeholder');
      case 'giuridica':
        return t('debtPositionCreateWizard.step2.vat.placeholder');
      default:
        return t('debtPositionCreateWizard.step2.taxCodeOrVat.placeholder');
    }
  };

  const getCompanyNameLabel = () => {
    switch (subjectTypeValue) {
      case 'fisica':
        return t('debtPositionCreateWizard.step2.fullName.label');
      case 'giuridica':
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

          {/* Campo per selezionare il tipo di soggetto (persona fisica o giuridica) */}
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
                  // Forza la rivalidazione del campo taxCode solo se il form è già stato inviato
                  if (isSubmitted) {
                    trigger('taxCode.value');
                  }
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

          {/* Campo per il codice fiscale o partita IVA */}
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

          {/* Campo per il nome completo */}
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
                  handleFieldChange('fullName.value', value); // aggiorna stato wizard
                }}
              />
            )}
          />

          {/* Grid per indirizzo, numero civico e CAP */}
          {/* <Grid container spacing={2} mt={1}> */}
          {/* Campo per l'indirizzo */}
          {/* <Grid item xs={12} sm={6} md={6}>
                <Controller
                  name="address.value"
                  control={control}
                  rules={{
                    required: t(
                      'debtPositionCreateWizard.step2.address.required'
                    )
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('debtPositionCreateWizard.step2.address.label')}
                      fullWidth
                      required
                      disabled={data.address.readonly}
                      error={isSubmitted && !!errors.address?.value}
                      helperText={isSubmitted && errors.address?.value?.message}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value); // sincronizza RHF
                        handleFieldChange('address.value', value); // aggiorna stato wizard
                      }}
                    />
                  )}
                />
              </Grid> */}

          {/* Campo per il numero civico */}
          {/* <Grid item xs={6} sm={3} md={3}>
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
                      disabled={data.civicNumber.readonly}
                      error={isSubmitted && !!errors.civicNumber?.value}
                      helperText={
                        isSubmitted && errors.civicNumber?.value?.message
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value); // sincronizza RHF
                        handleFieldChange('civicNumber.value', value); // aggiorna stato wizard
                      }}
                    />
                  )}
                />
              </Grid> */}

          {/* Campo per il CAP con validazione specifica */}
          {/* <Grid item xs={6} sm={3} md={3}>
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
                      disabled={data.zipCode.readonly}
                      error={isSubmitted && !!errors.zipCode?.value}
                      helperText={isSubmitted && errors.zipCode?.value?.message}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value); // sincronizza RHF
                        handleFieldChange('zipCode.value', value); // aggiorna stato wizard
                      }}
                      inputProps={{ maxLength: 5 }} // Limita a 5 caratteri (lunghezza CAP italiano)
                    />
                  )}
                />
              </Grid> */}
          {/* </Grid> */}

          {/* Grid per nazione, provincia e città */}
          {/* <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={t('debtPositionCreateWizard.step2.country.label')}
                  select
                  fullWidth
                  disabled={data.country.readonly}
                  {...register('country.value')}
                  value={countryValue} // Usa il valore osservato
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
                  value={provinceValue} // Usa il valore osservato
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
            </Grid> */}

          {/* Pulsanti per navigare nel wizard */}
        </SectionBox>
      </WizardStepWrapper>
      <WizardStepButtons
        onBack={onBack}
        onNext={handleSubmit(onSubmit)} // Procedi se la validazione passa
        disableNext={false}
      />
    </form>
  );
};

export default Step2AddDebtor;
