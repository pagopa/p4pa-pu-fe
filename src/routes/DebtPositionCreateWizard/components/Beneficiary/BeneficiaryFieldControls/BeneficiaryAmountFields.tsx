import type { FieldValues } from 'react-hook-form';
import { AmountField } from '../BeneficiaryFieldComponents';
import { buildBeneficiaryFieldPath } from '../../../../../utils/BeneficiaryFieldHelpers';
import type { BeneficiaryFieldsProps } from '../../../../../models/BeneficiaryFieldTypes';
import { BeneficiaryControlledField } from './BeneficiaryControlledField';
import Grid from '@mui/material/Grid';

/**
 * Component for the beneficiary amount fields group
 */
export function BeneficiaryAmountFields<T extends FieldValues>({
  control,
  index,
  fieldNamePrefix,
  validationContext,
  disabled,
  fields,
  trigger,
  t,
  beneficiaryReadonly
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
  > & {
    beneficiaryReadonly?: {
      entityName?: boolean;
      amount?: boolean;
      taxCode?: boolean;
      remittance?: boolean;
      iban?: boolean;
      taxonomyCode?: boolean;
    };
  }
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
        renderField={({ field, fieldState }) => {
          const hasAmountError = fieldState?.error ? true : false;
          return (
            <AmountField
              field={field}
              t={t}
              disabled={disabled || beneficiaryReadonly?.amount}
              context={{
                ...validationContext,
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
