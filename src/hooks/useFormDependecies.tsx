import {
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
  useWatch
} from 'react-hook-form';
import { useEffect, useRef } from 'react';

export type FormDependencies<T extends FieldValues> = {
  form: UseFormReturn<T>;
  fieldOrder: Array<Path<T>>;
};

/**
 * This hook will reset all fields after the changed field
 * and generate keys for each field
 *
 * @param form use-hook-form form
 * @param fieldOrder order priority of the fields
 *
 * @returns keys to reset mui select on value changes
 **/
export const useFormDependencies = <T extends FieldValues>({
  form,
  fieldOrder
}: FormDependencies<T>) => {
  const { control } = form;

  // Watch all dependent fields in order
  const values = useWatch({ control, name: fieldOrder });

  // Keep previous values to detect changes
  const prevValuesRef = useRef<typeof values>(values);

  useEffect(() => {
    const prev = prevValuesRef.current;
    const changedIndex = values.findIndex((v, i) => v !== prev[i]);

    if (changedIndex >= 0) {
      // explicitly clear dependent fields, ignoring default values
      fieldOrder.slice(changedIndex + 1).forEach((fieldName) => {
        form.setValue(fieldName, '' as PathValue<T, Path<T>>, {
          shouldDirty: false,
          shouldValidate: true
        });
      });
    }
    prevValuesRef.current = values;
  }, [values, form, fieldOrder]);

  const keys = fieldOrder.reduce<Record<string, string>>(
    (acc, fieldName, index) => ({
      ...acc,
      [fieldName]: `${fieldName}-${values[index] ?? index}`
    }),
    {}
  ) as Record<Path<T>, string>;

  return { keys };
};
