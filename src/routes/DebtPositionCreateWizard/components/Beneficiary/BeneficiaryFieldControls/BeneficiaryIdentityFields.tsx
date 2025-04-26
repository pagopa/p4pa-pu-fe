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

/**
 * Component for the group of fields related to the beneficiary's identity
 */
export function BeneficiaryIdentityFields<T extends FieldValues>({
  control,
  index,
  fieldNamePrefix,
  validationContext,
  disabled,
  t
}: Readonly<
  Pick<
    BeneficiaryFieldsProps<T>,
    | 'control'
    | 'index'
    | 'fieldNamePrefix'
    | 'validationContext'
    | 'disabled'
    | 't'
  >
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
              disabled={disabled}
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
              'debtPositionCreateWizard.step3.beneficiary.taxCode.required'
            ),
            validate: {
              taxCodeFormat: (value: string) =>
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
              disabled={disabled}
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
          rules={{
            required: t(
              'debtPositionCreateWizard.step3.beneficiary.remittance.required'
            ),
            validate: {
              remittanceFormat: (value: string) =>
                import('../../../../../utils/fieldValidation')
                  .then((module) => module.createBeneficiaryFieldValidators(t))
                  .then((validators) => validators.validateRemittance(value))
            }
          }}
          renderField={({ field }) => (
            <RemittanceField
              field={field}
              t={t}
              disabled={disabled}
              context={validationContext}
            />
          )}
        />
      </Grid>
    </>
  );
}
