import { FieldValues, Path } from 'react-hook-form';
import { BeneficiaryValidationContext as BaseValidationContext } from '../models/paymentTypes';

// Helper per costruire un path tipizzato per i campi del form
export function buildBeneficiaryFieldPath<
  T extends FieldValues,
  K extends string
>(fieldNamePrefix: string, index: number, field: K): Path<T> {
  return `${fieldNamePrefix}.${index}.${field}` as Path<T>;
}

// Tipo personalizzato per la validazione dei beneficiari, ora basato sul tipo in paymentTypes
export type BeneficiaryValidationContext<T extends FieldValues> =
  BaseValidationContext<T>;
