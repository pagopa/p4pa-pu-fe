import { useEffect, useState, useRef } from 'react';
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

// ===== TYPES =====
type BeneficiaryFieldValidators = {
  validateBeneficiaryTaxCode: (value: string) => string | undefined;
  validateIBAN: (value: string) => string | undefined;
  validatePostalAccount: (value: string) => string | undefined;
  validatePaymentMethod: (
    iban: string,
    postalAccount: string
  ) => string | undefined;
};

export type BeneficiaryData = {
  entityName: string;
  amount: string;
  taxCode: string;
  iban: string;
  postalAccount: string;
  taxonomyCode: string;
  id?: string;
  isNew?: boolean;
};

export type BeneficiaryFormValues = {
  beneficiaries: Array<BeneficiaryData>;
};

type BeneficiaryFieldPath<T extends FieldValues> = FieldArrayPath<T>;

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
  readonly onBeneficiariesChange?: (
    summary: Array<{
      id: string;
      index: number;
      isNew: boolean;
      dati: Record<string, unknown>;
    }>
  ) => void;
};

enum BeneficiaryFields {
  EntityName = 'entityName',
  Amount = 'amount',
  TaxCode = 'taxCode',
  Iban = 'iban',
  PostalAccount = 'postalAccount',
  TaxonomyCode = 'taxonomyCode'
}

// ===== UTILITY FUNCTIONS =====
// Helper per costruire un path tipizzato per i campi del form
function buildFieldPath<T extends FieldValues, K extends keyof BeneficiaryData>(
  fieldNamePrefix: string,
  index: number,
  field: K
): Path<T> {
  return `${fieldNamePrefix}.${index}.${field}` as Path<T>;
}

// Verifica se un valore di stringa è vuoto
function isEmpty(value?: string | unknown): boolean {
  if (typeof value !== 'string') {
    return true;
  }
  return !value || value.trim() === '';
}

// Ottiene i dati di errore dal form
function getErrorData<T extends FieldValues>(
  errors: FieldErrors<T>,
  fieldNamePrefix: string,
  index: number,
  fieldName: BeneficiaryFields
) {
  const fieldErrors = (
    errors[fieldNamePrefix] as unknown as Record<
      number,
      FieldErrors<BeneficiaryData>
    >
  )?.[index];

  return {
    hasError: !!fieldErrors?.[fieldName],
    errorMessage: (fieldErrors?.[fieldName]?.message as string) || ''
  };
}

// ===== VALIDATION CONTEXT =====
// Contesto di validazione usato da molte funzioni
type ValidationContext<T extends FieldValues> = {
  id: string;
  index: number;
  isSubmitted: boolean;
  wasSubmittedRef: React.RefObject<boolean>;
  existingBeneficiaries: Record<string, boolean>;
  errors: FieldErrors<T>;
  fieldNamePrefix: string;
  getValues: UseFormGetValues<T>;
  t: (key: string) => string;
};

// ===== VALIDATION FUNCTIONS =====
// Verifica se un beneficiario è nuovo (aggiunto dopo il submit)
function isBeneficiaryNew(
  id: string,
  wasSubmittedRef: React.RefObject<boolean>,
  existingBeneficiaries: Record<string, boolean>
): boolean {
  return !!wasSubmittedRef.current && !existingBeneficiaries[id];
}

// Verifica se un beneficiario è appena creato (nuovo)
function isRecentlyCreated(
  id: string,
  wasSubmittedRef: React.RefObject<boolean>,
  existingBeneficiaries: Record<string, boolean>
): boolean {
  if (!wasSubmittedRef.current) {
    return true;
  }
  return !existingBeneficiaries[id];
}

// Determina se mostrare errori di validazione per un beneficiario
function shouldShowValidationErrors(
  id: string,
  isSubmitted: boolean,
  wasSubmittedRef: React.RefObject<boolean>,
  existingBeneficiaries: Record<string, boolean>
): boolean {
  return (
    isSubmitted &&
    !(
      isRecentlyCreated(id, wasSubmittedRef, existingBeneficiaries) &&
      !wasSubmittedRef.current
    )
  );
}

// Controlla se è necessario mostrare errori di validazione
function shouldSkipValidation<T extends FieldValues>(
  context: ValidationContext<T>
): boolean {
  return !shouldShowValidationErrors(
    context.id,
    context.isSubmitted,
    context.wasSubmittedRef,
    context.existingBeneficiaries
  );
}

// Verifica se un campo ha errori
function hasFieldError<T extends FieldValues>(
  fieldName: BeneficiaryFields,
  context: ValidationContext<T>
): boolean {
  if (shouldSkipValidation(context)) {
    return false;
  }

  return (
    context.isSubmitted &&
    getErrorData(
      context.errors,
      context.fieldNamePrefix,
      context.index,
      fieldName
    ).hasError
  );
}

// Ottiene il messaggio di errore di un campo
function getFieldErrorMessage<T extends FieldValues>(
  fieldName: BeneficiaryFields,
  context: ValidationContext<T>
): string {
  if (shouldSkipValidation(context)) {
    return '';
  }

  return context.isSubmitted
    ? getErrorData(
        context.errors,
        context.fieldNamePrefix,
        context.index,
        fieldName
      ).errorMessage
    : '';
}

// Ottiene un campo dal form
function getFieldValue<T extends FieldValues, K extends keyof BeneficiaryData>(
  context: ValidationContext<T>,
  field: K
): string {
  return context.getValues(
    buildFieldPath<T, K>(context.fieldNamePrefix, context.index, field)
  );
}

// Verifica i pagamenti (IBAN e conto postale)
function checkPaymentFields<T extends FieldValues>(
  context: ValidationContext<T>
): { iban: string; postalAccount: string; bothEmpty: boolean } {
  const iban = getFieldValue(context, 'iban');
  const postalAccount = getFieldValue(context, 'postalAccount');
  const bothEmpty = isEmpty(iban) && isEmpty(postalAccount);

  return { iban, postalAccount, bothEmpty };
}

// Valida un singolo importo
function validateSingleAmount<T extends FieldValues>(
  value: string,
  context: ValidationContext<T>
): string | undefined {
  const amount = parseFloat(value);
  if (
    isRecentlyCreated(
      context.id,
      context.wasSubmittedRef,
      context.existingBeneficiaries
    ) &&
    !context.wasSubmittedRef.current
  ) {
    return undefined;
  }
  if (isNaN(amount) || amount <= 0) {
    return context.t(
      'debtPositionCreateWizard.step3.beneficiary.amount.invalid'
    );
  }
  return undefined;
}

// Verifica errori del campo IBAN
function hasIBANError<T extends FieldValues>(
  context: ValidationContext<T>
): boolean {
  if (shouldSkipValidation(context)) {
    return false;
  }
  // Se il conto postale è valorizzato, non mostriamo errori sull'IBAN
  const { postalAccount } = checkPaymentFields(context);
  if (!isEmpty(postalAccount)) {
    return false;
  }
  return getErrorData(
    context.errors,
    context.fieldNamePrefix,
    context.index,
    BeneficiaryFields.Iban
  ).hasError;
}

// Ottiene il messaggio di errore del campo IBAN
function getIBANErrorMessage<T extends FieldValues>(
  context: ValidationContext<T>
): string {
  if (shouldSkipValidation(context)) {
    return '';
  }
  const { postalAccount, bothEmpty } = checkPaymentFields(context);
  // Se il conto postale è valorizzato, non mostriamo messaggi di errore sull'IBAN
  if (!isEmpty(postalAccount)) {
    return '';
  }
  // Controlla se entrambi i metodi di pagamento sono mancanti
  if (bothEmpty) {
    return context.t(
      'debtPositionCreateWizard.step3.beneficiary.paymentMethod.required'
    );
  }
  // Errore specifico IBAN
  return getErrorData(
    context.errors,
    context.fieldNamePrefix,
    context.index,
    BeneficiaryFields.Iban
  ).errorMessage;
}

// Verifica errori del campo conto postale
function hasPostalAccountError<T extends FieldValues>(
  context: ValidationContext<T>
): boolean {
  if (shouldSkipValidation(context)) {
    return false;
  }

  // Se l'IBAN è valorizzato, non mostriamo errori sul conto postale
  const { iban } = checkPaymentFields(context);
  if (!isEmpty(iban)) {
    return false;
  }

  return getErrorData(
    context.errors,
    context.fieldNamePrefix,
    context.index,
    BeneficiaryFields.PostalAccount
  ).hasError;
}

// Ottiene il messaggio di errore del campo conto postale
function getPostalAccountErrorMessage<T extends FieldValues>(
  context: ValidationContext<T>
): string {
  if (shouldSkipValidation(context)) {
    return '';
  }
  const { iban, bothEmpty } = checkPaymentFields(context);
  // Se l'IBAN è valorizzato, non mostriamo messaggi di errore sul conto postale
  if (!isEmpty(iban)) {
    return '';
  }
  // Controlla se entrambi i metodi di pagamento sono mancanti
  if (bothEmpty) {
    return context.t(
      'debtPositionCreateWizard.step3.beneficiary.paymentMethod.required'
    );
  }

  // Errore specifico conto postale
  return getErrorData(
    context.errors,
    context.fieldNamePrefix,
    context.index,
    BeneficiaryFields.PostalAccount
  ).errorMessage;
}

// Crea regole di validazione base per i campi
function createBaseValidationRule(
  wasSubmittedRef: React.RefObject<boolean>,
  validator: (value: string) => string | undefined
) {
  return (value: string): string | undefined => {
    // Non validare se non è stato fatto submit
    if (wasSubmittedRef.current === false) {
      return undefined;
    }
    return validator(value);
  };
}

// Regole di validazione per il campo codice fiscale
function getTaxCodeValidationRules(
  t: (key: string) => string,
  wasSubmittedRef: React.RefObject<boolean>,
  fieldValidators: BeneficiaryFieldValidators
) {
  return {
    required: t('debtPositionCreateWizard.step3.beneficiary.taxCode.required'),
    validate: {
      taxCodeFormat: createBaseValidationRule(
        wasSubmittedRef,
        fieldValidators.validateBeneficiaryTaxCode
      )
    }
  };
}

// Regole per la validazione dei metodi di pagamento
function createPaymentMethodValidator(
  getOtherFieldValue: () => string,
  validator: (value1: string, value2: string) => string | undefined
) {
  return (value: string): string | undefined => {
    const otherValue = getOtherFieldValue();
    // Se uno dei due è valorizzato, non mostrare errori
    if (!isEmpty(value) || !isEmpty(otherValue)) {
      return undefined;
    }
    return validator(value, otherValue);
  };
}

// Regole di validazione per il campo IBAN
function getIBANValidationRules<T extends FieldValues>(
  index: number,
  wasSubmittedRef: React.RefObject<boolean>,
  fieldNamePrefix: string,
  getValues: UseFormGetValues<T>,
  fieldValidators: BeneficiaryFieldValidators
) {
  return {
    validate: {
      ibanFormat: fieldValidators.validateIBAN,
      paymentMethod: createBaseValidationRule(wasSubmittedRef, (value) => {
        const getPostalAccount = () =>
          getValues(
            buildFieldPath<T, 'postalAccount'>(
              fieldNamePrefix,
              index,
              'postalAccount'
            )
          );

        return createPaymentMethodValidator(
          getPostalAccount,
          fieldValidators.validatePaymentMethod
        )(value);
      })
    }
  };
}

// Regole di validazione per il campo conto postale
function getPostalAccountValidationRules<T extends FieldValues>(
  index: number,
  wasSubmittedRef: React.RefObject<boolean>,
  fieldNamePrefix: string,
  getValues: UseFormGetValues<T>,
  fieldValidators: BeneficiaryFieldValidators
) {
  return {
    validate: {
      postalAccountFormat: fieldValidators.validatePostalAccount,
      paymentMethod: createBaseValidationRule(wasSubmittedRef, (value) => {
        const getIban = () =>
          getValues(buildFieldPath<T, 'iban'>(fieldNamePrefix, index, 'iban'));

        return createPaymentMethodValidator(getIban, (postal, iban) =>
          fieldValidators.validatePaymentMethod(iban, postal)
        )(value);
      })
    }
  };
}

// ===== EVENT HANDLERS =====
// Formatta e gestisci il campo importo
function handleAmountChange<T extends FieldValues>(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  onChange: (...event: Array<unknown>) => void,
  index: number,
  fields: Array<Record<string, unknown>>,
  trigger: UseFormTrigger<T>,
  fieldNamePrefix: string
) {
  // Accetta solo numeri, punto e virgola
  const filteredValue = e.target.value.replace(/[^0-9.,]/g, '');
  // Converti virgola in punto per la gestione numerica interna
  const normalizedValue = filteredValue.replace(',', '.');
  onChange(normalizedValue);

  // Aggiorna la validazione degli altri importi
  if (fields.length > 1) {
    fields.forEach((_, i) => {
      if (i !== index) {
        trigger(`${fieldNamePrefix}.${i}.amount` as Path<T>);
      }
    });
  }
}

// Gestisci la modifica del campo IBAN
function handleIBANChange<T extends FieldValues>(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  onChange: (...event: Array<unknown>) => void,
  index: number,
  trigger: UseFormTrigger<T>,
  fieldNamePrefix: string
) {
  // Converti in maiuscolo
  const upperValue = e.target.value.toUpperCase();
  onChange(upperValue);

  // Rivalidare il campo conto postale quando IBAN cambia
  trigger(`${fieldNamePrefix}.${index}.postalAccount` as Path<T>);
}

// Gestisci la modifica del campo conto postale
function handlePostalAccountChange<T extends FieldValues>(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  onChange: (...event: Array<unknown>) => void,
  index: number,
  trigger: UseFormTrigger<T>,
  fieldNamePrefix: string
) {
  // Accetta solo caratteri numerici
  const filteredValue = e.target.value.replace(/\D/g, '');
  onChange(filteredValue);

  // Rivalidare il campo IBAN quando conto postale cambia
  trigger(`${fieldNamePrefix}.${index}.iban` as Path<T>);
}

function handleAmountBlur(
  e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  onChange: (...event: Array<unknown>) => void,
  onBlur: () => void
) {
  // Formatta il valore con due decimali quando il campo perde il focus
  const value = e.target.value.replace(',', '.');
  if (value && !isNaN(parseFloat(value))) {
    onChange(parseFloat(value).toFixed(2));
  }
  onBlur();
}

// ===== RENDER FUNCTIONS =====
function renderBeneficiaryHeader(
  index: number,
  t: (key: string) => string,
  removeBeneficiary: (index: number) => void
) {
  return (
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
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          {t('debtPositionCreateWizard.step3.beneficiary.title')}
        </Typography>
      </Box>
      <Button
        onClick={() => removeBeneficiary(index)}
        startIcon={<DeleteOutlineIcon />}
        color="error"
        variant="text"
        sx={{ position: 'absolute', top: 8, right: 8, minWidth: 'auto' }}
      >
        {t('commons.delete')}
      </Button>
    </Box>
  );
}

// Componente principale
function BeneficiaryField<T extends FieldValues>({
  control,
  isSubmitted,
  errors,
  totalAmount,
  fieldNamePrefix,
  disabled = false,
  getValues,
  trigger,
  onToggleMultibeneficiary,
  onBeneficiariesChange
}: BeneficiaryFieldProps<T>) {
  // ===== CONSTANTS =====
  const MAX_BENEFICIARIES = 4;
  const { t } = useTranslation();

  // ===== STATE & REFS =====
  const [existingBeneficiaries, setExistingBeneficiaries] = useState<
    Record<string, boolean>
  >({});
  const wasSubmittedRef = useRef(false);
  const isInitializingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  // ===== FIELD ARRAY =====
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldNamePrefix
  });

  // ===== VALIDATORS =====
  const validators = createBeneficiaryValidators(
    t,
    getValues,
    fieldNamePrefix,
    totalAmount
  );
  const fieldValidators = createBeneficiaryFieldValidators(t);

  // ===== UTILITY FUNCTIONS =====
  // Ottieni il path completo per un campo
  function getFieldPath<K extends keyof BeneficiaryData>(
    index: number,
    field: K
  ): Path<T> {
    return buildFieldPath<T, K>(fieldNamePrefix, index, field);
  }

  // Ottieni un riepilogo dei beneficiari attuali
  function getBeneficiariesSummary() {
    return fields.map((field, index) => {
      const isNew = isBeneficiaryNew(
        field.id,
        wasSubmittedRef,
        existingBeneficiaries
      );
      return {
        id: field.id,
        index,
        isNew,
        dati: getValues(`${fieldNamePrefix}.${index}` as Path<T>),
        validazioneApplicata: wasSubmittedRef.current && !isNew
      };
    });
  }

  // Aggiorna la validazione di tutti i campi importo
  function updateAmountValidations() {
    fields.forEach((_, index) => {
      trigger(`${fieldNamePrefix}.${index}.amount` as Path<T>);
    });
  }

  // ===== BENEFICIARY MANAGEMENT =====
  // Aggiungi un nuovo beneficiario
  function addBeneficiary() {
    if (fields.length < MAX_BENEFICIARIES) {
      const newBeneficiary: BeneficiaryData = {
        entityName: '',
        amount: '',
        taxCode: '',
        iban: '',
        postalAccount: '',
        taxonomyCode: '',
        isNew: true
      };
      append(
        newBeneficiary as unknown as PathValue<T, BeneficiaryFieldPath<T>>
      );
    }
  }

  // Rimuovi un beneficiario
  function removeBeneficiary(index: number) {
    const remainingBeneficiaries = fields.length - 1;
    if (remainingBeneficiaries === 0 && onToggleMultibeneficiary) {
      onToggleMultibeneficiary(false);
    } else {
      remove(index);
      updateAmountValidations();
    }
  }

  // ===== EFFECT HOOKS =====
  // Registra i beneficiari esistenti al primo submit
  useEffect(() => {
    if (isSubmitted && !wasSubmittedRef.current) {
      // Prima volta che viene fatto submit - memorizziamo lo stato attuale dei beneficiari
      const currentBeneficiaries = fields.reduce<Record<string, boolean>>(
        (acc, field) => {
          acc[field.id] = true;
          return acc;
        },
        {}
      );
      setExistingBeneficiaries(currentBeneficiaries);
      wasSubmittedRef.current = true;
    }
  }, [isSubmitted, fields]);

  // Aggiorna validazione quando cambiano gli importi
  useEffect(() => {
    if (wasSubmittedRef.current) {
      fields.forEach((field, index) => {
        if (
          !isBeneficiaryNew(field.id, wasSubmittedRef, existingBeneficiaries)
        ) {
          trigger(`${fieldNamePrefix}.${index}` as Path<T>);
        }
      });
    }
  }, [trigger, fieldNamePrefix, fields, totalAmount]);

  // Inizializza il primo beneficiario se non ce ne sono
  useEffect(() => {
    if (fields.length === 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      isInitializingRef.current = true;
      addBeneficiary();
      isInitializingRef.current = false;
    }
  }, [fields.length]);

  // Notifica cambiamenti ai beneficiari
  useEffect(() => {
    if (onBeneficiariesChange && fields.length > 0) {
      onBeneficiariesChange(getBeneficiariesSummary());
    }
  }, [fields, onBeneficiariesChange]);

  // ===== RENDER FUNCTIONS =====
  // Renderizza il campo Nome Ente
  function renderEntityNameField(index: number) {
    return (
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
              error={hasFieldError(BeneficiaryFields.EntityName, {
                id: fields[index].id,
                index,
                isSubmitted,
                wasSubmittedRef,
                existingBeneficiaries,
                errors,
                fieldNamePrefix,
                getValues,
                t
              })}
              helperText={getFieldErrorMessage(BeneficiaryFields.EntityName, {
                id: fields[index].id,
                index,
                isSubmitted,
                wasSubmittedRef,
                existingBeneficiaries,
                errors,
                fieldNamePrefix,
                getValues,
                t
              })}
            />
          )}
        />
      </Grid>
    );
  }

  // Renderizza il campo Importo
  function renderAmountField(index: number) {
    return (
      <Grid item xs={12}>
        <Controller
          name={getFieldPath(index, 'amount')}
          control={control}
          rules={{
            required: t(
              'debtPositionCreateWizard.step3.beneficiary.amount.required'
            ),
            validate: {
              isValidAmount: (value) =>
                validateSingleAmount(value, {
                  id: fields[index].id,
                  index,
                  isSubmitted,
                  wasSubmittedRef,
                  existingBeneficiaries,
                  errors,
                  fieldNamePrefix,
                  getValues,
                  t
                }),
              singleBeneficiary: (value) =>
                validators.validateSingleBeneficiary(value, fields.length),
              totalAmount: () => validators.validateTotalAmount()
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
              disabled={disabled}
              value={
                field.value ? field.value.toString().replace('.', ',') : ''
              }
              error={hasFieldError(BeneficiaryFields.Amount, {
                id: fields[index].id,
                index,
                isSubmitted,
                wasSubmittedRef,
                existingBeneficiaries,
                errors,
                fieldNamePrefix,
                getValues,
                t
              })}
              helperText={getFieldErrorMessage(BeneficiaryFields.Amount, {
                id: fields[index].id,
                index,
                isSubmitted,
                wasSubmittedRef,
                existingBeneficiaries,
                errors,
                fieldNamePrefix,
                getValues,
                t
              })}
              onChange={(e) =>
                handleAmountChange(
                  e,
                  field.onChange,
                  index,
                  fields,
                  trigger,
                  fieldNamePrefix
                )
              }
              onBlur={(e) => handleAmountBlur(e, field.onChange, field.onBlur)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">€</InputAdornment>
                ),
                inputProps: {
                  inputMode: 'decimal',
                  style: { textAlign: 'left' }
                }
              }}
            />
          )}
        />
      </Grid>
    );
  }

  // Renderizza il campo Codice Fiscale
  function renderTaxCodeField(index: number) {
    return (
      <Grid item xs={12}>
        <Controller
          name={getFieldPath(index, 'taxCode')}
          control={control}
          rules={getTaxCodeValidationRules(t, wasSubmittedRef, fieldValidators)}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label={t(
                'debtPositionCreateWizard.step3.beneficiary.taxCode.label'
              )}
              required
              disabled={disabled}
              error={hasFieldError(BeneficiaryFields.TaxCode, {
                id: fields[index].id,
                index,
                isSubmitted,
                wasSubmittedRef,
                existingBeneficiaries,
                errors,
                fieldNamePrefix,
                getValues,
                t
              })}
              helperText={getFieldErrorMessage(BeneficiaryFields.TaxCode, {
                id: fields[index].id,
                index,
                isSubmitted,
                wasSubmittedRef,
                existingBeneficiaries,
                errors,
                fieldNamePrefix,
                getValues,
                t
              })}
              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
            />
          )}
        />
      </Grid>
    );
  }

  // Renderizza il campo IBAN
  function renderIBANField(index: number) {
    return (
      <Grid item xs={12}>
        <Controller
          name={getFieldPath(index, 'iban')}
          control={control}
          rules={getIBANValidationRules(
            index,
            wasSubmittedRef,
            fieldNamePrefix,
            getValues,
            fieldValidators
          )}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label={t('debtPositionCreateWizard.step3.beneficiary.iban.label')}
              disabled={disabled}
              error={hasIBANError({
                id: fields[index].id,
                index,
                isSubmitted,
                wasSubmittedRef,
                existingBeneficiaries,
                errors,
                fieldNamePrefix,
                getValues,
                t
              })}
              {...(hasIBANError({
                id: fields[index].id,
                index,
                isSubmitted,
                wasSubmittedRef,
                existingBeneficiaries,
                errors,
                fieldNamePrefix,
                getValues,
                t
              })
                ? {
                    helperText: getIBANErrorMessage({
                      id: fields[index].id,
                      index,
                      isSubmitted,
                      wasSubmittedRef,
                      existingBeneficiaries,
                      errors,
                      fieldNamePrefix,
                      getValues,
                      t
                    })
                  }
                : {})}
              onChange={(e) =>
                handleIBANChange(
                  e,
                  field.onChange,
                  index,
                  trigger,
                  fieldNamePrefix
                )
              }
            />
          )}
        />
      </Grid>
    );
  }

  // Renderizza il campo Conto Corrente Postale
  function renderPostalAccountField(index: number) {
    return (
      <Grid item xs={12}>
        <Controller
          name={getFieldPath(index, 'postalAccount')}
          control={control}
          rules={getPostalAccountValidationRules(
            index,
            wasSubmittedRef,
            fieldNamePrefix,
            getValues,
            fieldValidators
          )}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label={t(
                'debtPositionCreateWizard.step3.beneficiary.postalAccount.label'
              )}
              disabled={disabled}
              error={hasPostalAccountError({
                id: fields[index].id,
                index,
                isSubmitted,
                wasSubmittedRef,
                existingBeneficiaries,
                errors,
                fieldNamePrefix,
                getValues,
                t
              })}
              {...(hasPostalAccountError({
                id: fields[index].id,
                index,
                isSubmitted,
                wasSubmittedRef,
                existingBeneficiaries,
                errors,
                fieldNamePrefix,
                getValues,
                t
              })
                ? {
                    helperText: getPostalAccountErrorMessage({
                      id: fields[index].id,
                      index,
                      isSubmitted,
                      wasSubmittedRef,
                      existingBeneficiaries,
                      errors,
                      fieldNamePrefix,
                      getValues,
                      t
                    })
                  }
                : {})}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              onChange={(e) =>
                handlePostalAccountChange(
                  e,
                  field.onChange,
                  index,
                  trigger,
                  fieldNamePrefix
                )
              }
            />
          )}
        />
      </Grid>
    );
  }

  // Renderizza il campo Codice Tassonomico
  function renderTaxonomyCodeField(index: number) {
    return (
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
              error={hasFieldError(BeneficiaryFields.TaxonomyCode, {
                id: fields[index].id,
                index,
                isSubmitted,
                wasSubmittedRef,
                existingBeneficiaries,
                errors,
                fieldNamePrefix,
                getValues,
                t
              })}
              helperText={getFieldErrorMessage(BeneficiaryFields.TaxonomyCode, {
                id: fields[index].id,
                index,
                isSubmitted,
                wasSubmittedRef,
                existingBeneficiaries,
                errors,
                fieldNamePrefix,
                getValues,
                t
              })}
            />
          )}
        />
      </Grid>
    );
  }

  // Renderizza il pulsante Aggiungi Beneficiario
  function renderAddBeneficiaryButton(index: number): JSX.Element | null {
    if (index === fields.length - 1 && fields.length < MAX_BENEFICIARIES) {
      return (
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
              {t('debtPositionCreateWizard.step3.beneficiary.addBeneficiary')}
            </Button>
          </Box>
        </>
      );
    }
    return null;
  }

  // ===== MAIN RENDER =====
  return (
    <Box>
      {fields.map((field, index) => (
        <Paper
          key={field.id}
          sx={{
            p: 2,
            mb: 2,
            position: 'relative'
          }}
        >
          {renderBeneficiaryHeader(index, t, removeBeneficiary)}

          <Grid container spacing={2}>
            {renderEntityNameField(index)}
            {renderAmountField(index)}
            {renderTaxCodeField(index)}
            {renderIBANField(index)}
            {renderPostalAccountField(index)}
            {renderTaxonomyCodeField(index)}
          </Grid>

          {renderAddBeneficiaryButton(index)}
        </Paper>
      ))}
    </Box>
  );
}

export default BeneficiaryField;
