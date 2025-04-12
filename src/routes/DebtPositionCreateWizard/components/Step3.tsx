import {
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Controller, useForm, Path } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';
import SectionBox from '../../../components/Wizard/SectionBox';
import ArticleIcon from '@mui/icons-material/Article';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../utils/formatters';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import BeneficiaryField from './BeneficiaryField';
import type {
  BeneficiaryData,
  BeneficiaryFormValues
} from './BeneficiaryField';
import {
  createAmountValidator,
  isBeneficiariesTotalValid
} from '../../../utils/fieldValidation';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { PageRoutes } from '../../../App';

export type Step3Data = {
  paymentObject: { value: string; readonly: boolean };
  paymentOption: { value: string; readonly: boolean };
  amount: { value: string; readonly: boolean };
  dueDate: { value: string | null; readonly: boolean };
  flagMandatoryDueDate: boolean;
  isMultibeneficiary: { value: boolean; readonly: boolean };
  beneficiaries?: Array<BeneficiaryData>; // Array di beneficiari
};

type Props = {
  data: Step3Data;
  setData: (data: Step3Data) => void;
  onNext: () => void;
  onBack: () => void;
};

type FormValues = BeneficiaryFormValues & {
  paymentObject: { value: string; readonly: boolean };
  paymentOption: { value: string; readonly: boolean };
  amount: { value: string; readonly: boolean };
  dueDate: { value: Date | null; readonly: boolean };
  isMultibeneficiary: { value: boolean; readonly: boolean };
};

const Step3 = ({ data, setData, onBack }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Converti il valore stringa della data in oggetto Date per il DatePicker
  const initialData: FormValues = {
    ...data,
    dueDate: {
      ...data.dueDate,
      value: data.dueDate?.value ? new Date(data.dueDate.value) : null
    },
    // Inizializza l'array di beneficiari se è definito o crea un array vuoto
    beneficiaries: data.beneficiaries || []
  };

  const {
    handleSubmit, // Funzione per gestire il submit del form
    control, // oggetto per controllare i campi del form
    formState: { errors, isSubmitted }, // oggetto contenente gli errori di validazione e lo stato del form
    watch, // funzione per osservare i cambiamenti dei campi
    setValue, // funzione per impostare i valori dei campi del form
    trigger, // funzione per triggerare la validazione dei campi del form
    getValues // funzione per ottenere i valori dei campi del form
  } = useForm<FormValues>({
    defaultValues: initialData,
    mode: 'onChange'
  });

  // Osserva i campi rilevanti per la validazione
  const isMultibeneficiary = watch('isMultibeneficiary.value');
  const totalAmount = watch('amount.value');
  const beneficiaries = watch('beneficiaries') || [];

  // Verifica se la somma degli importi dei beneficiari è valida
  const isBeneficiariesValid = () => {
    if (!isMultibeneficiary || !totalAmount || beneficiaries.length === 0)
      return true;

    return isBeneficiariesTotalValid(beneficiaries, totalAmount);
  };

  // Effetto per gestire l'inizializzazione dei beneficiari
  useEffect(() => {
    if (isMultibeneficiary && beneficiaries.length === 0) {
      setValue('beneficiaries', [
        {
          entityName: '',
          amount: '',
          taxCode: '',
          iban: '',
          postalAccount: '',
          taxonomyCode: ''
        }
      ]);
    } else if (!isMultibeneficiary) {
      setValue('beneficiaries', []);
    }
  }, [isMultibeneficiary, setValue]);

  const onSubmit = async (values: FormValues) => {
    // Verifica se la somma degli importi dei beneficiari è valida altrimenti attiva la validazione e interrompe il submit
    if (isMultibeneficiary && !isBeneficiariesValid()) {
      trigger('beneficiaries');
      return;
    }

    // Converti la data in stringa prima di salvare
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
      // Includi l'array di beneficiari solo se isMultibeneficiary è true
      ...(values.isMultibeneficiary.value
        ? { beneficiaries: values.beneficiaries }
        : {})
    };

    setData(formattedValues);
    // va alla pagina finale, passando il valore aggiornato
    navigate(PageRoutes.DEBT_POSITION_CREATE_WIZARD_COMPLETED, {
      state: {
        paymentObject: formattedValues.paymentObject.value
      },
      replace: true // sovrascrive la rotta step3 nello stack del browser si ritorna a ${deployPath}/debt-positions/
    });
  };

  // Utilizzo della funzione di validazione importo importata da fieldValidation.tsx
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
                    disabled={data.amount?.readonly}
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
                          e.target instanceof HTMLElement && e.target.blur() // Rimuove il focus dall'input quando si ruota la rotellina del mouse
                      }
                    }}
                    error={isSubmitted && !!errors.amount?.value}
                    helperText={isSubmitted && errors.amount?.value?.message}
                    onChange={(e) => {
                      // Accetta solo numeri, punto e virgola
                      const filteredValue = e.target.value.replace(
                        /[^0-9.,]/g,
                        ''
                      );
                      // Converti virgola in punto per la gestione numerica
                      const normalizedValue = filteredValue.replace(',', '.');

                      // Aggiorna il valore nel form
                      field.onChange(normalizedValue);

                      // Per risolvere il problema di aggiornamento dello stato,
                      // è necessario usare setTimeout per assicurarsi che
                      // il valore sia effettivamente aggiornato prima di triggerare la validazione
                      if (isMultibeneficiary && beneficiaries.length > 0) {
                        setTimeout(() => {
                          beneficiaries.forEach((_, index) => {
                            trigger(
                              `beneficiaries.${index}.amount` as Path<FormValues>
                            );
                          });
                          console.log(
                            '🔄 Validazione importi beneficiari triggerata dopo aggiornamento importo totale'
                          );
                        }, 0);
                      }
                    }}
                    onBlur={(e) => {
                      // Formatta il valore con due decimali quando il campo perde il focus
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

            <Grid item xs={12}>
              <Controller
                name="dueDate.value"
                control={control}
                rules={{
                  required: data.flagMandatoryDueDate
                    ? t('debtPositionCreateWizard.step3.dueDate.required')
                    : false
                }}
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
                      }
                    }}
                    onChange={(date) => {
                      onChange(date);
                    }}
                  />
                )}
              />
            </Grid>

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
                          field.onChange(value);
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

            {/* Componente Enti Beneficiari - visibile solo quando isMultibeneficiary è true */}
            {isMultibeneficiary && (
              <Grid item xs={12} mt={2}>
                <BeneficiaryField<FormValues>
                  control={control}
                  errors={errors}
                  isSubmitted={isSubmitted}
                  totalAmount={totalAmount}
                  fieldNamePrefix="beneficiaries"
                  disabled={false}
                  setValue={setValue}
                  getValues={getValues}
                  trigger={trigger}
                  onToggleMultibeneficiary={(value) => {
                    setValue('isMultibeneficiary.value', value);
                  }}
                />
              </Grid>
            )}
          </Grid>

          {/* <Grid item xs={12}>
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
                    // handleFieldChange('paymentOption', value);
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
                  type="number"
                  disabled={data.amount?.readonly}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">€</InputAdornment>
                    ),
                    inputProps: {
                      min: 0.01,
                      step: 0.01
                    }
                  }}
                  error={isSubmitted && !!errors.amount?.value}
                  helperText={isSubmitted && errors.amount?.value?.message}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value);
                    // handleFieldChange('amount', value);
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="dueDate.value"
              control={control}
              rules={{
                required: data.flagMandatoryDueDate
                  ? t('debtPositionCreateWizard.step3.dueDate.required')
                  : false
              }}
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
                      helperText: isSubmitted && errors.dueDate?.value?.message
                    }
                  }}
                  onChange={(date) => {
                    onChange(date);
                  }}
                />
              )}
            />
          </Grid>

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
                        field.onChange(value);
                        // handleFieldChange('isMultibeneficiary', value);
                      }}
                    />
                  }
                  label={t(
                    'debtPositionCreateWizard.step3.isMultibeneficiary.label'
                  )}
                />
              )}
            />
          </Grid> */}
        </SectionBox>
      </WizardStepWrapper>
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
