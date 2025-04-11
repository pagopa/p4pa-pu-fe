import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Control,
  Controller,
  useFieldArray,
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger,
  FieldErrors,
  Path,
  FieldValues,
  FieldArrayPath,
  PathValue
} from 'react-hook-form';
import {
  Grid,
  TextField,
  InputAdornment,
  Typography,
  Paper,
  Box,
  Button,
  Divider
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Add } from '@mui/icons-material';
import {
  createBeneficiaryValidators,
  createBeneficiaryFieldValidators
} from '../../../utils/fieldValidation';

// Interfaccia per i validatori dei campi dei beneficiari
type BeneficiaryFieldValidators = {
  validateBeneficiaryTaxCode: (value: string) => string | undefined;
  validateIBAN: (value: string) => string | undefined;
  validatePostalAccount: (value: string) => string | undefined;
  validatePaymentMethod: (
    iban: string,
    postalAccount: string
  ) => string | undefined;
};

// Tipo per i dati di un singolo beneficiario
export type BeneficiaryData = {
  entityName: string;
  amount: string;
  taxCode: string;
  iban: string;
  postalAccount: string;
  taxonomyCode: string;
};

// Tipo base per il form che contiene almeno i beneficiari
export type BeneficiaryFormValues = {
  beneficiaries: Array<BeneficiaryData>;
};

// Helper type per accedere ai campi dei beneficiari in modo tipizzato
type BeneficiaryFieldPath<T extends FieldValues> = FieldArrayPath<T>;

// Tipo generico per props che può estendere BeneficiaryFormValues con altri campi
type BeneficiaryFieldProps<T extends FieldValues> = {
  readonly control: Control<T>;
  readonly isSubmitted: boolean;
  readonly errors: FieldErrors<T>;
  readonly totalAmount: string;
  readonly fieldNamePrefix: BeneficiaryFieldPath<T>;
  readonly disabled?: boolean;
  readonly setValue: UseFormSetValue<T>;
  readonly getValues: UseFormGetValues<T>;
  readonly trigger: UseFormTrigger<T>;
  readonly onToggleMultibeneficiary?: (value: boolean) => void;
};

enum BeneficiaryFields {
  EntityName = 'entityName',
  Amount = 'amount',
  TaxCode = 'taxCode',
  Iban = 'iban',
  PostalAccount = 'postalAccount',
  TaxonomyCode = 'taxonomyCode'
}

// Componente per la gestione dei dati di un ente beneficiario
function BeneficiaryField<T extends FieldValues>({
  control,
  isSubmitted,
  errors,
  totalAmount,
  fieldNamePrefix,
  disabled = false,
  getValues,
  trigger,
  onToggleMultibeneficiary
}: BeneficiaryFieldProps<T>) {
  const { t } = useTranslation();
  const MAX_BENEFICIARIES = 4;

  // Utilizzo di useFieldArray per gestire un array di beneficiari -
  // fields: l'array dei campi
  // append: funzione per aggiungere un nuovo elemento
  // remove: funzione per rimuovere un elemento
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldNamePrefix
  });

  // Verifica se c'è un solo beneficiario
  const hasSingleBeneficiary = fields.length === 1;

  // Importa le funzioni di validazione dal modulo fieldValidation riguardanti l'importo dei beneficiari
  const validators = createBeneficiaryValidators(
    t,
    getValues,
    fieldNamePrefix,
    totalAmount
  );

  // Importa i validatori specifici per i campi del beneficiario riguardanti l'IBAN e il conto corrente postale
  const fieldValidators: BeneficiaryFieldValidators =
    createBeneficiaryFieldValidators(t);

  // Effetto per triggerare la validazione quando cambiano gli importi o l'importo totale
  useEffect(() => {
    // Aggiorna la validazione dei campi esistenti
    fields.forEach((_, index) => {
      trigger(`${fieldNamePrefix}.${index}` as Path<T>);
    });
  }, [trigger, fieldNamePrefix, fields, totalAmount]);

  //  Funzione per aggiornare la validazione di tutti i campi importo
  const updateAmountValidations = () => {
    fields.forEach((_, index) => {
      trigger(`${fieldNamePrefix}.${index}.amount` as Path<T>);
    });
  };

  // Funzione per verificare se un campo ha errori
  const hasFieldError = (
    fieldName: BeneficiaryFields,
    index: number
  ): boolean => {
    // Accediamo agli errori del form
    return (
      isSubmitted &&
      !!(
        errors[fieldNamePrefix] as unknown as Record<
          number,
          FieldErrors<BeneficiaryData>
        >
      )?.[index]?.[fieldName]
    );
  };

  // Funzione per ottenere il messaggio di errore di un campo
  const getFieldErrorMessage = (
    fieldName: BeneficiaryFields,
    index: number
  ): string => {
    // Accediamo ai messaggi di errore
    return (
      (isSubmitted &&
        ((
          errors[fieldNamePrefix] as unknown as Record<
            number,
            FieldErrors<BeneficiaryData>
          >
        )?.[index]?.[fieldName]?.message as string)) ||
      ''
    );
  };

  // Funzione per ottenere il messaggio di errore del campo amount
  const getAmountErrorMessage = (index: number): string => {
    // Errori di validazione standard solo se il form è stato sottomesso
    if (isSubmitted) {
      const standardError = getFieldErrorMessage(
        BeneficiaryFields.Amount,
        index
      );
      if (standardError) return standardError;
    }

    // Errori di validazione personalizzati - mostra sempre, anche senza submit
    if (!validators.isBeneficiaryAmountValid(index, hasSingleBeneficiary)) {
      return hasSingleBeneficiary
        ? t(
            'debtPositionCreateWizard.step3.beneficiary.amountMustBeLessThanTotal'
          )
        : t(
            'debtPositionCreateWizard.step3.beneficiary.sumMustBeLessThanTotal'
          );
    }
    return '';
  };

  // Funzione per verificare se il campo amount ha errori
  const hasAmountError = (index: number): boolean => {
    // Controlla sia gli errori standard (solo se submitted) sia gli errori personalizzati (sempre)
    return (
      (isSubmitted && hasFieldError(BeneficiaryFields.Amount, index)) ||
      !validators.isBeneficiaryAmountValid(index, hasSingleBeneficiary)
    );
  };

  // Aggiungi un nuovo beneficiario
  const addBeneficiary = () => {
    if (fields.length < MAX_BENEFICIARIES) {
      // Aggiungi il nuovo beneficiario con importo vuoto
      const newBeneficiary: BeneficiaryData = {
        entityName: '',
        amount: '',
        taxCode: '',
        iban: '',
        postalAccount: '',
        taxonomyCode: ''
      };
      append(
        newBeneficiary as unknown as PathValue<T, BeneficiaryFieldPath<T>>
      );
    }
  };

  // Rimuovi un beneficiario
  const removeBeneficiary = (index: number) => {
    // Calcola il numero di beneficiari che rimarranno dopo la rimozione
    const remainingBeneficiaries = fields.length - 1;
    if (remainingBeneficiaries === 0 && onToggleMultibeneficiary) {
      // Se non rimarrà nessun beneficiario, disattiva lo switch del multibeneficiario
      onToggleMultibeneficiary(false);
    } else {
      remove(index);
      // Aggiorna la validazione degli importi dopo la rimozione
      // Ma NON attivare la validazione dei campi di pagamento
      updateAmountValidations();
    }
  };

  // Funzione per verificare se il campo IBAN ha errori
  const hasIBANError = (index: number): boolean => {
    // Se il conto postale è valorizzato, non mostriamo errori sull'IBAN
    const postalAccount = getValues(getFieldPath(index, 'postalAccount'));
    if (postalAccount && postalAccount.trim() !== '') {
      return false;
    }
    return hasFieldError(BeneficiaryFields.Iban, index);
  };

  // Funzione per ottenere il messaggio di errore del campo IBAN
  const getIBANErrorMessage = (index: number): string => {
    // Se il conto postale è valorizzato, non mostriamo messaggi di errore sull'IBAN
    const postalAccount = getValues(getFieldPath(index, 'postalAccount'));
    if (postalAccount && postalAccount.trim() !== '') {
      return '';
    }

    // Verifica se entrambi i campi sono vuoti
    const iban = getValues(getFieldPath(index, 'iban'));
    if (
      isSubmitted &&
      (!iban || iban.trim() === '') &&
      (!postalAccount || postalAccount.trim() === '')
    ) {
      return t(
        'debtPositionCreateWizard.step3.beneficiary.paymentMethod.required'
      );
    }

    return getFieldErrorMessage(BeneficiaryFields.Iban, index);
  };

  // Funzione per verificare se il campo conto corrente postale ha errori
  const hasPostalAccountError = (index: number): boolean => {
    // Se l'IBAN è valorizzato, non mostriamo errori sul conto postale
    const iban = getValues(getFieldPath(index, 'iban'));
    if (iban && iban.trim() !== '') {
      return false;
    }
    return hasFieldError(BeneficiaryFields.PostalAccount, index);
  };

  // Funzione per ottenere il messaggio di errore del campo conto corrente postale
  const getPostalAccountErrorMessage = (index: number): string => {
    // Se l'IBAN è valorizzato, non mostriamo messaggi di errore sul conto postale
    const iban = getValues(getFieldPath(index, 'iban'));
    if (iban && iban.trim() !== '') {
      return '';
    }

    // Verifica se entrambi i campi sono vuoti
    const postalAccount = getValues(getFieldPath(index, 'postalAccount'));
    if (
      isSubmitted &&
      (!iban || iban.trim() === '') &&
      (!postalAccount || postalAccount.trim() === '')
    ) {
      return t(
        'debtPositionCreateWizard.step3.beneficiary.paymentMethod.required'
      );
    }

    return getFieldErrorMessage(BeneficiaryFields.PostalAccount, index);
  };

  // Funzione per verificare se il campo codice fiscale ha errori
  const hasTaxCodeError = (index: number): boolean => {
    return hasFieldError(BeneficiaryFields.TaxCode, index);
  };

  // Funzione per ottenere il messaggio di errore del campo codice fiscale
  const getTaxCodeErrorMessage = (index: number): string => {
    return getFieldErrorMessage(BeneficiaryFields.TaxCode, index);
  };

  // Funzione per verificare che almeno uno tra IBAN e conto corrente postale sia presente
  const validatePaymentMethod = (
    iban: string,
    postalAccount: string
  ): boolean => {
    // Verifichiamo che almeno uno dei due campi sia valorizzato
    const hasIban = iban && iban.trim() !== '';
    const hasPostalAccount = postalAccount && postalAccount.trim() !== '';

    // Se almeno uno dei due è valorizzato, la validazione è superata
    if (hasIban || hasPostalAccount) {
      return true;
    }

    // Altrimenti, deleghiamo al validatore del modulo fieldValidation
    // Convertiamo in boolean - se c'è un messaggio di errore la validazione non è passata
    return (
      fieldValidators.validatePaymentMethod(iban, postalAccount) === undefined
    );
  };

  // Helper per costruire un path tipizzato per i campi del form
  const getFieldPath = <K extends keyof BeneficiaryData>(
    index: number,
    field: K
  ): Path<T> => {
    return `${fieldNamePrefix}.${index}.${field}` as Path<T>;
  };

  return (
    <Box>
      {fields.map((field, index) => (
        <Paper key={field.id} sx={{ p: 2, mb: 2, position: 'relative' }}>
          <Box
            mb={2}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center">
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 1 }}>
                {`${index + 1}. `}
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                {t('debtPositionCreateWizard.step3.beneficiary.title')}
              </Typography>
            </Box>
            <Button
              onClick={() => removeBeneficiary(index)}
              startIcon={<DeleteOutlineIcon />}
              color="error"
              variant="text"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                minWidth: 'auto'
              }}
            >
              {t('commons.delete')}
            </Button>
          </Box>

          <Grid container spacing={2}>
            {/* Nome ente */}
            <Grid item xs={12}>
              <Controller
                name={getFieldPath(index, 'entityName')}
                control={control}
                rules={{
                  required: t(
                    'debtPositionCreateWizard.step3.beneficiary.entityName.required'
                  )
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t(
                      'debtPositionCreateWizard.step3.beneficiary.entityName.label'
                    )}
                    required
                    disabled={disabled}
                    error={hasFieldError(BeneficiaryFields.EntityName, index)}
                    helperText={getFieldErrorMessage(
                      BeneficiaryFields.EntityName,
                      index
                    )}
                  />
                )}
              />
            </Grid>

            {/* Importo */}
            <Grid item xs={12}>
              <Controller
                name={getFieldPath(index, 'amount')}
                control={control}
                rules={{
                  required: t(
                    'debtPositionCreateWizard.step3.beneficiary.amount.required'
                  ),
                  validate: {
                    positiveNumber: (value: string) => {
                      const numValue = parseFloat(value);
                      return (
                        numValue > 0 ||
                        t('debtPositionCreateWizard.step3.amount.positive')
                      );
                    },
                    singleBeneficiaryAmount: (value: string) =>
                      validators.validateSingleBeneficiary(
                        value,
                        fields.length
                      ),
                    totalAmount: validators.validateTotalAmount
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t(
                      'debtPositionCreateWizard.step3.beneficiary.amount.label'
                    )}
                    required
                    type="number"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">€</InputAdornment>
                      ),
                      inputProps: {
                        min: 0.01,
                        step: 0.01,
                        onWheel: (e) =>
                          e.target instanceof HTMLElement && e.target.blur()
                      }
                    }}
                    error={hasAmountError(index)}
                    helperText={getAmountErrorMessage(index)}
                    disabled={false}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      // Aggiorniamo la validazione di tutti i campi quando cambia un singolo importo
                      updateAmountValidations();
                    }}
                  />
                )}
              />
            </Grid>

            {/* Codice Fiscale */}
            <Grid item xs={12}>
              <Controller
                name={getFieldPath(index, 'taxCode')}
                control={control}
                rules={{
                  required: t(
                    'debtPositionCreateWizard.step3.beneficiary.taxCode.required'
                  ),
                  validate: {
                    taxCodeFormat: fieldValidators.validateBeneficiaryTaxCode
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t(
                      'debtPositionCreateWizard.step3.beneficiary.taxCode.label'
                    )}
                    required
                    disabled={disabled}
                    error={hasTaxCodeError(index)}
                    helperText={getTaxCodeErrorMessage(index)}
                    onChange={(e) => {
                      const upper = e.target.value.toUpperCase();
                      field.onChange(upper);
                    }}
                  />
                )}
              />
            </Grid>

            {/* IBAN */}
            <Grid item xs={12}>
              <Controller
                name={getFieldPath(index, 'iban')}
                control={control}
                rules={{
                  validate: {
                    ibanFormat: fieldValidators.validateIBAN,
                    paymentMethod: (value): boolean => {
                      const postalAccount = getValues(
                        getFieldPath(index, 'postalAccount')
                      );
                      // Se IBAN è valorizzato o postalAccount è valorizzato, non mostrare errori
                      if (
                        (value && value.trim() !== '') ||
                        (postalAccount && postalAccount.trim() !== '')
                      ) {
                        return true;
                      }
                      return validatePaymentMethod(value, postalAccount);
                    }
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t(
                      'debtPositionCreateWizard.step3.beneficiary.iban.label'
                    )}
                    disabled={disabled}
                    error={hasIBANError(index)}
                    helperText={getIBANErrorMessage(index)}
                    onChange={(e) => {
                      const upper = e.target.value.toUpperCase();
                      field.onChange(upper);
                      // Rivalidare il conto corrente postale quando cambia l'IBAN
                      // solo se IBAN è vuoto
                      const postalAccount = getValues(
                        getFieldPath(index, 'postalAccount')
                      );
                      // Se l'IBAN è vuoto e anche il conto postale è vuoto
                      if (
                        (!upper || upper.trim() === '') &&
                        (!postalAccount || postalAccount.trim() === '')
                      ) {
                        trigger(getFieldPath(index, 'postalAccount'));
                      }
                    }}
                  />
                )}
              />
            </Grid>

            {/* Conto Corrente Postale */}
            <Grid item xs={12}>
              <Controller
                name={getFieldPath(index, 'postalAccount')}
                control={control}
                rules={{
                  validate: {
                    postalAccountFormat: fieldValidators.validatePostalAccount,
                    paymentMethod: (value): boolean => {
                      const iban = getValues(getFieldPath(index, 'iban'));
                      // Se postalAccount è valorizzato o IBAN è valorizzato, non mostrare errori
                      if (
                        (value && value.trim() !== '') ||
                        (iban && iban.trim() !== '')
                      ) {
                        return true;
                      }
                      return validatePaymentMethod(iban, value);
                    }
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t(
                      'debtPositionCreateWizard.step3.beneficiary.postalAccount.label'
                    )}
                    disabled={disabled}
                    error={hasPostalAccountError(index)}
                    helperText={getPostalAccountErrorMessage(index)}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      // Rivalidare l'IBAN quando cambia il conto corrente postale
                      // solo se conto corrente postale è vuoto
                      const iban = getValues(getFieldPath(index, 'iban'));
                      // Se il conto postale è vuoto e anche l'IBAN è vuoto
                      if (
                        (!e.target.value || e.target.value.trim() === '') &&
                        (!iban || iban.trim() === '')
                      ) {
                        trigger(getFieldPath(index, 'iban'));
                      }
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  />
                )}
              />
            </Grid>

            {/* Codice Tassonomico */}
            <Grid item xs={12}>
              <Controller
                name={getFieldPath(index, 'taxonomyCode')}
                control={control}
                rules={{
                  required: t(
                    'debtPositionCreateWizard.step3.beneficiary.taxonomyCode.required'
                  )
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t(
                      'debtPositionCreateWizard.step3.beneficiary.taxonomyCode.label'
                    )}
                    required
                    disabled={disabled}
                    error={hasFieldError(BeneficiaryFields.TaxonomyCode, index)}
                    helperText={getFieldErrorMessage(
                      BeneficiaryFields.TaxonomyCode,
                      index
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Divider e pulsante Aggiungi solo nell'ultimo beneficiario */}
          {index === fields.length - 1 && fields.length < MAX_BENEFICIARIES && (
            <>
              <Divider sx={{ mt: 2, mb: 1 }} />
              <Box>
                <Button
                  startIcon={<Add />}
                  onClick={addBeneficiary}
                  sx={{ mt: 1 }}
                  variant="text"
                  color="primary"
                  disabled={fields.length >= MAX_BENEFICIARIES}
                >
                  {t(
                    'debtPositionCreateWizard.step3.beneficiary.addBeneficiary'
                  )}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      ))}
    </Box>
  );
}

export default BeneficiaryField;
