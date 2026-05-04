import { FieldValues, Path } from 'react-hook-form';
import { BeneficiaryValidationContext as BaseValidationContext } from '../models/paymentTypes';

// Helper to build a typed path for form fields
export function buildBeneficiaryFieldPath<
  T extends FieldValues,
  K extends string
>(fieldNamePrefix: string, index: number, field: K): Path<T> {
  return `${fieldNamePrefix}.${index}.${field}` as Path<T>;
}

// Custom type for beneficiary validation, now based on the type in paymentTypes
export type BeneficiaryValidationContext<T extends FieldValues> =
  BaseValidationContext<T>;
