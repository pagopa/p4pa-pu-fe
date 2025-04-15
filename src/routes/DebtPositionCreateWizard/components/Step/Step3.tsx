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
  BeneficiaryData,
  BeneficiaryFormValues
} from '../../../../hooks/useBeneficiaryManagement';
import {
  createAmountValidator,
  isBeneficiariesTotalValid,
  createDateValidator
} from '../../../../utils/fieldValidation';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { PageRoutes } from '../../../../App';
import { InstallmentData } from '../../../../hooks/useInstallmentManagement';
import { BeneficiaryFieldRef } from '../Beneficiary/BeneficiaryField';

export type Step3Data = {
  paymentObject: { value: string; readonly: boolean };
  paymentOption: { value: string; readonly: boolean };
  amount: { value: string; readonly: boolean };
  dueDate: { value: string | null; readonly: boolean };
  flagMandatoryDueDate: boolean;
  isMultibeneficiary: { value: boolean; readonly: boolean };
  beneficiaries?: Array<BeneficiaryData>; // Array di beneficiari
  installments?: Array<InstallmentData>; // Array di rate
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
  installments?: Array<InstallmentData>;
};

// Funzione estratta dal nesting eccessivo
function triggerValidationForAllBeneficiaries<T extends FieldValues>(
  beneficiaries: Array<Record<string, unknown>>,
  trigger: UseFormTrigger<T>
) {
  beneficiaries.forEach((_, index) => {
    trigger(`beneficiaries.${index}.amount` as Path<T>);
  });
}

// Funzione per attivare la validazione per tutti i beneficiari di tutte le rate
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

// Funzione per attivare la validazione dei campi di pagamento (IBAN e postalAccount)
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
          // Validazione del campo IBAN
          const ibanPath =
            `installments.${installmentIndex}.beneficiaries.${beneficiaryIndex}.iban` as Path<T>;
          trigger(ibanPath);

          // Validazione del campo postalAccount
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

  // Converti il valore stringa della data in oggetto Date per il DatePicker
  const initialData: FormValues = {
    ...data,
    dueDate: {
      ...data.dueDate,
      value: data.dueDate?.value ? new Date(data.dueDate.value) : null
    },
    // Inizializza l'array di beneficiari se è definito o crea un array vuoto
    beneficiaries: data.beneficiaries || [],
    // Inizializza l'array di rate se è definito o crea un array vuoto
    installments: data.installments || []
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
  const paymentOption = watch('paymentOption.value');

  // Verifica se il paymentOption è rateale
  const isInstallment = paymentOption === 'INSTALLMENTS';

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

  // Gestisce l'aggiornamento dell'importo totale quando cambiano le rate
  const handleInstallmentsChange = (totalAmount: string) => {
    setValue('amount.value', totalAmount);
  };

  // Riferimento al componente BeneficiaryField per accedere ai suoi metodi
  const beneficiaryFieldRef = useRef<BeneficiaryFieldRef>({});

  // Funzione per gestire il cambio dello switch multibeneficiario
  const handleMultibeneficiaryToggle = (value: boolean) => {
    setValue('isMultibeneficiary.value', value);

    // Se stiamo disattivando il multibeneficiario, resettiamo i beneficiari
    if (
      !value &&
      beneficiaryFieldRef.current &&
      beneficiaryFieldRef.current.resetAllBeneficiaries
    ) {
      beneficiaryFieldRef.current.resetAllBeneficiaries();
    }
  };

  const onSubmit = async (values: FormValues) => {
    // Utilizziamo i valori attuali per la validazione
    const currentBeneficiaries = getValues('beneficiaries') || [];

    // Verifica se la somma degli importi dei beneficiari è valida altrimenti attiva la validazione e interrompe il submit
    if (
      isMultibeneficiary &&
      !isBeneficiariesTotalValid(currentBeneficiaries, totalAmount)
    ) {
      trigger('beneficiaries');
      return;
    }

    // Verifica la validità dei beneficiari per ogni rata se è un pagamento rateale
    if (isInstallment) {
      const installments = getValues('installments') || [];
      let hasInvalidBeneficiaries = false;
      let hasInvalidPaymentFields = false;

      // Verifica ogni rata con beneficiari multipli
      for (let i = 0; i < installments.length; i++) {
        const installment = installments[i];

        if (installment.isMultibeneficiary) {
          // Verifica se il campo beneficiaries esiste e ha la struttura attesa
          const beneficiaries = installment.beneficiaries || [];

          // Verifica la struttura dei beneficiari
          beneficiaries.forEach((b, idx) => {
            // Se non è nel formato atteso, proviamo a intervenire
            if (
              typeof b.amount !== 'string' &&
              b.amount !== null &&
              b.amount !== undefined
            ) {
              beneficiaries[idx].amount = String(b.amount);
            }

            // Verifica dei campi di pagamento (IBAN e postalAccount)
            const iban = b.iban || '';
            const postalAccount = b.postalAccount || '';

            // Almeno uno dei due campi deve essere valorizzato
            if (
              (!iban || iban.trim() === '') &&
              (!postalAccount || postalAccount.trim() === '')
            ) {
              hasInvalidPaymentFields = true;
            }
          });

          // Verifica se la validazione fallisce
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

      // Se c'è almeno una rata con beneficiari non validi, interrompi il submit
      if (hasInvalidBeneficiaries || hasInvalidPaymentFields) {
        // Prima di attivare la validazione, aggiorniamo in modo esplicito gli errori
        try {
          // Attiva la validazione per i beneficiari di tutte le rate
          triggerValidationForAllInstallmentBeneficiaries(
            installments,
            trigger
          );

          // Attiva la validazione specifica per i campi di pagamento
          triggerPaymentFieldsValidation(installments, trigger);
        } catch (error) {
          // L'errore viene catturato ma non viene più loggato
        }
        return;
      }
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
      // Includi l'array di beneficiari solo se isMultibeneficiary è true e non è un pagamento rateale
      ...(!isInstallment && values.isMultibeneficiary.value
        ? { beneficiaries: values.beneficiaries }
        : {}),
      // Includi l'array di rate solo se è un pagamento rateale
      ...(isInstallment ? { installments: values.installments } : {})
    };
    // Salva i dati
    setData(formattedValues);
    // Naviga direttamente alla pagina di completamento usando useNavigate
    navigate(PageRoutes.DEBT_POSITION_CREATE_WIZARD_COMPLETED, {
      state: { paymentObject: formattedValues.paymentObject.value },
      replace: true
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
                      switch (value) {
                        case 'INSTALLMENTS':
                          // Se viene selezionata l'opzione rateale
                          // Disattiva la modalità multi-beneficiario
                          setValue('isMultibeneficiary.value', false);
                          // Azzera il valore del campo amount
                          setValue('amount.value', '');
                          break;
                        case 'SINGLE':
                          // Se si passa da rateale a unica, azzera il campo amount
                          if (paymentOption === 'INSTALLMENTS') {
                            setValue('amount.value', '');
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
                          e.target instanceof HTMLElement && e.target.blur() // Rimuove il focus dall'input quando si ruota la rotellina del mouse
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
                      // Accetta solo numeri, punto e virgola
                      const filteredValue = e.target.value.replace(
                        /[^0-9.,]/g,
                        ''
                      );
                      // Converti virgola in punto per la gestione numerica
                      const normalizedValue = filteredValue.replace(',', '.');
                      // Aggiorna il valore nel form
                      field.onChange(normalizedValue);
                      // Per risolvere il problema di aggiornamento dello stato
                      // è necessario usare setTimeout per assicurarsi che
                      // il valore sia effettivamente aggiornato prima di triggerare la validazione
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

            {/* Visualizza il campo data scadenza solo se NON è selezionata l'opzione rateale */}
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

            {/* Mostra lo switch per i beneficiari multipli solo se NON è selezionata l'opzione rateale */}
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

            {/* Componente Enti Beneficiari - visibile solo quando isMultibeneficiary è true E non è selezionata l'opzione rateale */}
            {isMultibeneficiary && !isInstallment && (
              <Grid item xs={12} mt={2}>
                <BeneficiaryField
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
      {/* Componente Rate - visibile solo quando è selezionata l'opzione rateale */}
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
