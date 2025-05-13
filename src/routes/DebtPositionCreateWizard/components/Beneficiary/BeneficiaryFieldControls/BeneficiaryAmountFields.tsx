import { FieldValues } from 'react-hook-form';
import { Grid } from '@mui/material';
import { AmountField } from '../BeneficiaryFieldComponents';
import { buildBeneficiaryFieldPath } from '../../../../../utils/BeneficiaryFieldHelpers';
import { BeneficiaryFieldsProps } from '../../../../../models/BeneficiaryFieldTypes';
import { BeneficiaryControlledField } from './BeneficiaryControlledField';

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
        renderField={({ field, fieldState }) => {
          const hasAmountError = fieldState?.error ? true : false;
          return (
            <AmountField
              field={field}
              t={t}
              disabled={disabled}
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
