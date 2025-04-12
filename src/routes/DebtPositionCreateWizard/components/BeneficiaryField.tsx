import { useEffect, useState, useRef, useCallback } from 'react';
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
  id?: string; // Identificatore univoco per il beneficiario
  isNew?: boolean; // Indica se il beneficiario è nuovo o esistente
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
  readonly onBeneficiariesChange?: (
    summary: Array<{
      id: string;
      index: number;
      isNew: boolean;
      dati: any;
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
  onToggleMultibeneficiary,
  onBeneficiariesChange
}: BeneficiaryFieldProps<T>) {
  // Stato per tenere traccia dei beneficiari esistenti prima del submit
  const [existingBeneficiaries, setExistingBeneficiaries] = useState<
    Record<string, boolean>
  >({});
  const { t } = useTranslation();
  const MAX_BENEFICIARIES = 4;
  // Utilizzo di useRef per tenere traccia della condizione di submit precedente
  const wasSubmittedRef = useRef(false);
  // Utilizzo di useRef per tenere traccia dello stato di inizializzazione
  const isInitializingRef = useRef(false);
  // Utilizzo di useRef per evitare l'inizializzazione ripetuta
  const hasInitializedRef = useRef(false);
  // Utilizzo di useFieldArray per gestire un array di beneficiari
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldNamePrefix
  });

  // Importa le funzioni di validazione
  const validators = createBeneficiaryValidators(
    t,
    getValues,
    fieldNamePrefix,
    totalAmount
  );

  // Importa i validatori specifici per i campi del beneficiario
  const fieldValidators: BeneficiaryFieldValidators =
    createBeneficiaryFieldValidators(t);

  // Funzione per verificare se un beneficiario è nuovo (aggiunto dopo il submit)
  const isBeneficiaryNew = useCallback(
    (id: string): boolean => {
      // Un beneficiario è nuovo se non è presente tra quelli registrati al momento del submit
      // e se è stato effettuato almeno un submit
      return wasSubmittedRef.current && !existingBeneficiaries[id];
    },
    [existingBeneficiaries]
  );

  // Funzione per verificare se un beneficiario è appena creato (nuovo)
  const isRecentlyCreated = useCallback(
    (id: string): boolean => {
      // Se non c'è stato ancora un submit, tutti i beneficiari sono considerati nuovi
      if (!wasSubmittedRef.current) {
        return true;
      }
      // Altrimenti, controlla se è un nuovo beneficiario (aggiunto dopo il submit)
      return !existingBeneficiaries[id];
    },
    [existingBeneficiaries]
  );

  // Funzione che determina se mostrare errori di validazione per un beneficiario
  const shouldShowValidationErrors = useCallback(
    (id: string): boolean => {
      // Non mostrare errori per beneficiari appena creati
      return (
        isSubmitted && !(isRecentlyCreated(id) && !wasSubmittedRef.current)
      );
    },
    [isRecentlyCreated, isSubmitted]
  );

  // Helper per costruire un path tipizzato per i campi del form
  const getFieldPath = useCallback(
    <K extends keyof BeneficiaryData>(index: number, field: K): Path<T> => {
      return `${fieldNamePrefix}.${index}.${field}` as Path<T>;
    },
    [fieldNamePrefix]
  );

  // Helper per loggare le modifiche ai campi del beneficiario
  const logFieldChange = useCallback(
    (index: number, fieldName: string, value: any) => {
      console.log(
        `✏️ Modifica campo '${fieldName}' per beneficiario #${index}:`,
        {
          id: fields[index].id,
          isNew: isBeneficiaryNew(fields[index].id),
          campo: fieldName,
          valore: value,
          timestamp: new Date().toISOString()
        }
      );
    },
    [fields, isBeneficiaryNew]
  );

  // Funzione per ottenere un riepilogo dei beneficiari
  const getBeneficiariesSummary = useCallback(() => {
    return fields.map((field, index) => {
      const isNew = isBeneficiaryNew(field.id);
      return {
        id: field.id,
        index,
        isNew,
        dati: getValues(`${fieldNamePrefix}.${index}` as Path<T>),
        validazioneApplicata: wasSubmittedRef.current && !isNew
      };
    });
  }, [fields, getValues, fieldNamePrefix, isBeneficiaryNew]);

  // Funzione per verificare se un campo ha errori
  const hasFieldError = useCallback(
    (fieldName: BeneficiaryFields, index: number): boolean => {
      // Verifichiamo se il beneficiario è nuovo (creato dopo il submit)
      if (shouldShowValidationErrors(fields[index].id) === false) {
        return false;
      }
      // Altrimenti, accediamo agli errori del form
      return (
        isSubmitted &&
        !!(
          errors[fieldNamePrefix] as unknown as Record<
            number,
            FieldErrors<BeneficiaryData>
          >
        )?.[index]?.[fieldName]
      );
    },
    [errors, fieldNamePrefix, fields, isSubmitted, shouldShowValidationErrors]
  );

  // Funzione per ottenere il messaggio di errore di un campo
  const getFieldErrorMessage = useCallback(
    (fieldName: BeneficiaryFields, index: number): string => {
      // Verifichiamo se il beneficiario è nuovo (creato dopo il submit)
      if (shouldShowValidationErrors(fields[index].id) === false) {
        return '';
      }

      // Altrimenti, accediamo ai messaggi di errore
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
    },
    [errors, fieldNamePrefix, fields, isSubmitted, shouldShowValidationErrors]
  );

  // Aggiorna la validazione di tutti i campi importo
  const updateAmountValidations = useCallback(() => {
    fields.forEach((_, index) => {
      trigger(`${fieldNamePrefix}.${index}.amount` as Path<T>);
    });
  }, [fields, fieldNamePrefix, trigger]);

  // Aggiungi un nuovo beneficiario
  const addBeneficiary = useCallback(() => {
    if (fields.length < MAX_BENEFICIARIES) {
      // Genera un ID univoco per il nuovo beneficiario
      const newId = `ben_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Crea il nuovo beneficiario con ID e flag isNew
      const newBeneficiary: BeneficiaryData = {
        entityName: '',
        amount: '',
        taxCode: '',
        iban: '',
        postalAccount: '',
        taxonomyCode: '',
        id: newId,
        isNew: true
      };

      // Aggiungi il beneficiario all'array
      append(
        newBeneficiary as unknown as PathValue<T, BeneficiaryFieldPath<T>>
      );

      // Log per tracking
      const isAutoCreated = isInitializingRef.current;
      console.log(
        `➕ ${isAutoCreated ? 'Creato automaticamente' : 'Aggiunto'} nuovo beneficiario:`,
        {
          id: newId,
          dati: newBeneficiary,
          totaleBeneficiari: fields.length + 1,
          timestamp: new Date().toISOString(),
          isFirstSubmit: !wasSubmittedRef.current, // Indica se è stato aggiunto prima del primo submit
          autoCreato: isAutoCreated
        }
      );
    }
  }, [fields.length, append]);

  // Rimuovi un beneficiario
  const removeBeneficiary = useCallback(
    (index: number) => {
      // Ottieni l'ID del beneficiario da rimuovere
      const beneficiaryId = fields[index].id;
      const isExistingBeneficiary = existingBeneficiaries[beneficiaryId];

      // Calcola il numero di beneficiari che rimarranno dopo la rimozione
      const remainingBeneficiaries = fields.length - 1;

      console.log('🗑️ Rimozione beneficiario:', {
        id: beneficiaryId,
        index,
        isEsistente: isExistingBeneficiary,
        dati: getValues(`${fieldNamePrefix}.${index}` as Path<T>)
      });

      if (remainingBeneficiaries === 0 && onToggleMultibeneficiary) {
        // Se non rimarrà nessun beneficiario, disattiva lo switch del multibeneficiario
        onToggleMultibeneficiary(false);
      } else {
        remove(index);
        // Aggiorna la validazione degli importi dopo la rimozione
        updateAmountValidations();
      }
    },
    [
      fields,
      existingBeneficiaries,
      fieldNamePrefix,
      getValues,
      onToggleMultibeneficiary,
      remove,
      updateAmountValidations
    ]
  );

  // Effetto per registrare i beneficiari esistenti quando viene fatto submit
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

      console.log('📋 Stato al momento del submit:', {
        beneficiari: fields.map((field) => ({
          id: field.id,
          dati: getValues(
            `${fieldNamePrefix}.${fields.findIndex((f) => f.id === field.id)}` as Path<T>
          ),
          isNew: false // al momento del submit, tutti i campi attuali sono considerati esistenti
        }))
      });

      wasSubmittedRef.current = true;
    }
  }, [isSubmitted, fields, fieldNamePrefix, getValues]);

  // Effetto per triggerare la validazione quando cambiano gli importi o l'importo totale
  useEffect(() => {
    // Solo se è già stato fatto submit, aggiorniamo la validazione dei campi esistenti
    if (wasSubmittedRef.current) {
      fields.forEach((field, index) => {
        // Validiamo solo i beneficiari che non sono nuovi
        if (!isBeneficiaryNew(field.id)) {
          trigger(`${fieldNamePrefix}.${index}` as Path<T>);
        }
      });
    }
  }, [trigger, fieldNamePrefix, fields, totalAmount, isBeneficiaryNew]);

  // Utilizzo di useEffect per inizializzare un nuovo beneficiario se l'array è vuoto
  useEffect(() => {
    // Se non ci sono beneficiari e non abbiamo già inizializzato
    if (fields.length === 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;

      isInitializingRef.current = true;
      addBeneficiary();
      isInitializingRef.current = false;

      console.log('🔄 Inizializzazione automatica beneficiario', {
        isSubmitted,
        wasSubmittedBefore: wasSubmittedRef.current,
        timestamp: new Date().toISOString()
      });
    }
  }, [fields.length, addBeneficiary, isSubmitted]);

  // Notifica al componente padre quando i beneficiari cambiano
  useEffect(() => {
    if (onBeneficiariesChange && fields.length > 0) {
      const summary = getBeneficiariesSummary();
      onBeneficiariesChange(summary);
    }
  }, [fields, onBeneficiariesChange, getBeneficiariesSummary]);

  // Esporta la funzione per l'uso esterno al momento del submit
  useEffect(() => {
    if (isSubmitted && fields.length > 0) {
      const summary = getBeneficiariesSummary();
      console.log('📊 Riepilogo beneficiari al submit:', summary);

      if (onBeneficiariesChange) {
        onBeneficiariesChange(summary);
      }

      // Genera un report dettagliato
      console.log('📑 Report completo dei beneficiari:', {
        totale: fields.length,
        nuovi: summary.filter((b) => b.isNew).length,
        esistenti: summary.filter((b) => !b.isNew).length,
        dettaglio: summary.map((b) => ({
          ...b,
          timestamp: new Date().toISOString(),
          statoValidazione: {
            hasErrors: Object.keys(BeneficiaryFields).some((field) =>
              hasFieldError(
                BeneficiaryFields[field as keyof typeof BeneficiaryFields],
                b.index
              )
            )
          }
        }))
      });
    }
  }, [
    isSubmitted,
    fields,
    getBeneficiariesSummary,
    onBeneficiariesChange,
    hasFieldError
  ]);

  // Funzione per verificare se il campo IBAN ha errori
  const hasIBANError = useCallback(
    (index: number): boolean => {
      // Se è un nuovo beneficiario e non dobbiamo mostrare errori di validazione
      if (!shouldShowValidationErrors(fields[index].id)) {
        return false;
      }

      // Se il conto postale è valorizzato, non mostriamo errori sull'IBAN
      const postalAccount = getValues(getFieldPath(index, 'postalAccount'));
      if (postalAccount && postalAccount.trim() !== '') {
        return false;
      }

      // Altrimenti controlliamo se ci sono errori sull'IBAN
      return !!(
        errors[fieldNamePrefix] as unknown as Record<
          number,
          FieldErrors<BeneficiaryData>
        >
      )?.[index]?.iban;
    },
    [
      errors,
      fieldNamePrefix,
      fields,
      getFieldPath,
      getValues,
      shouldShowValidationErrors
    ]
  );

  // Funzione per ottenere il messaggio di errore del campo IBAN
  const getIBANErrorMessage = useCallback(
    (index: number): string => {
      // Se è un nuovo beneficiario e non dobbiamo mostrare errori di validazione
      if (!shouldShowValidationErrors(fields[index].id)) {
        return '';
      }

      // Se il conto postale è valorizzato, non mostriamo messaggi di errore sull'IBAN
      const postalAccount = getValues(getFieldPath(index, 'postalAccount'));
      if (postalAccount && postalAccount.trim() !== '') {
        return '';
      }

      // Verifica se entrambi i campi sono vuoti
      const iban = getValues(getFieldPath(index, 'iban'));
      if (
        (!iban || iban.trim() === '') &&
        (!postalAccount || postalAccount.trim() === '')
      ) {
        return t(
          'debtPositionCreateWizard.step3.beneficiary.paymentMethod.required'
        );
      }

      return (
        ((
          errors[fieldNamePrefix] as unknown as Record<
            number,
            FieldErrors<BeneficiaryData>
          >
        )?.[index]?.iban?.message as string) || ''
      );
    },
    [
      errors,
      fieldNamePrefix,
      fields,
      getFieldPath,
      getValues,
      shouldShowValidationErrors,
      t
    ]
  );

  // Funzione per verificare se il campo conto corrente postale ha errori
  const hasPostalAccountError = useCallback(
    (index: number): boolean => {
      // Se è un nuovo beneficiario e non dobbiamo mostrare errori di validazione
      if (!shouldShowValidationErrors(fields[index].id)) {
        return false;
      }
      // Se l'IBAN è valorizzato, non mostriamo errori sul conto postale
      const iban = getValues(getFieldPath(index, 'iban'));
      if (iban && iban.trim() !== '') {
        return false;
      }
      // Altrimenti controlliamo se ci sono errori sul conto postale
      return !!(
        errors[fieldNamePrefix] as unknown as Record<
          number,
          FieldErrors<BeneficiaryData>
        >
      )?.[index]?.postalAccount;
    },
    [
      errors,
      fieldNamePrefix,
      fields,
      getFieldPath,
      getValues,
      shouldShowValidationErrors
    ]
  );

  // Funzione per ottenere il messaggio di errore del campo conto corrente postale
  const getPostalAccountErrorMessage = useCallback(
    (index: number): string => {
      // Se è un nuovo beneficiario e non dobbiamo mostrare errori di validazione
      if (!shouldShowValidationErrors(fields[index].id)) {
        return '';
      }
      // Se l'IBAN è valorizzato, non mostriamo messaggi di errore sul conto postale
      const iban = getValues(getFieldPath(index, 'iban'));
      if (iban && iban.trim() !== '') {
        return '';
      }
      // Verifica se entrambi i campi sono vuoti
      const postalAccount = getValues(getFieldPath(index, 'postalAccount'));
      if (
        (!iban || iban.trim() === '') &&
        (!postalAccount || postalAccount.trim() === '')
      ) {
        return t(
          'debtPositionCreateWizard.step3.beneficiary.paymentMethod.required'
        );
      }
      return (
        ((
          errors[fieldNamePrefix] as unknown as Record<
            number,
            FieldErrors<BeneficiaryData>
          >
        )?.[index]?.postalAccount?.message as string) || ''
      );
    },
    [
      errors,
      fieldNamePrefix,
      fields,
      getFieldPath,
      getValues,
      shouldShowValidationErrors,
      t
    ]
  );

  // Funzione per verificare che almeno uno tra IBAN e conto corrente postale sia presente
  const validatePaymentMethod = useCallback(
    (iban: string, postalAccount: string): boolean => {
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
    },
    [fieldValidators]
  );

  return (
    <Box>
      {fields.map((field, index) => {
        const isNew = isBeneficiaryNew(field.id);
        const shouldApplyValidation = wasSubmittedRef.current && !isNew;
        return (
          <Paper
            key={field.id}
            sx={{
              p: 2,
              mb: 2,
              position: 'relative'
            }}
          >
            <Box
              mb={2}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box display="flex" alignItems="center">
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mr: 1 }}
                >
                  {`${index + 1}. `}
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
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
                      onChange={(e) => {
                        field.onChange(e);
                        logFieldChange(index, 'entityName', e.target.value);
                      }}
                      onBlur={(e) => {
                        field.onBlur();
                        console.log(`🔄 Campo 'entityName' aggiornato`, {
                          id: fields[index].id,
                          isNew: isBeneficiaryNew(fields[index].id),
                          valoreFinale: e.target.value,
                          validazioneApplicata: shouldApplyValidation
                        });
                      }}
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
                      // Validazione per verificare che l'importo sia valido
                      isValidAmount: (value) => {
                        const amount = parseFloat(value);
                        // Se il beneficiario è nuovo, evitiamo la validazione
                        if (
                          isRecentlyCreated(fields[index].id) &&
                          !wasSubmittedRef.current
                        ) {
                          return true;
                        }
                        // Se l'importo non è un numero valido o è negativo
                        if (isNaN(amount) || amount <= 0) {
                          return t(
                            'debtPositionCreateWizard.step3.beneficiary.amount.invalid'
                          );
                        }
                        return true;
                      },
                      // Validazione per beneficiario singolo
                      singleBeneficiary: (value) => {
                        // Se il beneficiario è nuovo, evitiamo la validazione
                        if (
                          isRecentlyCreated(fields[index].id) &&
                          !wasSubmittedRef.current
                        ) {
                          return true;
                        }
                        return validators.validateSingleBeneficiary(
                          value,
                          fields.length
                        );
                      },
                      // Validazione degli importi totali
                      totalAmount: () => {
                        // Se il beneficiario è nuovo, evitiamo la validazione
                        if (
                          isRecentlyCreated(fields[index].id) &&
                          !wasSubmittedRef.current
                        ) {
                          return true;
                        }
                        return validators.validateTotalAmount();
                      }
                    }
                  }}
                  render={({ field }) => {
                    return (
                      <TextField
                        {...field}
                        fullWidth
                        label={t(
                          'debtPositionCreateWizard.step3.beneficiary.amount.label'
                        )}
                        required
                        disabled={disabled}
                        value={
                          field.value
                            ? field.value.toString().replace('.', ',')
                            : ''
                        }
                        error={hasFieldError(BeneficiaryFields.Amount, index)}
                        helperText={getFieldErrorMessage(
                          BeneficiaryFields.Amount,
                          index
                        )}
                        onChange={(e) => {
                          // Accetta solo numeri, punto e virgola
                          const filteredValue = e.target.value.replace(
                            /[^0-9.,]/g,
                            ''
                          );
                          // Converti virgola in punto per la gestione numerica interna
                          const normalizedValue = filteredValue.replace(
                            ',',
                            '.'
                          );

                          field.onChange(normalizedValue);
                          logFieldChange(index, 'amount', normalizedValue);

                          // Aggiorna la validazione degli altri importi
                          if (fields.length > 1) {
                            fields.forEach((_, i) => {
                              if (i !== index) {
                                trigger(
                                  `${fieldNamePrefix}.${i}.amount` as Path<T>
                                );
                              }
                            });
                          }
                        }}
                        onBlur={(e) => {
                          // Formatta il valore con due decimali quando il campo perde il focus
                          const value = e.target.value.replace(',', '.');
                          if (value && !isNaN(parseFloat(value))) {
                            const formatted = parseFloat(value).toFixed(2);
                            // Salva il valore con punto per calcoli interni
                            field.onChange(formatted);
                          }

                          field.onBlur();
                          console.log(`🔄 Campo 'amount' aggiornato`, {
                            id: fields[index].id,
                            isNew: isBeneficiaryNew(fields[index].id),
                            valoreFinale: field.value,
                            valoreVisualizzato: field.value
                              ? field.value.toString().replace('.', ',')
                              : '',
                            validazioneApplicata: shouldApplyValidation
                          });
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">€</InputAdornment>
                          ),
                          // Formatta la visualizzazione con virgola
                          inputProps: {
                            inputMode: 'decimal',
                            style: { textAlign: 'left' }
                          }
                        }}
                      />
                    );
                  }}
                />
              </Grid>

              {/* Codice fiscale */}
              <Grid item xs={12}>
                <Controller
                  name={getFieldPath(index, 'taxCode')}
                  control={control}
                  rules={{
                    required: t(
                      'debtPositionCreateWizard.step3.beneficiary.taxCode.required'
                    ),
                    validate: {
                      taxCodeFormat: (value) => {
                        // Se il beneficiario è nuovo, evitiamo la validazione
                        if (
                          isRecentlyCreated(fields[index].id) &&
                          !wasSubmittedRef.current
                        ) {
                          return true;
                        }
                        return fieldValidators.validateBeneficiaryTaxCode(
                          value
                        );
                      }
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
                      error={hasFieldError(BeneficiaryFields.TaxCode, index)}
                      helperText={getFieldErrorMessage(
                        BeneficiaryFields.TaxCode,
                        index
                      )}
                      onChange={(e) => {
                        const upper = e.target.value.toUpperCase();
                        field.onChange(upper);
                        logFieldChange(index, 'taxCode', upper);
                      }}
                      onBlur={(e) => {
                        field.onBlur();
                        console.log(`🔄 Campo 'taxCode' aggiornato`, {
                          id: fields[index].id,
                          isNew: isBeneficiaryNew(fields[index].id),
                          isRecentlyCreated: isRecentlyCreated(
                            fields[index].id
                          ),
                          showValidationErrors: shouldShowValidationErrors(
                            fields[index].id
                          ),
                          valoreFinale: e.target.value
                        });
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
                        // Se il beneficiario è nuovo, evitiamo la validazione
                        if (
                          isRecentlyCreated(fields[index].id) &&
                          !wasSubmittedRef.current
                        ) {
                          return true;
                        }

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
                      {...(hasIBANError(index)
                        ? { helperText: getIBANErrorMessage(index) }
                        : {})}
                      onChange={(e) => {
                        const upper = e.target.value.toUpperCase();
                        field.onChange(upper);
                        logFieldChange(index, 'iban', upper);

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
                          // Evita la validazione per i nuovi beneficiari
                          if (shouldShowValidationErrors(fields[index].id)) {
                            trigger(getFieldPath(index, 'postalAccount'));
                          }
                        }
                      }}
                      onBlur={(e) => {
                        field.onBlur();
                        console.log(`🔄 Campo 'iban' aggiornato`, {
                          id: fields[index].id,
                          isNew: isBeneficiaryNew(fields[index].id),
                          isRecentlyCreated: isRecentlyCreated(
                            fields[index].id
                          ),
                          showValidationErrors: shouldShowValidationErrors(
                            fields[index].id
                          ),
                          valoreFinale: e.target.value
                        });
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
                      postalAccountFormat:
                        fieldValidators.validatePostalAccount,
                      paymentMethod: (value): boolean => {
                        // Se il beneficiario è nuovo, evitiamo la validazione
                        if (
                          isRecentlyCreated(fields[index].id) &&
                          !wasSubmittedRef.current
                        ) {
                          return true;
                        }

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
                      {...(hasPostalAccountError(index)
                        ? { helperText: getPostalAccountErrorMessage(index) }
                        : {})}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        logFieldChange(index, 'postalAccount', e.target.value);

                        // Rivalidare l'IBAN quando cambia il conto corrente postale
                        // solo se conto corrente postale è vuoto
                        const iban = getValues(getFieldPath(index, 'iban'));
                        // Se il conto postale è vuoto e anche l'IBAN è vuoto
                        if (
                          (!e.target.value || e.target.value.trim() === '') &&
                          (!iban || iban.trim() === '')
                        ) {
                          // Evita la validazione per i nuovi beneficiari
                          if (shouldShowValidationErrors(fields[index].id)) {
                            trigger(getFieldPath(index, 'iban'));
                          }
                        }
                      }}
                      onBlur={(e) => {
                        field.onBlur();
                        console.log(`🔄 Campo 'postalAccount' aggiornato`, {
                          id: fields[index].id,
                          isNew: isBeneficiaryNew(fields[index].id),
                          isRecentlyCreated: isRecentlyCreated(
                            fields[index].id
                          ),
                          showValidationErrors: shouldShowValidationErrors(
                            fields[index].id
                          ),
                          valoreFinale: e.target.value
                        });
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
                      error={hasFieldError(
                        BeneficiaryFields.TaxonomyCode,
                        index
                      )}
                      helperText={getFieldErrorMessage(
                        BeneficiaryFields.TaxonomyCode,
                        index
                      )}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        logFieldChange(index, 'taxonomyCode', e.target.value);
                      }}
                      onBlur={(e) => {
                        field.onBlur();
                        console.log(`🔄 Campo 'taxonomyCode' aggiornato`, {
                          id: fields[index].id,
                          isNew: isBeneficiaryNew(fields[index].id),
                          isRecentlyCreated: isRecentlyCreated(
                            fields[index].id
                          ),
                          showValidationErrors: shouldShowValidationErrors(
                            fields[index].id
                          ),
                          valoreFinale: e.target.value
                        });
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Altri campi commentati ... */}
            </Grid>

            {/* Divider e pulsante Aggiungi solo nell'ultimo beneficiario */}
            {index === fields.length - 1 &&
              fields.length < MAX_BENEFICIARIES && (
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
        );
      })}
    </Box>
  );
}

// Esporta solo il componente di default senza utilizzare esportazioni nominate
export default BeneficiaryField;
