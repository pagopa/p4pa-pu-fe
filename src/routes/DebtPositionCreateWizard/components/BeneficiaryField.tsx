import { useTranslation } from 'react-i18next';
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
import { BeneficiaryValidationContext } from '../../../utils/BeneficiaryFieldHelpers';
import {
  BeneficiaryIdentityFields,
  BeneficiaryAmountFields,
  BeneficiaryPaymentFields,
  BeneficiaryClassificationFields
} from './BeneficiaryFieldGroup';
import { useBeneficiaryManagement } from '../../../hooks/useBeneficiaryManagement';

// ===== TYPES =====
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

/**
 * Componente principale per la gestione dei beneficiari
 * Permette l'aggiunta, rimozione e validazione di fino a 4 beneficiari
 */
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
  const { t } = useTranslation();

  // Utilizziamo il nostro hook personalizzato per separare la logica dall'UI
  const {
    fields,
    validators,
    fieldValidators,
    MAX_BENEFICIARIES,
    existingBeneficiaries,
    wasSubmittedRef,
    addBeneficiary,
    removeBeneficiary
  } = useBeneficiaryManagement<T>({
    control,
    fieldNamePrefix,
    isSubmitted,
    getValues,
    trigger,
    totalAmount,
    onToggleMultibeneficiary,
    onBeneficiariesChange
  });

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
    field: Record<'id', string>,
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
  const renderBeneficiary = (field: Record<'id', string>, index: number) => {
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
            fields={fields}
            validators={validators}
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
            fieldValidators={fieldValidators}
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
    <Box>{fields.map((field, index) => renderBeneficiary(field, index))}</Box>
  );
}

export default BeneficiaryField;
