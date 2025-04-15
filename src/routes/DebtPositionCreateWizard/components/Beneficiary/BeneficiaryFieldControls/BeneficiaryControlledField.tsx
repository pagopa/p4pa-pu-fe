import {
  Controller,
  FieldValues,
  ControllerRenderProps,
  ControllerFieldState,
  Path
} from 'react-hook-form';
import { BeneficiaryFieldsProps } from '../../../../../models/BeneficiaryFieldTypes';

/**
 * Componente wrapper per semplificare l'uso di Controller con i campi beneficiario
 */
export function BeneficiaryControlledField<T extends FieldValues>({
  name,
  control,
  rules,
  renderField
}: {
  name: Path<T>;
  control: BeneficiaryFieldsProps<T>['control'];
  rules?: Record<string, unknown>;
  renderField: (props: {
    field: ControllerRenderProps<T, Path<T>>;
    fieldState?: ControllerFieldState;
  }) => JSX.Element;
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => renderField({ field, fieldState })}
    />
  );
}
