import { useEffect } from 'react';
import { Control, Controller, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  TextField,
  InputAdornment,
  Typography,
  Paper,
  Box,
  Button,
  IconButton,
  Divider
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Add } from '@mui/icons-material';
import {
  createBeneficiaryValidators,
  createBeneficiaryFieldValidators
} from '../../../utils/fieldValidation';

// Tipo per i dati di un singolo beneficiario
export type BeneficiaryData = {
  entityName: string;
  amount: string;
  taxCode: string;
  iban: string;
  postalAccount: string;
  taxonomyCode: string;
};

type BeneficiaryFieldProps = {
  control: Control<any>;
  isSubmitted: boolean;
  errors: any;
  totalAmount: string;
  fieldNamePrefix?: string;
  disabled?: boolean;
  setValue: any;
  getValues: any;
  trigger: any;
  onToggleMultibeneficiary?: (value: boolean) => void;
};

// Componente per la gestione dei dati di un ente beneficiario
const BeneficiaryField = ({
  control,
  isSubmitted,
  errors,
  totalAmount,
  fieldNamePrefix = 'beneficiaries',
  disabled = false,
  getValues,
  trigger,
  onToggleMultibeneficiary
}: BeneficiaryFieldProps) => {
  const { t } = useTranslation();
  const MAX_BENEFICIARIES = 4;

  // Utilizzo di useFieldArray per gestire un array di beneficiari
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldNamePrefix
  });

  // Verifica se c'è un solo beneficiario
  const hasSingleBeneficiary = fields.length === 1;

  // Importa le funzioni di validazione dal modulo fieldValidation
  const validators = createBeneficiaryValidators(
    t,
    getValues,
    fieldNamePrefix,
    totalAmount
  );

  // Importa i validatori specifici per i campi del beneficiario
  const fieldValidators = createBeneficiaryFieldValidators(t);

  // Effetto per triggerare la validazione quando cambiano gli importi o l'importo totale
  useEffect(() => {
    // Triggeriamo la validazione quando cambiano gli importi o l'importo totale
    trigger(fieldNamePrefix);
  }, [trigger, fieldNamePrefix, getValues(fieldNamePrefix), totalAmount]);

  // Funzione per aggiornare la validazione di tutti i campi
  const updateAllValidations = () => {
    trigger(fieldNamePrefix);
  };

  // Funzione per verificare se un campo ha errori
  const hasFieldError = (fieldName: string, index: number): boolean => {
    return isSubmitted && !!errors?.beneficiaries?.[index]?.[fieldName];
  };

  // Funzione per ottenere il messaggio di errore di un campo
  const getFieldErrorMessage = (fieldName: string, index: number): string => {
    return isSubmitted && errors?.beneficiaries?.[index]?.[fieldName]?.message;
  };

  // Funzione per verificare se il campo amount ha errori
  const hasAmountError = (index: number): boolean => {
    return (
      hasFieldError('amount', index) ||
      !validators.isBeneficiaryAmountValid(index, hasSingleBeneficiary)
    );
  };

  // Funzione per ottenere il messaggio di errore del campo amount
  const getAmountErrorMessage = (index: number): string => {
    if (!isSubmitted) return '';
    // Errori di validazione standard
    const standardError = getFieldErrorMessage('amount', index);
    if (standardError) return standardError;
    // Errori di validazione personalizzati
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

  // Aggiungi un nuovo beneficiario
  const addBeneficiary = () => {
    if (fields.length < MAX_BENEFICIARIES) {
      // Aggiungi il nuovo beneficiario con importo vuoto
      append({
        entityName: '',
        amount: '',
        taxCode: '',
        iban: '',
        postalAccount: '',
        taxonomyCode: ''
      });
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
    }
  };

  // Funzione per verificare se il campo IBAN ha errori
  const hasIBANError = (index: number): boolean => {
    return hasFieldError('iban', index);
  };

  // Funzione per ottenere il messaggio di errore del campo IBAN
  const getIBANErrorMessage = (index: number): string => {
    return getFieldErrorMessage('iban', index);
  };

  // Funzione per verificare se il campo conto corrente postale ha errori
  const hasPostalAccountError = (index: number): boolean => {
    return hasFieldError('postalAccount', index);
  };

  // Funzione per ottenere il messaggio di errore del campo conto corrente postale
  const getPostalAccountErrorMessage = (index: number): string => {
    return getFieldErrorMessage('postalAccount', index);
  };

  // Funzione per verificare se il campo codice fiscale ha errori
  const hasTaxCodeError = (index: number): boolean => {
    return hasFieldError('taxCode', index);
  };

  // Funzione per ottenere il messaggio di errore del campo codice fiscale
  const getTaxCodeErrorMessage = (index: number): string => {
    return getFieldErrorMessage('taxCode', index);
  };

  // Funzione per verificare che almeno uno tra IBAN e conto corrente postale sia presente
  const validatePaymentMethod = (
    index: number,
    iban: string,
    postalAccount: string
  ) => {
    return fieldValidators.validatePaymentMethod(iban, postalAccount);
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
            <IconButton
              onClick={() => removeBeneficiary(index)}
              size="small"
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <DeleteOutlineIcon color="error" />
            </IconButton>
          </Box>

          <Grid container spacing={2}>
            {/* Nome ente */}
            <Grid item xs={12}>
              <Controller
                name={`${fieldNamePrefix}.${index}.entityName`}
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
                    error={hasFieldError('entityName', index)}
                    helperText={getFieldErrorMessage('entityName', index)}
                  />
                )}
              />
            </Grid>

            {/* Importo */}
            <Grid item xs={12}>
              <Controller
                name={`${fieldNamePrefix}.${index}.amount`}
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
                      updateAllValidations();
                    }}
                  />
                )}
              />
            </Grid>

            {/* Codice Fiscale */}
            <Grid item xs={12}>
              <Controller
                name={`${fieldNamePrefix}.${index}.taxCode`}
                control={control}
                rules={{
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
                name={`${fieldNamePrefix}.${index}.iban`}
                control={control}
                rules={{
                  validate: {
                    ibanFormat: fieldValidators.validateIBAN,
                    paymentMethod: (value) => {
                      const postalAccount = getValues(
                        `${fieldNamePrefix}.${index}.postalAccount`
                      );
                      return validatePaymentMethod(index, value, postalAccount);
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
                      // per verificare che almeno uno dei due sia presente
                      trigger(`${fieldNamePrefix}.${index}.postalAccount`);
                    }}
                  />
                )}
              />
            </Grid>

            {/* Conto Corrente Postale */}
            <Grid item xs={12}>
              <Controller
                name={`${fieldNamePrefix}.${index}.postalAccount`}
                control={control}
                rules={{
                  validate: {
                    postalAccountFormat: fieldValidators.validatePostalAccount,
                    paymentMethod: (value) => {
                      const iban = getValues(
                        `${fieldNamePrefix}.${index}.iban`
                      );
                      return validatePaymentMethod(index, iban, value);
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
                      // per verificare che almeno uno dei due sia presente
                      trigger(`${fieldNamePrefix}.${index}.iban`);
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  />
                )}
              />
            </Grid>

            {/* Codice Tassonomico */}
            <Grid item xs={12}>
              <Controller
                name={`${fieldNamePrefix}.${index}.taxonomyCode`}
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
                    error={hasFieldError('taxonomyCode', index)}
                    helperText={getFieldErrorMessage('taxonomyCode', index)}
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
};

export default BeneficiaryField;
