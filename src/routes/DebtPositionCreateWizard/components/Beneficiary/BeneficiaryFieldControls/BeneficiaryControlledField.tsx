import {
  Controller,
  FieldValues,
  ControllerRenderProps,
  ControllerFieldState,
  Path
} from 'react-hook-form';
import { BeneficiaryFieldsProps } from '../../../../../models/BeneficiaryFieldTypes';

export function BeneficiaryControlledField<T extends FieldValues>({
  name,
  control,
  rules,
  renderField
}: {
  readonly name: Path<T>;
  readonly control: BeneficiaryFieldsProps<T>['control'];
  readonly rules?: Record<string, unknown>;
  readonly renderField: (props: {
    readonly field: ControllerRenderProps<T, Path<T>>;
    readonly fieldState?: ControllerFieldState;
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
