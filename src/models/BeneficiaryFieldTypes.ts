import {
  Control,
  FieldErrors,
  FieldValues,
  UseFormGetValues,
  UseFormTrigger
} from 'react-hook-form';
import { BeneficiaryValidationContext } from '../utils/BeneficiaryFieldHelpers';

// Props comuni per i componenti del campo beneficiario
export type BeneficiaryFieldsProps<T extends FieldValues> = {
  control: Control<T>;
  index: number;
  validationContext: BeneficiaryValidationContext<T>;
  fieldNamePrefix: string;
  disabled: boolean;
  getValues: UseFormGetValues<T>;
  trigger: UseFormTrigger<T>;
  errors: FieldErrors<T>;
  validators: ReturnType<
    typeof import('../utils/fieldValidation').createBeneficiaryValidators
  >;
  fieldValidators: ReturnType<
    typeof import('../utils/fieldValidation').createBeneficiaryFieldValidators
  >;
  fields: Array<Record<'id', string>>;
  t: (key: string) => string;
};
