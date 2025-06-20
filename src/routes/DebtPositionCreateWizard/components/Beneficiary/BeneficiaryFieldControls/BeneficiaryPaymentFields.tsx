import { FieldValues } from 'react-hook-form';
import { Grid } from '@mui/material';
import { IBANField, PostalIbanField } from '../BeneficiaryFieldComponents';
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
    | 'getValues'
    | 'trigger'
    | 'errors'
    | 'fieldValidators'
    | 't'
  > & {
    beneficiaryReadonly?: {
      entityName?: boolean;
      amount?: boolean;
      taxCode?: boolean;
      remittance?: boolean;
      iban?: boolean;
      postalIban?: boolean;
      taxonomyCode?: boolean;
    };
  }
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
              disabled={disabled || beneficiaryReadonly?.iban}
              context={validationContext}
              index={index}
              trigger={trigger}
              fieldNamePrefix={fieldNamePrefix}
              errors={errors}
            />
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <BeneficiaryControlledField<T>
          name={buildBeneficiaryFieldPath<T, 'postalIban'>(
            fieldNamePrefix,
            index,
            'postalIban'
          )}
          control={control}
          rules={{
            validate: {
              postalIbanFormat: fieldValidators.validatePostalIban
            }
          }}
          renderField={({ field }) => (
            <PostalIbanField
              field={field}
              t={t}
              disabled={disabled || beneficiaryReadonly?.postalIban}
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
