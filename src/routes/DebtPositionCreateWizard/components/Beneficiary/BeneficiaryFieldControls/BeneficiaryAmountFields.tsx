import { FieldValues } from 'react-hook-form';
import { Grid } from '@mui/material';
import { AmountField } from '../BeneficiaryFieldComponents';
import { buildBeneficiaryFieldPath } from '../../../../../utils/BeneficiaryFieldHelpers';
import { BeneficiaryFieldsProps } from '../../../../../models/BeneficiaryFieldTypes';
import { BeneficiaryControlledField } from './BeneficiaryControlledField';

/**
 * Componente per il gruppo di campi relativi all'importo del beneficiario
 */
export function BeneficiaryAmountFields<T extends FieldValues>({
  control,
  index,
  fieldNamePrefix,
  validationContext,
  disabled,
  fields,
  validators,
  trigger,
  t
}: Readonly<
  Pick<
    BeneficiaryFieldsProps<T>,
    | 'control'
    | 'index'
    | 'fieldNamePrefix'
    | 'validationContext'
    | 'disabled'
    | 'fields'
    | 'validators'
    | 'trigger'
    | 't'
  >
>) {
  return (
    <Grid item xs={12}>
      <BeneficiaryControlledField<T>
        name={buildBeneficiaryFieldPath<T, 'amount'>(
          fieldNamePrefix,
          index,
          'amount'
        )}
        control={control}
        rules={{
          required: t(
            'debtPositionCreateWizard.step3.beneficiary.amount.required'
          ),
          validate: {
            isValidAmount: (value: string) => {
              return validators.validateSingleBeneficiary(value, fields.length);
            },
            totalAmount: () => {
              return validators.validateTotalAmount();
            }
          }
        }}
        renderField={({ field, fieldState }) => {
          // Se c'è un errore nel campo, lo segnaliamo
          const hasAmountError = fieldState?.error ? true : false;

          return (
            <AmountField
              field={field}
              t={t}
              disabled={disabled}
              context={{
                ...validationContext,
                // Forza isSubmitted a true se c'è un errore, anche se il form non è stato inviato
                isSubmitted: validationContext.isSubmitted || hasAmountError
              }}
              index={index}
              fields={fields}
              trigger={trigger}
              fieldNamePrefix={fieldNamePrefix}
            />
          );
        }}
      />
    </Grid>
  );
}
