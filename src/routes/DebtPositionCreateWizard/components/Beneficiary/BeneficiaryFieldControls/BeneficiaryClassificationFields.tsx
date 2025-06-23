import { FieldValues } from 'react-hook-form';
import { Grid } from '@mui/material';
import { TaxonomyCodeField } from '../BeneficiaryFieldComponents';
import { buildBeneficiaryFieldPath } from '../../../../../utils/BeneficiaryFieldHelpers';
import { BeneficiaryFieldsProps } from '../../../../../models/BeneficiaryFieldTypes';
import { BeneficiaryControlledField } from './BeneficiaryControlledField';

export function BeneficiaryClassificationFields<T extends FieldValues>({
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
    <Grid item xs={12} data-testid="beneficiary-classification-fields">
      <BeneficiaryControlledField<T>
        name={buildBeneficiaryFieldPath<T, 'taxonomyCode'>(
          fieldNamePrefix,
          index,
          'taxonomyCode'
        )}
        control={control}
        rules={{
          required: t(
            'debtPositionCreateWizard.step3.beneficiary.taxonomyCode.required'
          )
        }}
        renderField={({ field }) => (
          <TaxonomyCodeField
            field={field}
            t={t}
            disabled={disabled || beneficiaryReadonly?.taxonomyCode}
            context={validationContext}
          />
        )}
      />
    </Grid>
  );
}
