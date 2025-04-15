import { FieldValues } from 'react-hook-form';
import { Grid } from '@mui/material';
import { TaxonomyCodeField } from '../BeneficiaryFieldComponents';
import { buildBeneficiaryFieldPath } from '../../../../../utils/BeneficiaryFieldHelpers';
import { BeneficiaryFieldsProps } from '../../../../../models/BeneficiaryFieldTypes';
import { BeneficiaryControlledField } from './BeneficiaryControlledField';

/**
 * Componente per il gruppo di campi relativi alla classificazione del beneficiario
 */
export function BeneficiaryClassificationFields<T extends FieldValues>({
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
    <Grid item xs={12}>
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
            disabled={disabled}
            context={validationContext}
          />
        )}
      />
    </Grid>
  );
}
