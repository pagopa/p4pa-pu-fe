import { FieldValues } from 'react-hook-form';
import { Grid } from '@mui/material';
import { IBANField } from '../BeneficiaryFieldComponents';
import { buildBeneficiaryFieldPath } from '../../../../../utils/BeneficiaryFieldHelpers';
import { BeneficiaryFieldsProps } from '../../../../../models/BeneficiaryFieldTypes';
import { BeneficiaryControlledField } from './BeneficiaryControlledField';

export function BeneficiaryPaymentFields<T extends FieldValues>({
  control,
  index,
  fieldNamePrefix,
  validationContext,
  disabled,
  trigger,
  errors,
  fieldValidators,
  t
}: Readonly<
  Pick<
    BeneficiaryFieldsProps<T>,
    | 'control'
    | 'index'
    | 'fieldNamePrefix'
    | 'validationContext'
    | 'disabled'
    | 'getValues'
    | 'trigger'
    | 'errors'
    | 'fieldValidators'
    | 't'
  >
>) {
  return (
    <>
      <Grid item xs={12}>
        <BeneficiaryControlledField<T>
          name={buildBeneficiaryFieldPath<T, 'iban'>(
            fieldNamePrefix,
            index,
            'iban'
          )}
          control={control}
          rules={{
            validate: {
              ibanFormat: fieldValidators.validateIBAN,
              paymentMethod: (value: string) => {
                const result = fieldValidators.validatePaymentMethod(value);

                // Se l'IBAN ha un valore, non mostrare errori
                if (value && value.trim() !== '') {
                  return undefined;
                }

                return result;
              }
            }
          }}
          renderField={({ field }) => (
            <IBANField
              field={field}
              t={t}
              disabled={disabled}
              context={validationContext}
              index={index}
              trigger={trigger}
              fieldNamePrefix={fieldNamePrefix}
              errors={errors}
            />
          )}
        />
      </Grid>
    </>
  );
}
