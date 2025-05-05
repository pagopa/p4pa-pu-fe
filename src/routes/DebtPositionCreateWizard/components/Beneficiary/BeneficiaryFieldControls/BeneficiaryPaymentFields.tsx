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
  // getValues,
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
                // const postalAccount = getValues(
                //   buildBeneficiaryFieldPath<T, 'postalAccount'>(
                //     fieldNamePrefix,
                //     index,
                //     'postalAccount'
                //   )
                // );

                const result = fieldValidators.validatePaymentMethod(value);

                // Se uno dei due campi ha un valore, non mostrare errori
                // if (
                //   (value && value.trim() !== '') ||
                //   (postalAccount && postalAccount.trim() !== '')
                // ) {

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

      {/* Postal Account field - Temporarily disabled
      <Grid item xs={12}>
        <BeneficiaryControlledField<T>
          name={buildBeneficiaryFieldPath<T, 'postalAccount'>(
            fieldNamePrefix,
            index,
            'postalAccount'
          )}
          control={control}
          rules={{
            validate: {
              postalAccountFormat: fieldValidators.validatePostalAccount,
              paymentMethod: (value: string) => {
                const iban = getValues(
                  buildBeneficiaryFieldPath<T, 'iban'>(
                    fieldNamePrefix,
                    index,
                    'iban'
                  )
                );

                const result = fieldValidators.validatePaymentMethod(
                  iban,
                  value
                );

                // Se uno dei due campi ha un valore, non mostrare errori
                if (
                  (value && value.trim() !== '') ||
                  (iban && iban.trim() !== '')
                ) {
                  return undefined;
                }

                return result;
              }
            }
          }}
          renderField={({ field }) => (
            <PostalAccountField
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
      */}
    </>
  );
}
