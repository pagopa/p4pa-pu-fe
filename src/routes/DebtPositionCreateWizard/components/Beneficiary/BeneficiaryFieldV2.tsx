import { useTranslation } from 'react-i18next';
import React, { forwardRef, useImperativeHandle } from 'react';
import {
  Control,
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger,
  FieldErrors,
  FieldValues,
  FieldArrayPath
} from 'react-hook-form';
import { Grid, Paper, Box, Button, Divider } from '@mui/material';
import { Add } from '@mui/icons-material';
import { BeneficiaryHeader } from './BeneficiaryFieldComponents';
import { BeneficiaryValidationContext } from '../../../../utils/BeneficiaryFieldHelpers';
import {
  BeneficiaryIdentityFields,
  BeneficiaryAmountFields,
  BeneficiaryPaymentFields,
  BeneficiaryClassificationFields
} from './BeneficiaryFieldGroup';
import { useBeneficiaryManagementV2 } from '../../../../hooks/useBeneficiaryManagementV2';
import { useInstallmentBeneficiaryManagementV2 } from '../../../../hooks/useInstallmentBeneficiaryManagementV2';

// ===== TYPES =====
type BeneficiaryField = Record<string, unknown> & { id: string };

// Tipo per le funzioni esposte dal ref
export type BeneficiaryFieldRef = {
  resetAllBeneficiaries?: () => void;
};

type BeneficiaryFieldProps<T extends FieldValues = FieldValues> = {
  readonly control: Control<T>;
  readonly isSubmitted: boolean;
  readonly errors: FieldErrors<T>;
  readonly totalAmount: string;
  readonly fieldNamePrefix: string;
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
  readonly isInsideInstallment?: boolean;
  readonly installmentIndex?: number;
  readonly installmentsFieldNamePrefix?: string;
};

/**
 * Componente principale per la gestione dei beneficiari - Versione migliorata con useReducer
 * Permette l'aggiunta, rimozione e validazione di fino a 4 beneficiari
 * Mantiene la stessa UI ma utilizza gli hook con reducer per una gestione dello stato migliore
 */
// Utilizziamo una definizione di tipo esplicita per risolvere i problemi di inferenza dei tipi
interface BeneficiaryFieldComponent {
  <T extends FieldValues>(
    props: BeneficiaryFieldProps<T> & {
      ref?: React.ForwardedRef<BeneficiaryFieldRef>;
    }
  ): React.ReactElement;
  displayName?: string;
}

// Definiamo il componente interno senza tipi generici
const InternalBeneficiaryField = <T extends FieldValues>(
  props: BeneficiaryFieldProps<T>,
  ref: React.ForwardedRef<BeneficiaryFieldRef>
) => {
  const {
    control,
    isSubmitted,
    errors,
    totalAmount,
    fieldNamePrefix,
    disabled = false,
    setValue,
    getValues,
    trigger,
    onToggleMultibeneficiary,
    onBeneficiariesChange,
    isInsideInstallment = false,
    installmentIndex,
    installmentsFieldNamePrefix
  } = props;

  const { t } = useTranslation();

  // Utilizziamo gli hook migliorati in base al contesto
  const beneficiaryManager =
    isInsideInstallment &&
    installmentIndex !== undefined &&
    installmentsFieldNamePrefix
      ? useInstallmentBeneficiaryManagementV2<T>({
          control,
          index: installmentIndex,
          installmentsFieldNamePrefix,
          isSubmitted,
          getValues,
          setValue,
          trigger,
          onToggleMultibeneficiary
        })
      : useBeneficiaryManagementV2<T>({
          control,
          fieldNamePrefix: fieldNamePrefix as FieldArrayPath<T>,
          isSubmitted,
          getValues,
          trigger,
          totalAmount,
          onToggleMultibeneficiary,
          onBeneficiariesChange
        });

  const {
    fields,
    validators,
    fieldValidators,
    MAX_BENEFICIARIES,
    existingBeneficiaries,
    wasSubmittedRef,
    addBeneficiary,
    removeBeneficiary,
    resetAllBeneficiaries
  } = beneficiaryManager;

  // Esponiamo il metodo resetAllBeneficiaries tramite il ref
  useImperativeHandle(ref, () => ({
    resetAllBeneficiaries
  }));

  /**
   * Renderizza il pulsante per aggiungere un nuovo beneficiario
   * Visibile solo sull'ultimo beneficiario e se non è stato raggiunto il limite massimo
   */
  const renderAddBeneficiaryButton = (index: number): JSX.Element | null => {
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
  };

  /**
   * Crea il contesto di validazione per un beneficiario
   */
  const createValidationContext = (
    field: BeneficiaryField,
    index: number
  ): BeneficiaryValidationContext<T> => {
    return {
      id: field.id,
      index,
      isSubmitted,
      wasSubmittedRef,
      existingBeneficiaries,
      errors,
      fieldNamePrefix,
      getValues,
      t
    };
  };

  /**
   * Renderizza un singolo beneficiario con i suoi gruppi di campi
   */
  const renderBeneficiary = (field: BeneficiaryField, index: number) => {
    const validationContext = createValidationContext(field, index);

    return (
      <Paper
        key={field.id}
        sx={{
          p: 2,
          mb: 2,
          position: 'relative'
        }}
      >
        <BeneficiaryHeader index={index} t={t} onRemove={removeBeneficiary} />

        <Grid container spacing={2}>
          {/* Sezione dati anagrafici */}
          <BeneficiaryIdentityFields
            control={control}
            index={index}
            fieldNamePrefix={fieldNamePrefix}
            validationContext={validationContext}
            disabled={disabled}
            t={t}
          />

          {/* Sezione importo */}
          <BeneficiaryAmountFields
            control={control}
            index={index}
            fieldNamePrefix={fieldNamePrefix}
            validationContext={validationContext}
            disabled={disabled}
            fields={fields as Array<Record<'id', string>>}
            validators={
              validators as unknown as {
                isValidTotalAmount: () => boolean;
                isSingleBeneficiaryAmountValid: (
                  hasSingleBeneficiary: boolean
                ) => boolean;
                validateTotalAmount: () => string | true;
                validateSingleBeneficiary: (
                  amount: string,
                  fieldsLength: number
                ) => string | true;
                isBeneficiaryAmountValid: (
                  index: number,
                  hasSingleBeneficiary: boolean
                ) => boolean;
              }
            }
            trigger={trigger}
            t={t}
          />

          {/* Sezione dati di pagamento */}
          <BeneficiaryPaymentFields
            control={control}
            index={index}
            fieldNamePrefix={fieldNamePrefix}
            validationContext={validationContext}
            disabled={disabled}
            getValues={getValues}
            trigger={trigger}
            errors={errors}
            fieldValidators={
              fieldValidators as unknown as {
                validateBeneficiaryTaxCode: (
                  value: string
                ) => string | undefined;
                validateIBAN: (value: string) => string | undefined;
                validatePostalAccount: (value: string) => string | undefined;
                validatePaymentMethod: (
                  iban: string,
                  postalAccount: string
                ) => string | undefined;
              }
            }
            t={t}
          />

          {/* Sezione dati di classificazione */}
          <BeneficiaryClassificationFields
            control={control}
            index={index}
            fieldNamePrefix={fieldNamePrefix}
            validationContext={validationContext}
            disabled={disabled}
            t={t}
          />
        </Grid>

        {renderAddBeneficiaryButton(index)}
      </Paper>
    );
  };

  // ===== MAIN RENDER =====
  return (
    <Box>
      {fields.map((field, index) =>
        renderBeneficiary(field as BeneficiaryField, index)
      )}
    </Box>
  );
};

// Utilizziamo forwardRef con il tipo generico definito sopra
const BeneficiaryFieldV2 = React.forwardRef(
  InternalBeneficiaryField
) as unknown as BeneficiaryFieldComponent;

BeneficiaryFieldV2.displayName = 'BeneficiaryFieldV2';

export default BeneficiaryFieldV2;
