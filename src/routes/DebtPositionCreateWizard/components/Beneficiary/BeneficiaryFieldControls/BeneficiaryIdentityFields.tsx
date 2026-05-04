import { FieldValues } from 'react-hook-form';
import { Grid } from '@mui/material';
import {
  EntityNameField,
  TaxCodeField,
  RemittanceField
} from '../BeneficiaryFieldComponents';
import { buildBeneficiaryFieldPath } from '../../../../../utils/BeneficiaryFieldHelpers';
import { BeneficiaryFieldsProps } from '../../../../../models/BeneficiaryFieldTypes';
import { BeneficiaryControlledField } from './BeneficiaryControlledField';

export function BeneficiaryIdentityFields<T extends FieldValues>({
  control,
  index,
  fieldNamePrefix,
  validationContext,
  disabled,
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
    <>
      <Grid item xs={12}>
        <BeneficiaryControlledField<T>
          name={buildBeneficiaryFieldPath<T, 'entityName'>(
            fieldNamePrefix,
            index,
            'entityName'
          )}
          control={control}
          rules={{
            required: t(
              'debtPositionCreateWizard.step3.beneficiary.entityName.required'
            )
          }}
          renderField={({ field }) => (
            <EntityNameField
              field={field}
              t={t}
              disabled={disabled || beneficiaryReadonly?.entityName}
              context={validationContext}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <BeneficiaryControlledField<T>
          name={buildBeneficiaryFieldPath<T, 'taxCode'>(
            fieldNamePrefix,
            index,
            'taxCode'
          )}
          control={control}
          rules={{
            required: t(
              'debtPositionCreateWizard.step3.beneficiary.vat.required'
            ),
            validate: {
              vatFormat: (value: string) =>
                import('../../../../../utils/fieldValidation')
                  .then((module) => module.createBeneficiaryFieldValidators(t))
                  .then((validators) =>
                    validators.validateBeneficiaryTaxCode(value)
                  )
            }
          }}
          renderField={({ field }) => (
            <TaxCodeField
              field={field}
              t={t}
              disabled={disabled || beneficiaryReadonly?.taxCode}
              context={validationContext}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <BeneficiaryControlledField<T>
          name={buildBeneficiaryFieldPath<T, 'remittance'>(
            fieldNamePrefix,
            index,
            'remittance'
          )}
          control={control}
          renderField={({ field }) => (
            <RemittanceField
              field={field}
              t={t}
              disabled={disabled || beneficiaryReadonly?.remittance}
              context={validationContext}
            />
          )}
        />
      </Grid>
    </>
  );
}
